import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { clients, invoices, paymentAuditEvents, paymentSchedules, paymentTermAmendments, payments, projects } from "@/db/schema";
import { ApiError } from "@/lib/api/route-boundaries";

export const PAYMENT_METHODS = ["mpesa", "bank_transfer", "cash", "card", "cheque", "other"] as const;
export const PAYMENT_STATUSES = ["pending_verification", "confirmed", "failed", "cancelled", "reversed", "refunded"] as const;
type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

function clean(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseAmount(value: unknown) {
  const amount = Number(value);
  return Number.isSafeInteger(amount) ? amount : null;
}

function parseDate(value: unknown, fallback = new Date()) {
  if (value === undefined || value === null || value === "") return fallback;
  const date = new Date(String(value));
  return Number.isFinite(date.getTime()) ? date : null;
}

function assertMethod(value: unknown) {
  const method = clean(value)?.toLowerCase();
  if (!method || !PAYMENT_METHODS.includes(method as (typeof PAYMENT_METHODS)[number])) {
    throw new ApiError("Invalid payment method", 400, { allowedMethods: PAYMENT_METHODS });
  }
  return method;
}

function assertStatus(value: unknown): PaymentStatus {
  const status = clean(value)?.toLowerCase() ?? "pending_verification";
  if (!PAYMENT_STATUSES.includes(status as PaymentStatus)) {
    throw new ApiError("Invalid payment status", 400, { allowedStatuses: PAYMENT_STATUSES });
  }
  return status as PaymentStatus;
}

async function getInvoiceContext(userId: string, invoiceId: string) {
  const result = await db.select({ invoice: invoices, client: clients, project: projects })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .leftJoin(projects, eq(projects.clientId, clients.id))
    .where(and(eq(invoices.id, invoiceId), eq(invoices.creatorId, userId)))
    .limit(1);
  const record = result[0];
  if (!record) throw new ApiError("Invoice not found", 404);
  return record;
}

function settledStatuses() {
  return ["confirmed"] as const;
}

export async function getInvoicePaymentSummary(userId: string, invoiceId: string) {
  const { invoice } = await getInvoiceContext(userId, invoiceId);
  const records = await db.select().from(payments)
    .where(and(eq(payments.invoiceId, invoiceId), eq(payments.creatorId, userId)))
    .orderBy(desc(payments.paidAt));
  const confirmed = records.filter((payment) => settledStatuses().includes(payment.status as "confirmed"));
  const confirmedAmount = confirmed.reduce((sum, payment) => sum + payment.amount, 0);
  const outstanding = Math.max(invoice.total - confirmedAmount, 0);
  const progress = invoice.total > 0 ? Math.min(100, Math.round((confirmedAmount / invoice.total) * 100)) : 0;
  const pendingAmount = records.filter((payment) => payment.status === "pending_verification").reduce((sum, payment) => sum + payment.amount, 0);
  const paymentStatus = outstanding === 0 ? "paid" : pendingAmount > 0 && confirmedAmount === 0 ? "pending_verification" : confirmedAmount > 0 ? "partially_paid" : invoice.dueDate && invoice.dueDate < new Date() ? "overdue" : "unpaid";
  return { invoice, payments: records, confirmedAmount, pendingAmount, outstanding, progress, paymentStatus };
}

export async function listPaymentsForCreator(userId: string, filters: { status?: string | null; invoiceId?: string | null; clientId?: string | null }) {
  const conditions = [eq(payments.creatorId, userId)];
  if (filters.status) conditions.push(eq(payments.status, assertStatus(filters.status)));
  if (filters.invoiceId) conditions.push(eq(payments.invoiceId, filters.invoiceId));
  if (filters.clientId) conditions.push(eq(payments.clientId, filters.clientId));
  return db.select({ payment: payments, invoice: invoices, client: clients })
    .from(payments)
    .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
    .innerJoin(clients, eq(payments.clientId, clients.id))
    .where(and(...conditions))
    .orderBy(desc(payments.createdAt));
}

export async function recordPayment(userId: string, payload: Record<string, unknown>) {
  const invoiceId = clean(payload.invoiceId);
  if (!invoiceId) throw new ApiError("invoiceId is required", 400);
  const { invoice, client, project } = await getInvoiceContext(userId, invoiceId);
  const amount = parseAmount(payload.amount);
  if (!amount || amount <= 0) throw new ApiError("Payment amount must be a positive integer minor-unit amount", 400);
  const currency = clean(payload.currency)?.toUpperCase() ?? invoice.currency.toUpperCase();
  if (currency !== invoice.currency.toUpperCase()) throw new ApiError("Payment currency must match the invoice currency", 400);
  const status = assertStatus(payload.status);
  const paidAt = parseDate(payload.paidAt);
  if (!paidAt) throw new ApiError("Payment date is invalid", 400);
  const existing = await db.select({ amount: payments.amount }).from(payments).where(and(eq(payments.invoiceId, invoiceId), eq(payments.creatorId, userId), eq(payments.status, "confirmed")));
  const confirmedAmount = existing.reduce((sum, payment) => sum + payment.amount, 0);
  if (status === "confirmed" && confirmedAmount + amount > invoice.total) throw new ApiError("Payment exceeds the available invoice balance", 409);
  if (!client) throw new ApiError("Invoice client is missing", 409);
  const reference = clean(payload.reference) ?? `PAY-${Date.now().toString(36).toUpperCase()}`;
  const [payment] = await db.insert(payments).values({
    creatorId: userId,
    clientId: client.id,
    invoiceId,
    projectId: project?.id ?? null,
    reference,
    amount,
    currency,
    method: assertMethod(payload.method),
    origin: "manual",
    status,
    paidAt,
    confirmedAt: status === "confirmed" ? new Date() : null,
    confirmedBy: status === "confirmed" ? userId : null,
    transactionReference: clean(payload.transactionReference),
    evidenceReference: clean(payload.evidenceReference),
    notes: clean(payload.notes),
  }).returning();
  if (!payment) throw new ApiError("Payment could not be recorded", 500);
  await db.insert(paymentAuditEvents).values({ creatorId: userId, paymentId: payment.id, eventType: "created", actorId: userId, metadata: { status, amount, currency } });
  return payment;
}

export async function verifyPayment(userId: string, paymentId: string) {
  const current = await db.select().from(payments).where(and(eq(payments.id, paymentId), eq(payments.creatorId, userId))).limit(1);
  const payment = current[0];
  if (!payment) throw new ApiError("Payment not found", 404);
  if (payment.status !== "pending_verification") throw new ApiError("Only pending payments can be verified", 409);
  const summary = await getInvoicePaymentSummary(userId, payment.invoiceId);
  if (summary.confirmedAmount + payment.amount > summary.invoice.total) throw new ApiError("Payment exceeds the available invoice balance", 409);
  const [updated] = await db.update(payments).set({ status: "confirmed", confirmedAt: new Date(), confirmedBy: userId, updatedAt: new Date() }).where(and(eq(payments.id, paymentId), eq(payments.creatorId, userId))).returning();
  await db.insert(paymentAuditEvents).values({ creatorId: userId, paymentId, eventType: "verified", actorId: userId, metadata: {} });
  return updated;
}

export async function listPaymentAudit(userId: string, invoiceId: string) {
  await getInvoiceContext(userId, invoiceId);
  return db.select({ audit: paymentAuditEvents, payment: payments })
    .from(paymentAuditEvents)
    .innerJoin(payments, eq(paymentAuditEvents.paymentId, payments.id))
    .where(and(eq(paymentAuditEvents.creatorId, userId), eq(payments.invoiceId, invoiceId)))
    .orderBy(desc(paymentAuditEvents.createdAt));
}

export async function listSchedules(userId: string, invoiceId: string) {
  await getInvoiceContext(userId, invoiceId);
  return db.select().from(paymentSchedules).where(and(eq(paymentSchedules.creatorId, userId), eq(paymentSchedules.invoiceId, invoiceId))).orderBy(paymentSchedules.dueDate);
}

export async function saveSchedule(userId: string, invoiceId: string, payload: Record<string, unknown>, scheduleId?: string) {
  const { invoice, client, project } = await getInvoiceContext(userId, invoiceId);
  const label = clean(payload.label);
  const amount = parseAmount(payload.amount);
  const dueDate = parseDate(payload.dueDate);
  if (!label || !amount || amount <= 0 || !dueDate) throw new ApiError("Label, positive amount, and valid due date are required", 400);
  const values = { creatorId: userId, clientId: client!.id, invoiceId, projectId: project?.id ?? null, label, amount, currency: invoice.currency, dueDate, milestone: clean(payload.milestone), status: clean(payload.status) ?? "scheduled", notes: clean(payload.notes), updatedAt: new Date() };
  if (scheduleId) {
    const [updated] = await db.update(paymentSchedules).set(values).where(and(eq(paymentSchedules.id, scheduleId), eq(paymentSchedules.creatorId, userId), eq(paymentSchedules.invoiceId, invoiceId))).returning();
    if (!updated) throw new ApiError("Payment schedule not found", 404);
    return updated;
  }
  const [created] = await db.insert(paymentSchedules).values(values).returning();
  return created;
}

export async function deleteSchedule(userId: string, invoiceId: string, scheduleId: string) {
  await getInvoiceContext(userId, invoiceId);
  const [deleted] = await db.delete(paymentSchedules).where(and(eq(paymentSchedules.id, scheduleId), eq(paymentSchedules.creatorId, userId), eq(paymentSchedules.invoiceId, invoiceId))).returning();
  if (!deleted) throw new ApiError("Payment schedule not found", 404);
  return { deleted: true, id: deleted.id };
}

export async function listTermAmendments(userId: string, invoiceId: string) {
  await getInvoiceContext(userId, invoiceId);
  return db.select().from(paymentTermAmendments).where(and(eq(paymentTermAmendments.creatorId, userId), eq(paymentTermAmendments.invoiceId, invoiceId))).orderBy(desc(paymentTermAmendments.agreementDate));
}

export async function createTermAmendment(userId: string, invoiceId: string, payload: Record<string, unknown>) {
  await getInvoiceContext(userId, invoiceId);
  const newTerms = clean(payload.newTerms);
  const agreementDate = parseDate(payload.agreementDate);
  if (!newTerms || !agreementDate) throw new ApiError("New terms and a valid agreement date are required", 400);
  const [amendment] = await db.insert(paymentTermAmendments).values({ creatorId: userId, invoiceId, previousTerms: clean(payload.previousTerms), newTerms, agreementDate, evidenceReference: clean(payload.evidenceReference), notes: clean(payload.notes) }).returning();
  return amendment;
}

export async function refundPayment(userId: string, paymentId: string, reason: string) {
  const payment = (await db.select().from(payments).where(and(eq(payments.id, paymentId), eq(payments.creatorId, userId))).limit(1))[0];
  if (!payment) throw new ApiError("Payment not found", 404);
  if (payment.status !== "confirmed") throw new ApiError("Only confirmed payments can be refunded", 409);
  const cleanedReason = clean(reason);
  if (!cleanedReason) throw new ApiError("A refund reason is required", 400);
  const [updated] = await db.update(payments).set({ status: "refunded", reversalReason: cleanedReason, updatedAt: new Date() }).where(and(eq(payments.id, paymentId), eq(payments.creatorId, userId), eq(payments.status, "confirmed"))).returning();
  await db.insert(paymentAuditEvents).values({ creatorId: userId, paymentId, eventType: "refunded", actorId: userId, metadata: { reason: cleanedReason, policy: "full_payment_refund_only" } });
  return updated;
}

export async function reversePayment(userId: string, paymentId: string, reason: string) {
  const payment = (await db.select().from(payments).where(and(eq(payments.id, paymentId), eq(payments.creatorId, userId))).limit(1))[0];
  if (!payment) throw new ApiError("Payment not found", 404);
  if (!["confirmed", "pending_verification"].includes(payment.status)) throw new ApiError("Payment cannot be reversed in its current state", 409);
  const cleanedReason = clean(reason);
  if (!cleanedReason) throw new ApiError("A reversal reason is required", 400);
  const [updated] = await db.update(payments).set({ status: "reversed", reversalReason: cleanedReason, updatedAt: new Date() }).where(and(eq(payments.id, paymentId), eq(payments.creatorId, userId))).returning();
  await db.insert(paymentAuditEvents).values({ creatorId: userId, paymentId, eventType: "reversed", actorId: userId, metadata: { reason: cleanedReason } });
  return updated;
}

import { and, desc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";

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
  const amount = typeof value === "number" ? value : Number(String(value ?? ""));
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
  const status = clean(value)?.toLowerCase() ?? "confirmed";
  if (!PAYMENT_STATUSES.includes(status as PaymentStatus)) {
    throw new ApiError("Invalid payment status", 400, { allowedStatuses: PAYMENT_STATUSES });
  }
  return status as PaymentStatus;
}

async function getClient(userId: string, clientId: string) {
  const client = await db.query.clients.findFirst({ where: and(eq(clients.id, clientId), eq(clients.creatorId, userId)) });
  if (!client) throw new ApiError("Client not found", 404);
  return client;
}

async function getProject(userId: string, projectId: string | null, clientId: string) {
  if (!projectId) return null;
  const project = await db.query.projects.findFirst({ where: and(eq(projects.id, projectId), eq(projects.creatorId, userId)) });
  if (!project) throw new ApiError("Project not found", 404);
  if (project.clientId && project.clientId !== clientId) throw new ApiError("Project does not belong to the selected client", 409);
  return project;
}

async function getInvoiceContext(userId: string, invoiceId: string) {
  const result = await db.select({ invoice: invoices, client: clients })
    .from(invoices)
    .innerJoin(clients, eq(invoices.clientId, clients.id))
    .where(and(eq(invoices.id, invoiceId), eq(invoices.creatorId, userId), eq(clients.creatorId, userId)))
    .limit(1);
  const record = result[0];
  if (!record) throw new ApiError("Invoice not found", 404);
  return record;
}

function confirmedAmount(records: Array<{ amount: number; status: string }>) {
  return records.filter((payment) => payment.status === "confirmed").reduce((sum, payment) => sum + payment.amount, 0);
}

async function syncInvoiceStatus(tx: any, invoiceId: string, userId: string) {
  const invoice = await tx.query.invoices.findFirst({ where: and(eq(invoices.id, invoiceId), eq(invoices.creatorId, userId)) });
  if (!invoice || invoice.status === "cancelled") return;
  const records = await tx.select({ amount: payments.amount, status: payments.status }).from(payments).where(and(eq(payments.invoiceId, invoiceId), eq(payments.creatorId, userId)));
  const paid = confirmedAmount(records);
  const nextStatus = paid >= invoice.total && invoice.total > 0 ? "paid" : invoice.status === "paid" ? "sent" : invoice.status;
  if (nextStatus !== invoice.status) await tx.update(invoices).set({ status: nextStatus, updatedAt: new Date() }).where(and(eq(invoices.id, invoiceId), eq(invoices.creatorId, userId)));
}

export async function getInvoicePaymentSummary(userId: string, invoiceId: string) {
  const { invoice } = await getInvoiceContext(userId, invoiceId);
  const records = await db.select().from(payments).where(and(eq(payments.invoiceId, invoiceId), eq(payments.creatorId, userId))).orderBy(desc(payments.paidAt));
  const paid = confirmedAmount(records);
  const pendingAmount = records.filter((payment) => payment.status === "pending_verification").reduce((sum, payment) => sum + payment.amount, 0);
  const outstanding = Math.max(invoice.total - paid, 0);
  const progress = invoice.total > 0 ? Math.min(100, Math.round((paid / invoice.total) * 100)) : 0;
  const paymentStatus = outstanding === 0 ? "paid" : paid > 0 ? "partially_paid" : pendingAmount > 0 ? "pending_verification" : invoice.dueDate && invoice.dueDate < new Date() ? "overdue" : "unpaid";
  return { invoice, payments: records, confirmedAmount: paid, pendingAmount, outstanding, progress, paymentStatus };
}

export async function listPaymentsForCreator(userId: string, filters: { status?: string | null; invoiceId?: string | null; clientId?: string | null; method?: string | null; search?: string | null; from?: string | null; to?: string | null }) {
  const conditions = [eq(payments.creatorId, userId)];
  if (filters.status) conditions.push(eq(payments.status, assertStatus(filters.status)));
  if (filters.method) conditions.push(eq(payments.method, assertMethod(filters.method)));
  if (filters.invoiceId) conditions.push(eq(payments.invoiceId, filters.invoiceId));
  if (filters.clientId) conditions.push(eq(payments.clientId, filters.clientId));
  if (filters.from) { const date = parseDate(filters.from); if (date) conditions.push(gte(payments.paidAt, date)); }
  if (filters.to) { const date = parseDate(filters.to); if (date) { date.setHours(23, 59, 59, 999); conditions.push(lte(payments.paidAt, date)); } }
  const search = clean(filters.search);
  const searchCondition = search ? or(ilike(clients.name, `%${search}%`), ilike(clients.company, `%${search}%`), ilike(payments.reference, `%${search}%`), ilike(payments.transactionReference, `%${search}%`), ilike(invoices.invoiceNumber, `%${search}%`)) : undefined;
  if (searchCondition) conditions.push(searchCondition);
  return db.select({ payment: payments, invoice: invoices, client: clients })
    .from(payments)
    .innerJoin(clients, eq(payments.clientId, clients.id))
    .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
    .where(and(...conditions))
    .orderBy(desc(payments.paidAt), desc(payments.createdAt));
}

export async function getPaymentSummary(userId: string, now = new Date()) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const [monthly, invoiceRows] = await Promise.all([
    db.select({ amount: payments.amount, currency: payments.currency, status: payments.status })
      .from(payments).where(and(eq(payments.creatorId, userId), gte(payments.paidAt, monthStart), lte(payments.paidAt, monthEnd))),
    db.select({ invoice: invoices }).from(invoices).where(and(eq(invoices.creatorId, userId), sql`${invoices.status} not in ('cancelled', 'void')`)),
  ]);
  const totalsByCurrency: Record<string, number> = {};
  for (const payment of monthly) if (payment.status === "confirmed") totalsByCurrency[payment.currency] = (totalsByCurrency[payment.currency] ?? 0) + payment.amount;
  const invoiceIds = invoiceRows.map(({ invoice }) => invoice.id);
  const allPayments = invoiceIds.length ? await db.select({ invoiceId: payments.invoiceId, amount: payments.amount, status: payments.status, currency: payments.currency }).from(payments).where(and(eq(payments.creatorId, userId), sql`${payments.invoiceId} is not null`)) : [];
  const paidByInvoice = new Map<string, number>();
  for (const payment of allPayments) if (payment.invoiceId && payment.status === "confirmed") paidByInvoice.set(payment.invoiceId, (paidByInvoice.get(payment.invoiceId) ?? 0) + payment.amount);
  const outstandingByCurrency: Record<string, number> = {};
  let awaitingPayment = 0;
  for (const { invoice } of invoiceRows) {
    const outstanding = Math.max(invoice.total - (paidByInvoice.get(invoice.id) ?? 0), 0);
    if (outstanding > 0) { awaitingPayment += 1; outstandingByCurrency[invoice.currency] = (outstandingByCurrency[invoice.currency] ?? 0) + outstanding; }
  }
  return { receivedThisMonth: totalsByCurrency, outstandingByCurrency, awaitingPayment, paymentsRecorded: monthly.length, currencies: Array.from(new Set([...Object.keys(totalsByCurrency), ...Object.keys(outstandingByCurrency)])) };
}

export async function recordPayment(userId: string, payload: Record<string, unknown>) {
  const clientId = clean(payload.clientId);
  if (!clientId) throw new ApiError("clientId is required", 400);
  const client = await getClient(userId, clientId);
  const project = await getProject(userId, clean(payload.projectId), clientId);
  const invoiceId = clean(payload.invoiceId);
  const invoice = invoiceId ? (await getInvoiceContext(userId, invoiceId)).invoice : null;
  if (invoice && invoice.clientId !== clientId) throw new ApiError("Invoice does not belong to the selected client", 409);
  const amount = parseAmount(payload.amount);
  if (!amount || amount <= 0) throw new ApiError("Payment amount must be a positive integer monetary amount", 400);
  const currency = clean(payload.currency)?.toUpperCase();
  if (!currency) throw new ApiError("currency is required", 400);
  if (invoice && currency !== invoice.currency.toUpperCase()) throw new ApiError("Payment currency must match the invoice currency", 400);
  const status = assertStatus(payload.status);
  const paidAt = parseDate(payload.paidAt);
  if (!paidAt) throw new ApiError("Payment date is invalid", 400);
  const reference = clean(payload.reference) ?? `PAY-${Date.now().toString(36).toUpperCase()}`;
  return db.transaction(async (tx) => {
    if (invoice && status === "confirmed") {
      const existing = await tx.select({ amount: payments.amount, status: payments.status }).from(payments).where(and(eq(payments.invoiceId, invoice.id), eq(payments.creatorId, userId)));
      if (confirmedAmount(existing) + amount > invoice.total) throw new ApiError("Payment exceeds the available invoice balance", 409);
    }
    const [payment] = await tx.insert(payments).values({ creatorId: userId, clientId, invoiceId, projectId: project?.id ?? null, reference, amount, currency, method: assertMethod(payload.method), origin: "manual", status, paidAt, confirmedAt: status === "confirmed" ? new Date() : null, confirmedBy: status === "confirmed" ? userId : null, transactionReference: clean(payload.transactionReference), evidenceReference: clean(payload.evidenceReference), notes: clean(payload.notes) }).returning();
    if (!payment) throw new ApiError("Payment could not be recorded", 500);
    await tx.insert(paymentAuditEvents).values({ creatorId: userId, paymentId: payment.id, eventType: "created", actorId: userId, metadata: { status, amount, currency, invoiceId } });
    if (invoiceId && status === "confirmed") await syncInvoiceStatus(tx, invoiceId, userId);
    return { ...payment, client, invoice };
  });
}

export async function verifyPayment(userId: string, paymentId: string) {
  const current = await db.select().from(payments).where(and(eq(payments.id, paymentId), eq(payments.creatorId, userId))).limit(1);
  const payment = current[0];
  if (!payment) throw new ApiError("Payment not found", 404);
  if (payment.status !== "pending_verification") throw new ApiError("Only pending payments can be verified", 409);
  if (payment.invoiceId) { const summary = await getInvoicePaymentSummary(userId, payment.invoiceId); if (summary.confirmedAmount + payment.amount > summary.invoice.total) throw new ApiError("Payment exceeds the available invoice balance", 409); }
  return db.transaction(async (tx) => {
    const [updated] = await tx.update(payments).set({ status: "confirmed", confirmedAt: new Date(), confirmedBy: userId, updatedAt: new Date() }).where(and(eq(payments.id, paymentId), eq(payments.creatorId, userId), eq(payments.status, "pending_verification"))).returning();
    if (!updated) throw new ApiError("Payment could not be verified", 409);
    await tx.insert(paymentAuditEvents).values({ creatorId: userId, paymentId, eventType: "verified", actorId: userId, metadata: {} });
    if (payment.invoiceId) await syncInvoiceStatus(tx, payment.invoiceId, userId);
    return updated;
  });
}

export async function updatePaymentMetadata(userId: string, paymentId: string, payload: Record<string, unknown>) {
  const existing = await db.query.payments.findFirst({ where: and(eq(payments.id, paymentId), eq(payments.creatorId, userId)) });
  if (!existing) throw new ApiError("Payment not found", 404);
  const [updated] = await db.update(payments).set({ transactionReference: payload.transactionReference === undefined ? existing.transactionReference : clean(payload.transactionReference), notes: payload.notes === undefined ? existing.notes : clean(payload.notes), updatedAt: new Date() }).where(and(eq(payments.id, paymentId), eq(payments.creatorId, userId))).returning();
  await db.insert(paymentAuditEvents).values({ creatorId: userId, paymentId, eventType: "metadata_updated", actorId: userId, metadata: {} });
  return updated;
}

export async function listPaymentAudit(userId: string, invoiceId: string) { await getInvoiceContext(userId, invoiceId); return db.select({ audit: paymentAuditEvents, payment: payments }).from(paymentAuditEvents).innerJoin(payments, eq(paymentAuditEvents.paymentId, payments.id)).where(and(eq(paymentAuditEvents.creatorId, userId), eq(payments.invoiceId, invoiceId))).orderBy(desc(paymentAuditEvents.createdAt)); }
export async function listSchedules(userId: string, invoiceId: string) { await getInvoiceContext(userId, invoiceId); return db.select().from(paymentSchedules).where(and(eq(paymentSchedules.creatorId, userId), eq(paymentSchedules.invoiceId, invoiceId))).orderBy(paymentSchedules.dueDate); }
export async function saveSchedule(userId: string, invoiceId: string, payload: Record<string, unknown>, scheduleId?: string) { const { invoice, client } = await getInvoiceContext(userId, invoiceId); const label = clean(payload.label); const amount = parseAmount(payload.amount); const dueDate = parseDate(payload.dueDate); if (!label || !amount || amount <= 0 || !dueDate) throw new ApiError("Label, positive amount, and valid due date are required", 400); const values = { creatorId: userId, clientId: client.id, invoiceId, projectId: null, label, amount, currency: invoice.currency, dueDate, milestone: clean(payload.milestone), status: clean(payload.status) ?? "scheduled", notes: clean(payload.notes), updatedAt: new Date() }; if (scheduleId) { const [updated] = await db.update(paymentSchedules).set(values).where(and(eq(paymentSchedules.id, scheduleId), eq(paymentSchedules.creatorId, userId), eq(paymentSchedules.invoiceId, invoiceId))).returning(); if (!updated) throw new ApiError("Payment schedule not found", 404); return updated; } const [created] = await db.insert(paymentSchedules).values(values).returning(); return created; }
export async function deleteSchedule(userId: string, invoiceId: string, scheduleId: string) { await getInvoiceContext(userId, invoiceId); const [deleted] = await db.delete(paymentSchedules).where(and(eq(paymentSchedules.id, scheduleId), eq(paymentSchedules.creatorId, userId), eq(paymentSchedules.invoiceId, invoiceId))).returning(); if (!deleted) throw new ApiError("Payment schedule not found", 404); return { deleted: true, id: deleted.id }; }
export async function listTermAmendments(userId: string, invoiceId: string) { await getInvoiceContext(userId, invoiceId); return db.select().from(paymentTermAmendments).where(and(eq(paymentTermAmendments.creatorId, userId), eq(paymentTermAmendments.invoiceId, invoiceId))).orderBy(desc(paymentTermAmendments.agreementDate)); }
export async function createTermAmendment(userId: string, invoiceId: string, payload: Record<string, unknown>) { await getInvoiceContext(userId, invoiceId); const newTerms = clean(payload.newTerms); const agreementDate = parseDate(payload.agreementDate); if (!newTerms || !agreementDate) throw new ApiError("New terms and a valid agreement date are required", 400); const [amendment] = await db.insert(paymentTermAmendments).values({ creatorId: userId, invoiceId, previousTerms: clean(payload.previousTerms), newTerms, agreementDate, evidenceReference: clean(payload.evidenceReference), notes: clean(payload.notes) }).returning(); return amendment; }
export async function refundPayment(userId: string, paymentId: string, reason: string) { const payment = await db.query.payments.findFirst({ where: and(eq(payments.id, paymentId), eq(payments.creatorId, userId)) }); if (!payment) throw new ApiError("Payment not found", 404); if (payment.status !== "confirmed") throw new ApiError("Only confirmed payments can be refunded", 409); const cleanedReason = clean(reason); if (!cleanedReason) throw new ApiError("A refund reason is required", 400); return db.transaction(async (tx) => { const [updated] = await tx.update(payments).set({ status: "refunded", reversalReason: cleanedReason, updatedAt: new Date() }).where(and(eq(payments.id, paymentId), eq(payments.creatorId, userId), eq(payments.status, "confirmed"))).returning(); if (!updated) throw new ApiError("Payment could not be refunded", 409); await tx.insert(paymentAuditEvents).values({ creatorId: userId, paymentId, eventType: "refunded", actorId: userId, metadata: { reason: cleanedReason, policy: "full_payment_refund_only" } }); if (payment.invoiceId) await syncInvoiceStatus(tx, payment.invoiceId, userId); return updated; }); }
export async function reversePayment(userId: string, paymentId: string, reason: string) { const payment = await db.query.payments.findFirst({ where: and(eq(payments.id, paymentId), eq(payments.creatorId, userId)) }); if (!payment) throw new ApiError("Payment not found", 404); if (!["confirmed", "pending_verification"].includes(payment.status)) throw new ApiError("Payment cannot be reversed in its current state", 409); const cleanedReason = clean(reason); if (!cleanedReason) throw new ApiError("A reversal reason is required", 400); return db.transaction(async (tx) => { const [updated] = await tx.update(payments).set({ status: "reversed", reversalReason: cleanedReason, updatedAt: new Date() }).where(and(eq(payments.id, paymentId), eq(payments.creatorId, userId))).returning(); if (!updated) throw new ApiError("Payment could not be reversed", 409); await tx.insert(paymentAuditEvents).values({ creatorId: userId, paymentId, eventType: "reversed", actorId: userId, metadata: { reason: cleanedReason } }); if (payment.invoiceId) await syncInvoiceStatus(tx, payment.invoiceId, userId); return updated; }); }

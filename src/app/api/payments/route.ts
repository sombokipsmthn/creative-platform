import { NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { invoices, payments, clients } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";
import crypto from "node:crypto";

function clean(value: unknown) { const text = typeof value === "string" ? value.trim() : ""; return text || null; }
function amount(value: unknown) { const n = Number(value); return Number.isFinite(n) ? Math.round(n) : null; }

export async function GET(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    const rows = await db.select({ payment: payments, invoice: invoices, client: clients }).from(payments).innerJoin(invoices, eq(payments.invoiceId, invoices.id)).leftJoin(clients, eq(invoices.clientId, clients.id)).where(eq(payments.creatorId, user.id)).orderBy(desc(payments.paymentDate), desc(payments.createdAt));
    return rows.map(({ payment, invoice, client }) => ({ ...payment, invoice, client }));
  });
}

export async function POST(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    const body = await request.json();
    const invoiceId = clean(body?.invoiceId);
    const paymentAmount = amount(body?.amount);
    const paymentMethod = clean(body?.paymentMethod);
    const paymentDate = body?.paymentDate ? new Date(String(body.paymentDate)) : new Date();
    if (!invoiceId) return NextResponse.json({ error: "Invoice is required" }, { status: 400 });
    if (paymentAmount === null || paymentAmount <= 0) return NextResponse.json({ error: "Payment amount must be greater than zero" }, { status: 400 });
    if (!paymentMethod) return NextResponse.json({ error: "Payment method is required" }, { status: 400 });
    if (Number.isNaN(paymentDate.getTime())) return NextResponse.json({ error: "Payment date is invalid" }, { status: 400 });

    const result = await db.transaction(async (tx) => {
      const [invoiceRow] = await tx.select().from(invoices).where(and(eq(invoices.id, invoiceId), eq(invoices.creatorId, user.id))).limit(1);
      if (!invoiceRow) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      if (invoiceRow.currency !== (clean(body?.currency)?.toUpperCase() || invoiceRow.currency)) return NextResponse.json({ error: "Payment currency must match the invoice currency" }, { status: 400 });
      if (invoiceRow.status === "cancelled") return NextResponse.json({ error: "Cancelled invoices cannot receive payments" }, { status: 409 });

      const [created] = await tx.insert(payments).values({ id: crypto.randomUUID(), creatorId: user.id, invoiceId, amount: paymentAmount, currency: invoiceRow.currency, paymentDate, paymentMethod, transactionReference: clean(body?.transactionReference), notes: clean(body?.notes) }).returning();
      if (!created) return NextResponse.json({ error: "Payment could not be recorded" }, { status: 500 });

      const [{ paid }] = await tx.select({ paid: sql<number>`coalesce(sum(${payments.amount}), 0)` }).from(payments).where(and(eq(payments.invoiceId, invoiceId), eq(payments.creatorId, user.id)));
      const shouldMarkPaid = Number(paid) >= Number(invoiceRow.total) && Number(invoiceRow.total) > 0 && invoiceRow.status !== "paid";
      if (shouldMarkPaid) await tx.update(invoices).set({ status: "paid", updatedAt: new Date() }).where(and(eq(invoices.id, invoiceId), eq(invoices.creatorId, user.id)));
      return { payment: created, invoiceStatus: shouldMarkPaid ? "paid" : invoiceRow.status, totalPaid: Number(paid) };
    });
    return result;
  }, { status: 201 });
}

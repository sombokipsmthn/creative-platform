import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  clients,
  invoiceItems,
  invoices,
  quoteItems,
  quotes,
} from "@/db/schema";
import { ApiError } from "@/lib/api/route-boundaries";

function normalizeNumber(value: unknown, fallback = 0) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.round(number);
}

function normalizeQuantity(value: unknown) {
  return Math.max(1, normalizeNumber(value, 1));
}

function normalizeCurrency(value: unknown, fallback = "KES") {
  const currency = String(value ?? "")
    .trim()
    .toUpperCase();

  return currency || fallback;
}

function normalizeOptionalString(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  const cleaned = String(value).trim();

  return cleaned || null;
}

function normalizeStatus(value: unknown, fallback = "draft") {
  const text = String(value ?? fallback)
    .trim()
    .toLowerCase();

  const allowed = [
    "draft",
    "sent",
    "accepted",
    "rejected",
    "invoiced",
  ];

  return allowed.includes(text) ? text : fallback;
}

function canTransitionStatus(currentStatus: string, nextStatus: string) {
  const transitions: Record<string, string[]> = {
    draft: ["draft", "sent", "cancelled"],
    sent: ["sent", "paid", "overdue", "cancelled"],
    paid: ["paid"],
    overdue: ["overdue", "paid", "cancelled"],
    cancelled: ["cancelled"],
  };

  return transitions[currentStatus]?.includes(nextStatus) ?? false;
}

async function generateInvoiceNumber(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
) {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const existing = await tx
    .select({ invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .where(sql`${invoices.invoiceNumber} LIKE ${`${prefix}%`}`)
    .orderBy(sql`${invoices.invoiceNumber} DESC`)
    .limit(1);

  let nextNumber = 1;

  if (existing[0]?.invoiceNumber) {
    const match = existing[0].invoiceNumber.match(/-(\d+)$/);

    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
}

function normalizeManualItems(items: unknown) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item: Record<string, unknown>) => {
    const quantity = normalizeQuantity(item.quantity);
    const unitPrice = Math.max(
      0,
      normalizeNumber(item.unitPrice ?? item.rate)
    );

    return {
      description: String(item.description ?? "").trim(),
      quantity,
      unitPrice,
      amount: quantity * unitPrice,
    };
  });
}

function calculateManualTotals({
  items,
  subtotal,
  tax,
  total,
}: {
  items: Array<{ amount: number }>;
  subtotal?: unknown;
  tax?: unknown;
  total?: unknown;
}) {
  const calculatedSubtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const calculatedTax = Math.max(0, normalizeNumber(tax));

  const finalSubtotal =
    subtotal !== undefined
      ? Math.max(0, normalizeNumber(subtotal))
      : calculatedSubtotal;

  const finalTotal =
    total !== undefined
      ? Math.max(0, normalizeNumber(total))
      : finalSubtotal + calculatedTax;

  return {
    subtotal: finalSubtotal,
    tax: calculatedTax,
    total: finalTotal,
  };
}

export async function listInvoicesForCreator({
  userId,
  status,
  clientId,
  currency,
  page = 1,
  limit = 20,
}: {
  userId: string;
  status?: string | null;
  clientId?: string | null;
  currency?: string | null;
  page?: number;
  limit?: number;
}) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const offset = (safePage - 1) * safeLimit;

  const conditions = [eq(invoices.creatorId, userId)];

  if (status) {
    conditions.push(eq(invoices.status, normalizeStatus(status)));
  }

  if (clientId) {
    conditions.push(eq(invoices.clientId, clientId));
  }

  if (currency) {
    conditions.push(eq(invoices.currency, normalizeCurrency(currency)));
  }

  const results = await db
    .select({
      invoice: invoices,
      client: clients,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(and(...conditions))
    .orderBy(desc(invoices.createdAt))
    .limit(safeLimit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .where(and(...conditions));

  return {
    data: results.map(({ invoice, client }) => ({
      ...invoice,
      client,
    })),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: Number(count),
      totalPages: Math.ceil(Number(count) / safeLimit),
    },
  };
}

export async function getInvoiceForCreator({
  userId,
  id,
}: {
  userId: string;
  id: string;
}) {
  if (!id) {
    throw new ApiError("Invoice id is required", 400);
  }

  const result = await db
    .select({
      invoice: invoices,
      client: clients,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(and(eq(invoices.id, id), eq(invoices.creatorId, userId)))
    .limit(1);

  const record = result[0];

  if (!record) {
    throw new ApiError("Invoice not found", 404);
  }

  const items = await db.query.invoiceItems.findMany({
    where: eq(invoiceItems.invoiceId, id),
    orderBy: (invoiceItems, { asc }) => [asc(invoiceItems.createdAt)],
  });

  return {
    ...record.invoice,
    client: record.client,
    items,
  };
}

export async function updateInvoiceStatusForCreator({
  userId,
  invoiceId,
  status,
}: {
  userId: string;
  invoiceId: string;
  status: string;
}) {
  const id = normalizeOptionalString(invoiceId);
  const requestedStatus = normalizeOptionalString(status);

  if (!id || !requestedStatus) {
    throw new ApiError("Invoice id and status are required", 400);
  }

  const normalizedStatus = requestedStatus.trim().toLowerCase();
  const supportedStatuses = [
    "draft",
    "sent",
    "paid",
    "overdue",
    "cancelled",
  ];

  if (!supportedStatuses.includes(normalizedStatus)) {
    throw new ApiError("Invalid invoice status", 400, {
      allowedStatuses: supportedStatuses,
    });
  }

  const currentInvoice = await db
    .select({
      invoice: invoices,
      client: clients,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(and(eq(invoices.id, id), eq(invoices.creatorId, userId)))
    .limit(1);

  const record = currentInvoice[0];

  if (!record) {
    throw new ApiError("Invoice not found", 404);
  }

  const currentStatus = record.invoice.status.trim().toLowerCase();

  if (!canTransitionStatus(currentStatus, normalizedStatus)) {
    throw new ApiError(
      `Invalid invoice status transition: ${currentStatus} → ${normalizedStatus}`,
      409
    );
  }

  const [updatedInvoice] = await db
    .update(invoices)
    .set({
      status: normalizedStatus,
      updatedAt: new Date(),
    })
    .where(and(eq(invoices.id, id), eq(invoices.creatorId, userId)))
    .returning();

  if (!updatedInvoice) {
    throw new ApiError("Invoice could not be updated", 500);
  }

  const items = await db.query.invoiceItems.findMany({
    where: eq(invoiceItems.invoiceId, id),
    orderBy: (invoiceItems, { asc }) => [asc(invoiceItems.createdAt)],
  });

  return {
    ...updatedInvoice,
    client: record.client,
    items,
  };
}

export async function createInvoiceForCreator({
  userId,
  payload,
}: {
  userId: string;
  payload: Record<string, unknown>;
}) {
  const quoteId =
    typeof payload.quoteId === "string" && payload.quoteId.trim()
      ? payload.quoteId.trim()
      : null;

  if (quoteId) {
    return createInvoiceFromQuoteForCreator({ userId, quoteId });
  }

  const {
    clientId,
    title,
    invoiceNumber,
    status,
    issueDate,
    dueDate,
    notes,
    currency,
    subtotal,
    tax,
    total,
    items,
  } = payload;

  if (!clientId) {
    throw new ApiError("clientId is required", 400);
  }

  const client = await db.query.clients.findFirst({
    where: and(
      eq(clients.id, String(clientId)),
      eq(clients.creatorId, userId)
    ),
  });

  if (!client) {
    throw new ApiError("Client not found", 404);
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError("At least one invoice item is required", 400);
  }

  const normalizedItems = normalizeManualItems(items);
  const totals = calculateManualTotals({
    items: normalizedItems,
    subtotal,
    tax,
    total,
  });

  const result = await db.transaction(async (tx) => {
    const finalInvoiceNumber =
      normalizeOptionalString(invoiceNumber) || (await generateInvoiceNumber(tx));

    const [invoice] = await tx
      .insert(invoices)
      .values({
        creatorId: userId,
        clientId: String(clientId),
        quoteId: null,
        invoiceNumber: finalInvoiceNumber,
        title: String(title ?? "Invoice").trim() || "Invoice",
        status: String(status ?? "draft").trim() || "draft",
        issueDate: issueDate ? new Date(String(issueDate)) : new Date(),
        dueDate: dueDate ? new Date(String(dueDate)) : null,
        notes: normalizeOptionalString(notes),
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        currency: normalizeCurrency(currency, "USD"),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!invoice) {
      throw new ApiError("Invoice could not be created", 500);
    }

    const createdItems = await tx
      .insert(invoiceItems)
      .values(
        normalizedItems.map((item) => ({
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          createdAt: new Date(),
        }))
      )
      .returning();

    return {
      invoice,
      client,
      items: createdItems,
    };
  });

  return result;
}

async function createInvoiceFromQuoteForCreator({
  userId,
  quoteId,
}: {
  userId: string;
  quoteId: string;
}) {
  return db.transaction(async (tx) => {
    const quoteResult = await tx
      .select({
        quote: quotes,
        client: clients,
      })
      .from(quotes)
      .leftJoin(clients, eq(quotes.clientId, clients.id))
      .where(eq(quotes.id, quoteId))
      .limit(1);

    const record = quoteResult[0];

    if (!record) {
      throw new ApiError("Quote not found", 404);
    }

    const { quote, client } = record;

    if (!client || client.creatorId !== userId) {
      throw new ApiError(
        "You are not authorized to generate an invoice from this quote",
        403
      );
    }

    if (quote.status.toLowerCase() !== "accepted") {
      throw new ApiError(
        "Only accepted quotes can be converted into invoices",
        409
      );
    }

    if (quote.invoiceId) {
      throw new ApiError(
        "An invoice has already been generated for this quote",
        409
      );
    }

    const existingInvoice = await tx
      .select({
        id: invoices.id,
      })
      .from(invoices)
      .where(eq(invoices.quoteId, quote.id))
      .limit(1);

    if (existingInvoice[0]) {
      await tx
        .update(quotes)
        .set({
          invoiceId: existingInvoice[0].id,
          updatedAt: new Date(),
        })
        .where(eq(quotes.id, quote.id));

      throw new ApiError(
        "An invoice has already been generated for this quote",
        409
      );
    }

    const items = await tx
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, quote.id));

    if (items.length === 0) {
      throw new ApiError(
        "Cannot generate an invoice from a quote with no line items",
        400
      );
    }

    const invoiceNumber = await generateInvoiceNumber(tx);

    const [invoice] = await tx
      .insert(invoices)
      .values({
        creatorId: userId,
        clientId: quote.clientId!,
        quoteId: quote.id,
        invoiceNumber,
        title: quote.title || "Invoice",
        status: "draft",
        issueDate: new Date(),
        notes: quote.notes,
        subtotal: quote.subtotal,
        tax: quote.tax,
        total: quote.total,
        currency: quote.currency,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!invoice) {
      throw new ApiError("Invoice could not be created", 500);
    }

    const createdItems = await tx
      .insert(invoiceItems)
      .values(
        items.map((item) => ({
          invoiceId: invoice.id,
          description: item.description,
          quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
          unitPrice: Math.max(0, Math.round(Number(item.rate) || 0)),
          amount: Math.max(0, Math.round(Number(item.amount) || 0)),
          createdAt: new Date(),
        }))
      )
      .returning();

    const [updatedQuote] = await tx
      .update(quotes)
      .set({
        invoiceId: invoice.id,
        status: "invoiced",
        updatedAt: new Date(),
      })
      .where(and(eq(quotes.id, quote.id), eq(quotes.status, "accepted")))
      .returning();

    if (!updatedQuote) {
      throw new ApiError(
        "An invoice has already been generated for this quote",
        409
      );
    }

    return {
      invoice,
      quote: updatedQuote,
      client,
      items: createdItems,
    };
  });
}

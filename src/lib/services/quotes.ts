import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { clients, quoteItems, quotes } from "@/db/schema";
import { ApiError } from "@/lib/api/route-boundaries";

export function normalizeStatus(status: unknown) {
  const value = String(status ?? "draft")
    .trim()
    .toLowerCase();

  const allowedStatuses = [
    "draft",
    "sent",
    "accepted",
    "rejected",
    "invoiced",
  ];

  return allowedStatuses.includes(value)
    ? value
    : "draft";
}

export function normalizeCurrency(currency: unknown) {
  const value = String(currency ?? "KES")
    .trim()
    .toUpperCase();

  return value || "KES";
}

export function calculateTotals({
  items,
  tax,
}: {
  items: Array<{
    quantity: number;
    rate: number;
  }>;
  tax?: unknown;
}) {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + item.quantity * item.rate,
    0
  );

  const taxAmount = Math.max(
    0,
    Math.round(Number(tax) || 0)
  );

  const total = subtotal + taxAmount;

  return {
    subtotal,
    tax: taxAmount,
    total,
  };
}

export function normalizeItems(items: unknown) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item: Record<string, unknown>) => {
    const quantity = Math.max(
      1,
      Math.round(Number(item.quantity) || 1)
    );

    const rate = Math.max(
      0,
      Math.round(Number(item.rate) || 0)
    );

    return {
      category:
        String(item.category ?? "Production").trim() ||
        "Production",
      description: String(item.description ?? "").trim(),
      quantity,
      unit: String(item.unit ?? "unit").trim() || "unit",
      rate,
      amount: quantity * rate,
      notes:
        item.notes !== undefined &&
        item.notes !== null &&
        String(item.notes).trim()
          ? String(item.notes).trim()
          : null,
    };
  });
}

export async function listQuotesForCreator({
  userId,
  status,
  clientId,
}: {
  userId: string;
  status?: string | null;
  clientId?: string | null;
}) {
  const conditions = [eq(quotes.creatorId, userId)];

  if (status) {
    conditions.push(eq(quotes.status, normalizeStatus(status)));
  }

  if (clientId) {
    conditions.push(eq(quotes.clientId, clientId));
  }

  const results = await db
    .select({
      quote: quotes,
      client: clients,
    })
    .from(quotes)
    .leftJoin(clients, eq(quotes.clientId, clients.id))
    .where(and(...conditions))
    .orderBy(desc(quotes.createdAt));

  const quoteIds = results.map(({ quote }) => quote.id);

  let items: typeof quoteItems.$inferSelect[] = [];

  if (quoteIds.length > 0) {
    items = await db
      .select()
      .from(quoteItems)
      .where(inArray(quoteItems.quoteId, quoteIds));
  }

  const itemsByQuote = new Map<string, typeof items>();

  for (const item of items) {
    const existing = itemsByQuote.get(item.quoteId) ?? [];
    existing.push(item);
    itemsByQuote.set(item.quoteId, existing);
  }

  return results.map(({ quote, client }) => ({
    ...quote,
    client,
    items: itemsByQuote.get(quote.id) ?? [],
  }));
}

export async function createQuoteForCreator({
  userId,
  payload,
}: {
  userId: string;
  payload: Record<string, unknown>;
}) {
  const {
    clientId,
    title,
    projectName,
    quoteNumber,
    currency,
    paymentTerms,
    validUntil,
    productionDays,
    location,
    clientContact,
    depositPercentage,
    notes,
    status,
    tax,
    items,
  } = payload;

  if (!title || !String(title).trim()) {
    throw new ApiError("title is required", 400);
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(
      "At least one quote item is required",
      400
    );
  }

  let client = null;

  if (clientId) {
    client = await db.query.clients.findFirst({
      where: and(
        eq(clients.id, String(clientId)),
        eq(clients.creatorId, userId)
      ),
    });

    if (!client) {
      throw new ApiError("Client not found", 404);
    }
  }

  const normalizedItems = normalizeItems(items);
  const invalidItem = normalizedItems.find(
    (item) => !item.description
  );

  if (invalidItem) {
    throw new ApiError(
      "Every quote item must have a description",
      400
    );
  }

  const totals = calculateTotals({
    items: normalizedItems,
    tax,
  });

  const normalizedStatus = normalizeStatus(status);
  const creationStatus =
    normalizedStatus === "sent" ? "sent" : "draft";

  const [quote] = await db
    .insert(quotes)
    .values({
      creatorId: userId,
      clientId: clientId ? String(clientId) : null,
      title: String(title).trim(),
      projectName:
        projectName !== undefined &&
        projectName !== null &&
        String(projectName).trim()
          ? String(projectName).trim()
          : null,
      quoteNumber:
        quoteNumber !== undefined &&
        quoteNumber !== null &&
        String(quoteNumber).trim()
          ? String(quoteNumber).trim()
          : null,
      currency: normalizeCurrency(currency),
      paymentTerms:
        paymentTerms !== undefined &&
        paymentTerms !== null &&
        String(paymentTerms).trim()
          ? String(paymentTerms).trim()
          : null,
      validUntil: validUntil ? new Date(validUntil as string) : null,
      productionDays: Math.max(
        1,
        Math.round(Number(productionDays) || 1)
      ),
      location:
        location !== undefined &&
        location !== null &&
        String(location).trim()
          ? String(location).trim()
          : null,
      clientContact:
        clientContact !== undefined &&
        clientContact !== null &&
        String(clientContact).trim()
          ? String(clientContact).trim()
          : null,
      depositPercentage: Math.min(
        100,
        Math.max(
          0,
          Math.round(Number(depositPercentage) || 50)
        )
      ),
      notes:
        notes !== undefined &&
        notes !== null &&
        String(notes).trim()
          ? String(notes).trim()
          : null,
      status: creationStatus,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
    })
    .returning();

  if (!quote) {
    throw new Error("Quote was not created");
  }

  const createdItems = await db
    .insert(quoteItems)
    .values(
      normalizedItems.map((item) => ({
        quoteId: quote.id,
        category: item.category,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        amount: item.amount,
        notes: item.notes,
      }))
    )
    .returning();

  return {
    ...quote,
    client,
    items: createdItems,
  };
}

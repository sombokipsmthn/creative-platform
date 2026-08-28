import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  clients,
  quoteItems,
  quotes,
  users,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/auth/get-current-user";

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

  return items.map(
    (item: Record<string, unknown>) => {
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
          String(
            item.category ?? "Production"
          ).trim() || "Production",

        description:
          String(
            item.description ?? ""
          ).trim(),

        quantity,

        unit:
          String(item.unit ?? "unit").trim() ||
          "unit",

        rate,

        amount: quantity * rate,

        notes:
          item.notes !== undefined &&
          item.notes !== null &&
          String(item.notes).trim()
            ? String(item.notes).trim()
            : null,
      };
    }
  );
}

/*
|--------------------------------------------------------------------------
| GET /api/quotes
|--------------------------------------------------------------------------
| Fetch quotes belonging directly to the authenticated creator.
|
| clientId is optional. A quote does NOT need a client to exist.
|--------------------------------------------------------------------------
*/

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } =
      new URL(req.url);

    const status =
      searchParams.get("status");

    const clientId =
      searchParams.get("clientId");

    /*
     * IMPORTANT:
     *
     * Quote ownership comes directly from
     * quotes.creatorId.
     *
     * Do NOT require a client here because
     * clientId is nullable.
     */
    const conditions = [
      eq(quotes.creatorId, user.id),
    ];

    if (status) {
      conditions.push(
        eq(
          quotes.status,
          normalizeStatus(status)
        )
      );
    }

    if (clientId) {
      conditions.push(
        eq(quotes.clientId, clientId)
      );
    }

    const results = await db
      .select({
        quote: quotes,
        client: clients,
      })
      .from(quotes)
      .leftJoin(
        clients,
        eq(quotes.clientId, clients.id)
      )
      .where(and(...conditions))
      .orderBy(desc(quotes.createdAt));

    const quoteIds = results.map(
      ({ quote }) => quote.id
    );

    let items: typeof quoteItems.$inferSelect[] =
      [];

    if (quoteIds.length > 0) {
      items = await db
        .select()
        .from(quoteItems)
        .where(
          inArray(
            quoteItems.quoteId,
            quoteIds
          )
        );
    }

    const itemsByQuote = new Map<
      string,
      typeof items
    >();

    for (const item of items) {
      const existing =
        itemsByQuote.get(item.quoteId) ?? [];

      existing.push(item);

      itemsByQuote.set(
        item.quoteId,
        existing
      );
    }

    return NextResponse.json(
      results.map(({ quote, client }) => ({
        ...quote,
        client,
        items:
          itemsByQuote.get(quote.id) ?? [],
      }))
    );
  } catch (error) {
    console.error(
      "GET /api/quotes error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch quotes",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/quotes
|--------------------------------------------------------------------------
| Create a quote owned directly by the authenticated creator.
|
| clientId remains optional.
|--------------------------------------------------------------------------
*/

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

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
    } = body;

    if (!title || !String(title).trim()) {
      return NextResponse.json(
        {
          error: "title is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "At least one quote item is required",
        },
        {
          status: 400,
        }
      );
    }

    let client = null;

    /*
     * A client is optional.
     *
     * If clientId was supplied, verify that
     * the client belongs to this creator.
     */
    if (clientId) {
      client =
        await db.query.clients.findFirst({
          where: and(
            eq(
              clients.id,
              String(clientId)
            ),
            eq(
              clients.creatorId,
              user.id
            )
          ),
        });

      if (!client) {
        return NextResponse.json(
          {
            error: "Client not found",
          },
          {
            status: 404,
          }
        );
      }
    }

    const normalizedItems =
      normalizeItems(items);

    const invalidItem =
      normalizedItems.find(
        (item) => !item.description
      );

    if (invalidItem) {
      return NextResponse.json(
        {
          error:
            "Every quote item must have a description",
        },
        {
          status: 400,
        }
      );
    }

    const totals = calculateTotals({
      items: normalizedItems,
      tax,
    });

    const normalizedStatus =
      normalizeStatus(status);

    /*
     * New quotes can only be created as
     * draft or sent.
     */
    const creationStatus =
      normalizedStatus === "sent"
        ? "sent"
        : "draft";

    const normalizedProductionDays =
      Math.max(
        1,
        Math.round(
          Number(productionDays) || 1
        )
      );

    const normalizedDepositPercentage =
      Math.min(
        100,
        Math.max(
          0,
          Math.round(
            Number(depositPercentage) || 50
          )
        )
      );

    const [quote] = await db
      .insert(quotes)
      .values({
        /*
         * IMPORTANT:
         *
         * Ownership is stored directly on
         * the quote.
         */
        creatorId: user.id,

        clientId: clientId
          ? String(clientId)
          : null,

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

        currency:
          normalizeCurrency(currency),

        paymentTerms:
          paymentTerms !== undefined &&
          paymentTerms !== null &&
          String(paymentTerms).trim()
            ? String(paymentTerms).trim()
            : null,

        validUntil:
          validUntil
            ? new Date(validUntil)
            : null,

        productionDays:
          normalizedProductionDays,

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

        depositPercentage:
          normalizedDepositPercentage,

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
      throw new Error(
        "Quote was not created"
      );
    }

    const createdItems =
      await db
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

    return NextResponse.json(
      {
        ...quote,
        client,
        items: createdItems,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/quotes error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create quote",
      },
      {
        status: 500,
      }
    );
  }
}
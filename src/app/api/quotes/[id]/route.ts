import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  clients,
  quoteItems,
  quotes,
  users,
} from "@/db/schema";

import getCurrentUser from "@/lib/auth/get-current-user";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type QuoteItemInput = {
  id?: string;
  category?: unknown;
  description?: unknown;
  quantity?: unknown;
  unit?: unknown;
  rate?: unknown;
  amount?: unknown;
  notes?: unknown;
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ["draft", "sent"],
  sent: ["sent", "accepted"],
  accepted: ["accepted"],
};

function toNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function toInteger(value: unknown): number {
  return Math.round(toNumber(value));
}

function cleanString(
  value: unknown
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const stringValue = String(value).trim();

  return stringValue || null;
}

function normalizeStatus(
  value: unknown
): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function calculateTotals(
  items: Array<{
    quantity: number;
    rate: number;
  }>,
  discountType: string,
  discountValue: number,
  tax: number
) {
  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      toNumber(item.quantity) *
        toNumber(item.rate),
    0
  );

  let discountAmount = 0;

  if (discountType === "percentage") {
    discountAmount = Math.round(
      subtotal * (discountValue / 100)
    );
  }

  if (discountType === "fixed") {
    discountAmount = Math.round(
      discountValue
    );
  }

  discountAmount = Math.min(
    subtotal,
    Math.max(0, discountAmount)
  );

  const taxableAmount =
    subtotal - discountAmount;

  const normalizedTax = Math.max(
    0,
    Math.round(tax)
  );

  const total =
    taxableAmount + normalizedTax;

  return {
    subtotal: Math.round(subtotal),
    discountAmount,
    tax: normalizedTax,
    total: Math.round(total),
  };
}


/*
|--------------------------------------------------------------------------
| Authorized quote
|--------------------------------------------------------------------------
|
| Quote ownership is determined by creatorId.
|
| clientId is optional, so we deliberately use a LEFT JOIN.
|
|--------------------------------------------------------------------------
*/

async function getAuthorizedQuote(
  quoteId: string,
  userId: string
) {
  const result = await db
    .select({
      quote: quotes,
      client: clients,
    })
    .from(quotes)
    .leftJoin(
      clients,
      eq(
        quotes.clientId,
        clients.id
      )
    )
    .where(
      and(
        eq(quotes.id, quoteId),
        eq(quotes.creatorId, userId)
      )
    )
    .limit(1);

  return result[0] ?? null;
}

/*
|--------------------------------------------------------------------------
| Quote response
|--------------------------------------------------------------------------
*/

async function getQuoteResponse(
  quoteId: string,
  userId: string
) {
  const result =
    await getAuthorizedQuote(
      quoteId,
      userId
    );

  if (!result) {
    return null;
  }

  const items = await db
    .select()
    .from(quoteItems)
    .where(
      eq(
        quoteItems.quoteId,
        quoteId
      )
    )
    .orderBy(
      quoteItems.createdAt
    );

  return {
    ...result.quote,
    client: result.client ?? null,
    items,
  };
}

/*
|--------------------------------------------------------------------------
| GET /api/quotes/[id]
|--------------------------------------------------------------------------
*/

export async function GET(
  _req: Request,
  context: RouteContext
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Quote ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await getQuoteResponse(
        id,
        user.id
      );

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Quote not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      result
    );
  } catch (error) {
    console.error(
      "GET /api/quotes/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch quote",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PATCH /api/quotes/[id]
|--------------------------------------------------------------------------
|
| Supports:
|
| 1. Status-only updates
| 2. Editable quote fields
| 3. Line item updates
| 4. Quote total recalculation
|
|--------------------------------------------------------------------------
*/

export async function PATCH(
  req: Request,
  context: RouteContext
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Quote ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await getAuthorizedQuote(
        id,
        user.id
      );

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Quote not found",
        },
        {
          status: 404,
        }
      );
    }

    let body: Record<
      string,
      unknown
    >;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid JSON body",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    const hasStatus =
      body.status !== undefined;

    const currentStatus =
      normalizeStatus(
        existing.quote.status ||
          "draft"
      );

    let requestedStatus =
      currentStatus;

    if (hasStatus) {
      requestedStatus =
        normalizeStatus(
          body.status
        );

      if (!requestedStatus) {
        return NextResponse.json(
          {
            error:
              "status cannot be empty",
          },
          {
            status: 400,
          }
        );
      }

      const allowedTransitions =
        STATUS_TRANSITIONS[
          currentStatus
        ] ?? [];

      if (
        !allowedTransitions.includes(
          requestedStatus
        )
      ) {
        return NextResponse.json(
          {
            error: `Invalid quote status transition: ${currentStatus} → ${requestedStatus}`,
            currentStatus,
            allowedStatuses:
              allowedTransitions,
          },
          {
            status: 409,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Editable quote fields
    |--------------------------------------------------------------------------
    */

    const quoteUpdate: Record<
      string,
      unknown
    > = {};

    if (
      body.title !== undefined
    ) {
      const title =
        cleanString(body.title);

      if (!title) {
        return NextResponse.json(
          {
            error:
              "Quote title is required",
          },
          {
            status: 400,
          }
        );
      }

      quoteUpdate.title = title;
    }

    if (
      body.projectName !== undefined
    ) {
      quoteUpdate.projectName =
        cleanString(
          body.projectName
        );
    }

    if (
      body.quoteNumber !== undefined
    ) {
      quoteUpdate.quoteNumber =
        cleanString(
          body.quoteNumber
        );
    }

    if (
      body.currency !== undefined
    ) {
      quoteUpdate.currency =
        cleanString(
          body.currency
        ) || "KES";
    }

    if (
      body.paymentTerms !== undefined
    ) {
      quoteUpdate.paymentTerms =
        cleanString(
          body.paymentTerms
        );
    }

    if (
      body.validUntil !== undefined
    ) {
      const validUntil =
        cleanString(
          body.validUntil
        );

      if (!validUntil) {
        quoteUpdate.validUntil =
          null;
      } else {
        const parsedDate =
          new Date(validUntil);

        if (
          Number.isNaN(
            parsedDate.getTime()
          )
        ) {
          return NextResponse.json(
            {
              error:
                "Invalid validUntil date",
            },
            {
              status: 400,
            }
          );
        }

        quoteUpdate.validUntil =
          parsedDate;
      }
    }

    if (
      body.productionDays !==
      undefined
    ) {
      quoteUpdate.productionDays =
        Math.max(
          1,
          toInteger(
            body.productionDays
          )
        );
    }

    if (
      body.location !== undefined
    ) {
      quoteUpdate.location =
        cleanString(
          body.location
        );
    }

    if (
      body.clientContact !==
      undefined
    ) {
      quoteUpdate.clientContact =
        cleanString(
          body.clientContact
        );
    }

    if (
      body.depositPercentage !==
      undefined
    ) {
      quoteUpdate.depositPercentage =
        Math.min(
          100,
          Math.max(
            0,
            toInteger(
              body.depositPercentage
            )
          )
        );
    }

    if (
      body.notes !== undefined
    ) {
      quoteUpdate.notes =
        cleanString(body.notes);
    }

    /*
    |--------------------------------------------------------------------------
    | Client association
    |--------------------------------------------------------------------------
    |
    | clientId can be:
    |
    | - omitted: keep existing client
    | - null: remove client
    | - string: attach quote to client
    |
    |--------------------------------------------------------------------------
    */

    if (
      body.clientId !== undefined
    ) {
      const clientId =
        cleanString(
          body.clientId
        );

      if (clientId) {
        const client =
          await db.query.clients.findFirst(
            {
              where: and(
                eq(
                  clients.id,
                  clientId
                ),
                eq(
                  clients.creatorId,
                  user.id
                )
              ),
            }
          );

        if (!client) {
          return NextResponse.json(
            {
              error:
                "Client not found",
            },
            {
              status: 404,
            }
          );
        }

        quoteUpdate.clientId =
          client.id;
      } else {
        quoteUpdate.clientId =
          null;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Discount
    |--------------------------------------------------------------------------
    */

    const discountType =
      cleanString(
        body.discountType ??
          existing.quote
            .discountType ??
          "none"
      ) || "none";

    const allowedDiscountTypes = [
      "none",
      "percentage",
      "fixed",
    ];

    if (
      !allowedDiscountTypes.includes(
        discountType
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid discount type",
        },
        {
          status: 400,
        }
      );
    }

    const discountValue =
      Math.max(
        0,
        toInteger(
          body.discountValue ??
            existing.quote
              .discountValue ??
            0
        )
      );

    /*
    |--------------------------------------------------------------------------
    | Items
    |--------------------------------------------------------------------------
    */

    let itemsForTotals:
      Array<{
        quantity: number;
        rate: number;
      }> = [];

    const hasItems =
      Array.isArray(body.items);

    if (hasItems) {
      const inputItems =
        body.items as QuoteItemInput[];

      itemsForTotals =
        inputItems.map(
          (item) => ({
            quantity: Math.max(
              1,
              toInteger(
                item.quantity ?? 1
              )
            ),
            rate: Math.max(
              0,
              toInteger(
                item.rate ?? 0
              )
            ),
          })
        );
    } else {
      const existingItems =
        await db
          .select()
          .from(quoteItems)
          .where(
            eq(
              quoteItems.quoteId,
              id
            )
          );

      itemsForTotals =
        existingItems.map(
          (item) => ({
            quantity:
              toNumber(
                item.quantity
              ),
            rate: toNumber(
              item.rate
            ),
          })
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Tax
    |--------------------------------------------------------------------------
    */

    const tax = Math.max(
      0,
      toInteger(
        body.tax ??
          existing.quote.tax ??
          0
      )
    );

    const totals =
      calculateTotals(
        itemsForTotals,
        discountType,
        discountValue,
        tax
      );

    /*
    |--------------------------------------------------------------------------
    | Always keep calculated financial values
    | consistent with the line items.
    |--------------------------------------------------------------------------
    */

    quoteUpdate.discountType =
      discountType;

    quoteUpdate.discountValue =
      discountValue;

    quoteUpdate.subtotal =
      totals.subtotal;

    quoteUpdate.discountAmount =
      totals.discountAmount;

    quoteUpdate.tax =
      totals.tax;

    quoteUpdate.total =
      totals.total;

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    if (hasStatus) {
      quoteUpdate.status =
        requestedStatus;
    }

    /*
    |--------------------------------------------------------------------------
    | updatedAt
    |--------------------------------------------------------------------------
    */

    quoteUpdate.updatedAt =
      new Date();

    /*
    |--------------------------------------------------------------------------
    | Save quote
    |--------------------------------------------------------------------------
    */

    await db
      .update(quotes)
      .set(quoteUpdate)
      .where(
        and(
          eq(quotes.id, id),
          eq(
            quotes.creatorId,
            user.id
          )
        )
      );

    /*
    |--------------------------------------------------------------------------
    | Replace line items
    |--------------------------------------------------------------------------
    |
    | For the editable preview, replacing the quote's item set is
    | considerably simpler and safer than trying to infer deletes,
    | inserts and updates individually.
    |
    |--------------------------------------------------------------------------
    */

    if (hasItems) {
      const inputItems =
        body.items as QuoteItemInput[];

      /*
       * Remove all existing items first.
       *
       * The quote itself is protected by creator ownership above.
       */
      await db
        .delete(quoteItems)
        .where(
          eq(
            quoteItems.quoteId,
            id
          )
        );

      /*
       * Insert the current editor state.
       */
      if (inputItems.length > 0) {
        const rows =
          inputItems.map(
            (item) => {
              const quantity =
                Math.max(
                  1,
                  toInteger(
                    item.quantity ??
                      1
                  )
                );

              const rate =
                Math.max(
                  0,
                  toInteger(
                    item.rate ??
                      0
                  )
                );

              const amount =
                quantity * rate;

              return {
                quoteId: id,

                category:
                  cleanString(
                    item.category
                  ) ||
                  "Production",

                description:
                  cleanString(
                    item.description
                  ) || "",

                quantity,

                unit:
                  cleanString(
                    item.unit
                  ) || "unit",

                rate,

                amount,

                notes:
                  cleanString(
                    item.notes
                  ),
              };
            }
          );

        await db
          .insert(quoteItems)
          .values(rows);
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Return complete updated quote
    |--------------------------------------------------------------------------
    */

    const updated =
      await getQuoteResponse(
        id,
        user.id
      );

    if (!updated) {
      return NextResponse.json(
        {
          error:
            "Quote could not be loaded after update",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      updated
    );
  } catch (error) {
    console.error(
      "PATCH /api/quotes/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update quote",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT /api/quotes/[id]
|--------------------------------------------------------------------------
|
| Some frontend implementations use PUT.
| Keep PUT as an alias for PATCH.
|
|--------------------------------------------------------------------------
*/

export async function PUT(
  req: Request,
  context: RouteContext
) {
  return PATCH(req, context);
}
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  clients,
  invoiceItems,
  invoices,
  quoteItems,
  quotes,
  users,
} from "@/db/schema";

import getCurrentUser from "@/lib/auth/get-current-user";

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

function normalizeCurrency(value: unknown, fallback = "USD") {
  const currency = String(value ?? "")
    .trim()
    .toUpperCase();

  return currency || fallback;
}

async function generateInvoiceNumber(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
) {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const existing = await tx
    .select({
      invoiceNumber: invoices.invoiceNumber,
    })
    .from(invoices)
    .where(
      sql`${invoices.invoiceNumber} LIKE ${`${prefix}%`}`
    )
    .orderBy(sql`${invoices.invoiceNumber} DESC`)
    .limit(1);

  let nextNumber = 1;

  if (existing[0]?.invoiceNumber) {
    const match =
      existing[0].invoiceNumber.match(
        /-(\d+)$/
      );

    if (match) {
      nextNumber =
        Number(match[1]) + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
}

/*
|--------------------------------------------------------------------------
| GET /api/invoices
|--------------------------------------------------------------------------
|
| Returns invoices belonging to the current creator.
|
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

    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const currency = searchParams.get("currency");

    const page = Math.max(
      Number(searchParams.get("page") || 1),
      1
    );

    const limit = Math.min(
      Math.max(
        Number(searchParams.get("limit") || 20),
        1
      ),
      100
    );

    const conditions = [
      eq(invoices.creatorId, user.id),
    ];

    if (status) {
      conditions.push(eq(invoices.status, status));
    }

    if (clientId) {
      conditions.push(eq(invoices.clientId, clientId));
    }

    if (currency) {
      conditions.push(eq(invoices.currency, currency.toUpperCase()));
    }

    const offset = (page - 1) * limit;

    const results = await db
      .select({
        invoice: invoices,
        client: clients,
      })
      .from(invoices)
      .leftJoin(
        clients,
        eq(invoices.clientId, clients.id)
      )
      .where(and(...conditions))
      .orderBy(
        sql`${invoices.createdAt} DESC`
      )
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(invoices)
      .where(and(...conditions));

    return NextResponse.json({
      data: results.map(
        ({ invoice, client }) => ({
          ...invoice,
          client,
        })
      ),
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error) {
    console.error(
      "GET /api/invoices error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch invoices",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PATCH /api/invoices
|--------------------------------------------------------------------------
|
| Updates invoice status.
|
*/

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: "Invoice id and status are required" },
        { status: 400 }
      );
    }

    const [invoice] = await db
      .update(invoices)
      .set({
        status: String(body.status).trim().toLowerCase(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(invoices.id, body.id),
          eq(invoices.creatorId, user.id)
        )
      )
      .returning();

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("PATCH /api/invoices error:", error);

    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/invoices
|--------------------------------------------------------------------------
|
| Supports:
|
| 1. Manual invoice creation
|
|    {
|      clientId,
|      title,
|      items,
|      ...
|    }
|
| 2. Quote → Invoice generation
|
|    {
|      quoteId
|    }
|
| Quote conversion rules:
|
| - quote must belong to current user
| - quote must be accepted
| - quote must not already have an invoice
| - quote items are copied automatically
| - client/currency/amounts/notes are copied
| - quote.invoiceId is populated
|
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

    const quoteId =
      typeof body.quoteId === "string" &&
      body.quoteId.trim()
        ? body.quoteId.trim()
        : null;

    /*
    |--------------------------------------------------------------------------
    | QUOTE → INVOICE
    |--------------------------------------------------------------------------
    */

    if (quoteId) {
      const result =
        await db.transaction(async (tx) => {
          /*
          |--------------------------------------------------------------------------
          | Load quote and verify ownership
          |--------------------------------------------------------------------------
          */

          const quoteResult =
            await tx
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
                eq(
                  quotes.id,
                  quoteId
                )
              )
              .limit(1);

          const record =
            quoteResult[0];

          if (!record) {
            throw new Error(
              "QUOTE_NOT_FOUND"
            );
          }

          const {
            quote,
            client,
          } = record;

          /*
          |--------------------------------------------------------------------------
          | Ownership
          |--------------------------------------------------------------------------
          |
          | Quotes currently inherit creator ownership
          | through their client.
          |
          */

          if (
            !client ||
            client.creatorId !== user.id
          ) {
            throw new Error(
              "FORBIDDEN"
            );
          }

          /*
          |--------------------------------------------------------------------------
          | Must be accepted
          |--------------------------------------------------------------------------
          */

          if (
            quote.status.toLowerCase() !==
            "accepted"
          ) {
            throw new Error(
              "QUOTE_NOT_ACCEPTED"
            );
          }

          /*
          |--------------------------------------------------------------------------
          | Prevent duplicate invoice generation
          |--------------------------------------------------------------------------
          |
          | Check both directions:
          |
          | 1. quotes.invoiceId
          | 2. invoices.quoteId
          |
          | The second check also protects against older data
          | where invoiceId may not have been populated.
          |
          */

          if (quote.invoiceId) {
            throw new Error(
              "INVOICE_ALREADY_EXISTS"
            );
          }

          const existingInvoice =
            await tx
              .select({
                id: invoices.id,
                invoiceNumber:
                  invoices.invoiceNumber,
              })
              .from(invoices)
              .where(
                eq(
                  invoices.quoteId,
                  quote.id
                )
              )
              .limit(1);

          if (existingInvoice[0]) {
            /*
             * Repair the relationship if the invoice exists
             * but quote.invoiceId is missing.
             */
            await tx
              .update(quotes)
              .set({
                invoiceId:
                  existingInvoice[0].id,
                updatedAt: new Date(),
              })
              .where(
                eq(
                  quotes.id,
                  quote.id
                )
              );

            throw new Error(
              "INVOICE_ALREADY_EXISTS"
            );
          }

          /*
          |--------------------------------------------------------------------------
          | Copy quote items
          |--------------------------------------------------------------------------
          */

          const items =
            await tx
              .select()
              .from(quoteItems)
              .where(
                eq(
                  quoteItems.quoteId,
                  quote.id
                )
              );

          if (items.length === 0) {
            throw new Error(
              "QUOTE_HAS_NO_ITEMS"
            );
          }

          /*
          |--------------------------------------------------------------------------
          | Generate invoice number
          |--------------------------------------------------------------------------
          */

          const invoiceNumber =
            await generateInvoiceNumber(
              tx
            );

          /*
          |--------------------------------------------------------------------------
          | Create invoice
          |--------------------------------------------------------------------------
          */

          const [invoice] =
            await tx
              .insert(invoices)
              .values({
                creatorId:
                  user.id,

                clientId:
                  quote.clientId!,

                quoteId:
                  quote.id,

                invoiceNumber,

                title:
                  quote.title ||
                  "Invoice",

                status:
                  "draft",

                issueDate:
                  new Date(),

                notes:
                  quote.notes,

                subtotal:
                  quote.subtotal,

                tax:
                  quote.tax,

                total:
                  quote.total,

                currency:
                  quote.currency,

                createdAt:
                  new Date(),

                updatedAt:
                  new Date(),
              })
              .returning();

          if (!invoice) {
            throw new Error(
              "INVOICE_CREATE_FAILED"
            );
          }

          /*
          |--------------------------------------------------------------------------
          | Copy line items
          |--------------------------------------------------------------------------
          */

          const createdItems =
            await tx
              .insert(invoiceItems)
              .values(
                items.map(
                  (item) => ({
                    invoiceId:
                      invoice.id,

                    description:
                      item.description,

                    quantity:
                      normalizeQuantity(
                        item.quantity
                      ),

                    unitPrice:
                      normalizeNumber(
                        item.rate
                      ),

                    amount:
                      normalizeNumber(
                        item.amount
                      ),

                    createdAt:
                      new Date(),
                  })
                )
              )
              .returning();

          /*
          |--------------------------------------------------------------------------
          | Link quote → invoice
          |--------------------------------------------------------------------------
          */

          const [
            updatedQuote,
          ] = await tx
            .update(quotes)
            .set({
              invoiceId:
                invoice.id,

              /*
               * Once an invoice has been generated,
               * the quote is no longer simply "accepted".
               */
              status:
                "invoiced",

              updatedAt:
                new Date(),
            })
            .where(
              and(
                eq(
                  quotes.id,
                  quote.id
                ),

                /*
                 * Important concurrency guard.
                 *
                 * If another request generated an invoice
                 * between our initial check and this update,
                 * this update will affect zero rows.
                 */
                eq(
                  quotes.status,
                  "accepted"
                )
              )
            )
            .returning();

          if (!updatedQuote) {
            throw new Error(
              "INVOICE_ALREADY_EXISTS"
            );
          }

          return {
            invoice,
            quote:
              updatedQuote,
            client,
            items:
              createdItems,
          };
        });

      return NextResponse.json(
        result,
        {
          status: 201,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | MANUAL INVOICE CREATION
    |--------------------------------------------------------------------------
    |
    | Kept for backwards compatibility.
    |
    */

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
    } = body;

    if (!clientId) {
      return NextResponse.json(
        {
          error:
            "clientId is required",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify client ownership
    |--------------------------------------------------------------------------
    */

    const client =
      await db.query.clients.findFirst({
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

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "At least one invoice item is required",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize manual items
    |--------------------------------------------------------------------------
    */

    const normalizedItems =
      items.map(
        (
          item: Record<
            string,
            unknown
          >
        ) => {
          const quantity =
            normalizeQuantity(
              item.quantity
            );

          const unitPrice =
            Math.max(
              0,
              normalizeNumber(
                item.unitPrice ??
                  item.rate
              )
            );

          return {
            description:
              String(
                item.description ??
                  ""
              ).trim(),

            quantity,

            unitPrice,

            amount:
              quantity *
              unitPrice,
          };
        }
      );

    const calculatedSubtotal =
      normalizedItems.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.amount,
        0
      );

    const calculatedTax =
      Math.max(
        0,
        normalizeNumber(
          tax
        )
      );

    const finalSubtotal =
      subtotal !== undefined
        ? Math.max(
            0,
            normalizeNumber(
              subtotal
            )
          )
        : calculatedSubtotal;

    const finalTotal =
      total !== undefined
        ? Math.max(
            0,
            normalizeNumber(
              total
            )
          )
        : finalSubtotal +
          calculatedTax;

    /*
    |--------------------------------------------------------------------------
    | Generate invoice number if one wasn't supplied
    |--------------------------------------------------------------------------
    */

    const result =
      await db.transaction(
        async (tx) => {
          const finalInvoiceNumber =
            invoiceNumber?.trim() ||
            (await generateInvoiceNumber(
              tx
            ));

          /*
          |--------------------------------------------------------------------------
          | Create invoice
          |--------------------------------------------------------------------------
          */

          const [invoice] =
            await tx
              .insert(invoices)
              .values({
                creatorId:
                  user.id,

                clientId,

                quoteId:
                  null,

                invoiceNumber:
                  finalInvoiceNumber,

                title:
                  String(
                    title ??
                      "Invoice"
                  ).trim() ||
                  "Invoice",

                status:
                  String(
                    status ??
                      "draft"
                  ).trim() ||
                  "draft",

                issueDate:
                  issueDate
                    ? new Date(
                        issueDate
                      )
                    : new Date(),

                dueDate:
                  dueDate
                    ? new Date(
                        dueDate
                      )
                    : null,

                notes:
                  notes
                    ? String(
                        notes
                      ).trim()
                    : null,

                subtotal:
                  finalSubtotal,

                tax:
                  calculatedTax,

                total:
                  finalTotal,

                currency:
                  normalizeCurrency(
                    currency,
                    "USD"
                  ),

                createdAt:
                  new Date(),

                updatedAt:
                  new Date(),
              })
              .returning();

          if (!invoice) {
            throw new Error(
              "INVOICE_CREATE_FAILED"
            );
          }

          /*
          |--------------------------------------------------------------------------
          | Create invoice items
          |--------------------------------------------------------------------------
          */

          const createdItems =
            await tx
              .insert(
                invoiceItems
              )
              .values(
                normalizedItems.map(
                  (item) => ({
                    invoiceId:
                      invoice.id,

                    description:
                      item.description,

                    quantity:
                      item.quantity,

                    unitPrice:
                      item.unitPrice,

                    amount:
                      item.amount,

                    createdAt:
                      new Date(),
                  })
                )
              )
              .returning();

          return {
            invoice,
            client,
            items:
              createdItems,
          };
        }
      );

    return NextResponse.json(
      result,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/invoices error:",
      error
    );

    if (
      error instanceof Error
    ) {
      switch (error.message) {
        case "QUOTE_NOT_FOUND":
          return NextResponse.json(
            {
              error:
                "Quote not found",
            },
            {
              status: 404,
            }
          );

        case "FORBIDDEN":
          return NextResponse.json(
            {
              error:
                "You are not authorized to generate an invoice from this quote",
            },
            {
              status: 403,
            }
          );

        case "QUOTE_NOT_ACCEPTED":
          return NextResponse.json(
            {
              error:
                "Only accepted quotes can be converted into invoices",
            },
            {
              status: 409,
            }
          );

        case "INVOICE_ALREADY_EXISTS":
          return NextResponse.json(
            {
              error:
                "An invoice has already been generated for this quote",
            },
            {
              status: 409,
            }
          );

        case "QUOTE_HAS_NO_ITEMS":
          return NextResponse.json(
            {
              error:
                "Cannot generate an invoice from a quote with no line items",
            },
            {
              status: 400,
            }
          );

        case "INVOICE_CREATE_FAILED":
          return NextResponse.json(
            {
              error:
                "Invoice could not be created",
            },
            {
              status: 500,
            }
          );
      }
    }

    return NextResponse.json(
      {
        error:
          "Failed to create invoice",
      },
      {
        status: 500,
      }
    );
  }
}
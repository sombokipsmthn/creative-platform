import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  clients,
  invoiceItems,
  invoices,
  users,
} from "@/db/schema";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  let user = await db.query.users.findFirst({
    where: eq(users.authUserId, userId),
  });

  if (!user) {
    try {
      const [createdUser] = await db
        .insert(users)
        .values({
          authUserId: userId,
          email:
            process.env.ADMIN_EMAIL ||
            `clerk-${userId}@kipsmthn.com`,
          name: "Creator",
        })
        .onConflictDoNothing({
          target: users.authUserId,
        })
        .returning();

      user =
        createdUser ??
        (await db.query.users.findFirst({
          where: eq(users.authUserId, userId),
        }));
    } catch {
      return null;
    }
  }

  return user ?? null;
}

const STATUS_TRANSITIONS: Record<
  string,
  string[]
> = {
  draft: ["sent"],
  sent: ["paid"],
  paid: [],
  overdue: ["paid"],
  cancelled: [],
};

function canTransitionStatus(
  currentStatus: string,
  nextStatus: string
) {
  if (currentStatus === nextStatus) {
    return true;
  }

  return (
    STATUS_TRANSITIONS[
      currentStatus
    ]?.includes(nextStatus) ?? false
  );
}

/*
|--------------------------------------------------------------------------
| GET /api/invoices/[id]
|--------------------------------------------------------------------------
|
| Returns:
| - invoice
| - client
| - invoice items
|
| The invoice must belong to the current creator.
|
*/

export async function GET(
  req: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Invoice id is required",
        },
        {
          status: 400,
        }
      );
    }

    const result = await db
      .select({
        invoice: invoices,
        client: clients,
      })
      .from(invoices)
      .leftJoin(
        clients,
        eq(
          invoices.clientId,
          clients.id
        )
      )
      .where(
        and(
          eq(invoices.id, id),
          eq(
            invoices.creatorId,
            user.id
          )
        )
      )
      .limit(1);

    const record = result[0];

    if (!record) {
      return NextResponse.json(
        {
          error: "Invoice not found",
        },
        {
          status: 404,
        }
      );
    }

    const items =
      await db.query.invoiceItems.findMany({
        where: eq(
          invoiceItems.invoiceId,
          id
        ),
        orderBy: (
          invoiceItems,
          {
            asc,
          }
        ) => [
          asc(
            invoiceItems.createdAt
          ),
        ],
      });

    return NextResponse.json({
      ...record.invoice,
      client: record.client,
      items,
    });
  } catch (error) {
    console.error(
      "GET /api/invoices/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch invoice",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PATCH /api/invoices/[id]
|--------------------------------------------------------------------------
|
| Currently supports invoice status changes.
|
| Allowed lifecycle:
|
| draft → sent
| sent  → paid
|
| Additionally:
|
| sent    → overdue
| overdue → paid
|
| cancelled is terminal.
|
| Example:
|
| PATCH /api/invoices/:id
| {
|   "status": "sent"
| }
|
*/

export async function PATCH(
  req: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Invoice id is required",
        },
        {
          status: 400,
        }
      );
    }

    const body = await req.json();

    const requestedStatus =
      typeof body.status === "string"
        ? body.status
            .trim()
            .toLowerCase()
        : "";

    if (!requestedStatus) {
      return NextResponse.json(
        {
          error:
            "status is required",
        },
        {
          status: 400,
        }
      );
    }

    const invoiceResult =
      await db
        .select({
          invoice: invoices,
          client: clients,
        })
        .from(invoices)
        .leftJoin(
          clients,
          eq(
            invoices.clientId,
            clients.id
          )
        )
        .where(
          and(
            eq(invoices.id, id),
            eq(
              invoices.creatorId,
              user.id
            )
          )
        )
        .limit(1);

    const record =
      invoiceResult[0];

    if (!record) {
      return NextResponse.json(
        {
          error: "Invoice not found",
        },
        {
          status: 404,
        }
      );
    }

    const currentStatus =
      record.invoice.status
        .trim()
        .toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Validate status
    |--------------------------------------------------------------------------
    */

    const supportedStatuses = [
      "draft",
      "sent",
      "paid",
      "overdue",
      "cancelled",
    ];

    if (
      !supportedStatuses.includes(
        requestedStatus
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid invoice status",
          allowedStatuses:
            supportedStatuses,
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate lifecycle transition
    |--------------------------------------------------------------------------
    */

    if (
      !canTransitionStatus(
        currentStatus,
        requestedStatus
      )
    ) {
      return NextResponse.json(
        {
          error:
            `Invalid invoice status transition: ${currentStatus} → ${requestedStatus}`,
        },
        {
          status: 409,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */

    const [updatedInvoice] =
      await db
        .update(invoices)
        .set({
          status:
            requestedStatus,
          updatedAt:
            new Date(),
        })
        .where(
          and(
            eq(invoices.id, id),
            eq(
              invoices.creatorId,
              user.id
            )
          )
        )
        .returning();

    if (!updatedInvoice) {
      return NextResponse.json(
        {
          error:
            "Invoice could not be updated",
        },
        {
          status: 500,
        }
      );
    }

    const items =
      await db.query.invoiceItems.findMany({
        where: eq(
          invoiceItems.invoiceId,
          id
        ),
        orderBy: (
          invoiceItems,
          {
            asc,
          }
        ) => [
          asc(
            invoiceItems.createdAt
          ),
        ],
      });

    return NextResponse.json({
      ...updatedInvoice,
      client: record.client,
      items,
    });
  } catch (error) {
    console.error(
      "PATCH /api/invoices/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update invoice",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
|
| Treat PUT the same as PATCH so clients using either convention
| can update the invoice lifecycle.
|
*/

export async function PUT(
  req: Request,
  context: RouteContext
) {
  return PATCH(req, context);
}
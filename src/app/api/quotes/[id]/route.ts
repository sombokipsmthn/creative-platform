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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ["draft", "sent"],
  sent: ["sent", "accepted"],
  accepted: ["accepted"],
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
    } catch (error) {
      console.error(
        "Failed to create current user:",
        error
      );

      return null;
    }
  }

  return user ?? null;
}

/*
|--------------------------------------------------------------------------
| Get authorized quote
|--------------------------------------------------------------------------
|
| Quotes now belong directly to a creator through creatorId.
|
| clientId is optional, so authorization must NOT depend on the
| client relationship.
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
      eq(quotes.clientId, clients.id)
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
| GET /api/quotes/[id]
|--------------------------------------------------------------------------
|
| Returns:
|
| - quote
| - client
| - quote items
|
|--------------------------------------------------------------------------
*/

export async function GET(
  _req: Request,
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
          error: "Quote ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const result = await getAuthorizedQuote(
      id,
      user.id
    );

    if (!result) {
      return NextResponse.json(
        {
          error: "Quote not found",
        },
        {
          status: 404,
        }
      );
    }

    const items = await db
      .select()
      .from(quoteItems)
      .where(
        eq(
          quoteItems.quoteId,
          result.quote.id
        )
      )
      .orderBy(quoteItems.createdAt);

    return NextResponse.json({
      ...result.quote,
      client: result.client,
      items,
    });
  } catch (error) {
    console.error(
      "GET /api/quotes/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch quote",
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
| Allowed lifecycle:
|
| draft
|   ↓
| sent
|   ↓
| accepted
|
| Accepted quotes cannot move backwards.
|
|--------------------------------------------------------------------------
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
          error: "Quote ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const existing = await getAuthorizedQuote(
      id,
      user.id
    );

    if (!existing) {
      return NextResponse.json(
        {
          error: "Quote not found",
        },
        {
          status: 404,
        }
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON body",
        },
        {
          status: 400,
        }
      );
    }

    const requestedStatus = String(
      body?.status ?? ""
    )
      .trim()
      .toLowerCase();

    if (!requestedStatus) {
      return NextResponse.json(
        {
          error: "status is required",
        },
        {
          status: 400,
        }
      );
    }

    const currentStatus = String(
      existing.quote.status ?? "draft"
    )
      .trim()
      .toLowerCase();

    const allowedTransitions =
      STATUS_TRANSITIONS[currentStatus] ?? [];

    if (
      !allowedTransitions.includes(
        requestedStatus
      )
    ) {
      return NextResponse.json(
        {
          error: `Invalid quote status transition: ${currentStatus} → ${requestedStatus}`,
          currentStatus,
          allowedStatuses: allowedTransitions,
        },
        {
          status: 409,
        }
      );
    }

    /*
     * No-op status update.
     */
    if (requestedStatus === currentStatus) {
      const items = await db
        .select()
        .from(quoteItems)
        .where(
          eq(
            quoteItems.quoteId,
            existing.quote.id
          )
        )
        .orderBy(quoteItems.createdAt);

      return NextResponse.json({
        ...existing.quote,
        client: existing.client,
        items,
      });
    }

    /*
     * Update status only.
     *
     * creatorId is included in the WHERE clause so another
     * creator cannot update a quote they do not own.
     */
    const [updatedQuote] = await db
      .update(quotes)
      .set({
        status: requestedStatus,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(quotes.id, id),
          eq(quotes.creatorId, user.id),
          eq(quotes.status, currentStatus)
        )
      )
      .returning();

    if (!updatedQuote) {
      return NextResponse.json(
        {
          error:
            "Quote could not be updated. It may have changed status.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Fetch the updated quote again so the response contains
     * the client and line items.
     */
    const result = await getAuthorizedQuote(
      id,
      user.id
    );

    if (!result) {
      return NextResponse.json(
        {
          error: "Quote not found",
        },
        {
          status: 404,
        }
      );
    }

    const items = await db
      .select()
      .from(quoteItems)
      .where(
        eq(quoteItems.quoteId, id)
      )
      .orderBy(quoteItems.createdAt);

    return NextResponse.json({
      ...result.quote,
      client: result.client,
      items,
    });
  } catch (error) {
    console.error(
      "PATCH /api/quotes/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update quote",
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
| Some frontend implementations use PUT for updates.
| Keep it as an alias for PATCH.
|
|--------------------------------------------------------------------------
*/

export async function PUT(
  req: Request,
  context: RouteContext
) {
  return PATCH(req, context);
}
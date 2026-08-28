import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { db } from "@/db";
import { clients, users } from "@/db/schema";

/* =========================================================
   HELPERS
   ========================================================= */

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function getStatus(value: unknown): string {
  const status = cleanString(value);

  return status ?? "active";
}

function getFeedbackStatus(value: unknown): string {
  const status = cleanString(value);

  return status ?? "AWAITING_FEEDBACK";
}

function getContractStatus(value: unknown): string {
  const status = cleanString(value);

  return status ?? "NOT_SENT";
}

function getEtimsInvoiceStatus(value: unknown): string {
  const status = cleanString(value);

  return status ?? "NOT_SENT";
}

function getTaxCertificateStatus(value: unknown): string {
  const status = cleanString(value);

  return status ?? "NOT_RECEIVED";
}

/* =========================================================
   CURRENT USER
   ========================================================= */

import { getCurrentUser } from "@/lib/auth/get-current-user";

/* =========================================================
   GET
   =========================================================
   Returns all clients belonging to the current creator.
   ========================================================= */

export async function GET() {
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

    const results =
      await db.query.clients.findMany({
        where: eq(
          clients.creatorId,
          user.id
        ),
        orderBy: (
          clients,
          { desc }
        ) =>
          desc(
            clients.createdAt
          ),
      });

    return NextResponse.json(
      results
    );
  } catch (error) {
    console.error(
      "GET /api/clients error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch clients",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST
   =========================================================
   Creates a new client.
   ========================================================= */

export async function POST(
  request: Request
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

    const body =
      await request.json();

    const name =
      cleanString(body?.name);

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Client name is required",
        },
        {
          status: 400,
        }
      );
    }

    const status =
      getStatus(body?.status);

    const feedbackStatus =
      getFeedbackStatus(
        body?.feedbackStatus
      );

    const contractStatus =
      getContractStatus(
        body?.contractStatus
      );

    const etimsInvoiceStatus =
      getEtimsInvoiceStatus(
        body?.etimsInvoiceStatus
      );

    const taxCertificateStatus =
      getTaxCertificateStatus(
        body?.taxCertificateStatus
      );

    /*
     * Explicitly type the object against the
     * Drizzle insert model.
     *
     * This prevents the overloaded `.values()`
     * call from incorrectly inferring the inline
     * object as the array overload.
     */

    const clientInsert: InferInsertModel<
      typeof clients
    > = {
      id: crypto.randomUUID(),

      creatorId: user.id,

      name,

      company:
        cleanString(
          body?.company
        ),

      email:
        cleanString(
          body?.email
        ),

      phone:
        cleanString(
          body?.phone
        ),

      website:
        cleanString(
          body?.website
        ),

      location:
        cleanString(
          body?.location
        ),

      notes:
        cleanString(
          body?.notes
        ),

      status,

      feedbackStatus,

      contractStatus,

      etimsInvoiceStatus,

      taxCertificateStatus,
    };

    const [client] =
      await db
        .insert(clients)
        .values(clientInsert)
        .returning();

    if (!client) {
      return NextResponse.json(
        {
          error:
            "Client could not be created",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      client,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/clients error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create client",
      },
      {
        status: 500,
      }
    );
  }
}
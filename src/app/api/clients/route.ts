import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { withCreatorApi, ApiError } from "@/lib/api/route-boundaries";

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
   GET
   =========================================================
   Returns all clients belonging to the current creator.
   ========================================================= */

export async function GET(req: Request) {
  return withCreatorApi(req, async (_request, user) => {
    const results = await db.query.clients.findMany({
      where: eq(clients.creatorId, user.id),
      orderBy: (clients, { desc }) => desc(clients.createdAt),
    });

    return results;
  });
}

/* =========================================================
   POST
   =========================================================
   Creates a new client.
   ========================================================= */

export async function POST(request: Request) {
  return withCreatorApi(
    request,
    async (req, user) => {
      const body = await req.json();

      const name = cleanString(body?.name);

      if (!name) {
        throw new ApiError("Client name is required", 400);
      }

      const clientInsert: InferInsertModel<typeof clients> = {
        id: crypto.randomUUID(),
        creatorId: user.id,
        name,
        company: cleanString(body?.company),
        email: cleanString(body?.email),
        phone: cleanString(body?.phone),
        website: cleanString(body?.website),
        location: cleanString(body?.location),
        notes: cleanString(body?.notes),
        status: getStatus(body?.status),
        feedbackStatus: getFeedbackStatus(body?.feedbackStatus),
        contractStatus: getContractStatus(body?.contractStatus),
        etimsInvoiceStatus: getEtimsInvoiceStatus(body?.etimsInvoiceStatus),
        taxCertificateStatus: getTaxCertificateStatus(body?.taxCertificateStatus),
      };

      const [client] = await db
        .insert(clients)
        .values(clientInsert)
        .returning();

      if (!client) {
        throw new ApiError("Client could not be created", 500);
      }

      return client;
    },
    { status: 201 }
  );
}
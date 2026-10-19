import { NextResponse } from "next/server";

import { withCreatorApi } from "@/lib/api/route-boundaries";
import { clients } from "@/db/schema";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import crypto from "node:crypto";

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

export async function GET(req: Request) {
  return withCreatorApi(req, async (_request, user) => {
    const results = await db.query.clients.findMany({
      where: eq(clients.creatorId, user.id),
      orderBy: (clients, { desc }) => desc(clients.createdAt),
    });
    return results;
  });
}

export async function POST(request: Request) {
  return withCreatorApi(
    request,
    async (_request, user) => {
      const body = await request.json();

      const name = cleanString(body?.name);
      if (!name) {
        return NextResponse.json({ error: "Client name is required" }, { status: 400 });
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

      const [client] = await db.insert(clients).values(clientInsert).returning();
      if (!client) {
        return NextResponse.json({ error: "Client could not be created" }, { status: 500 });
      }
      return NextResponse.json(client, { status: 201 });
    },
    { status: 201 }
  );
}

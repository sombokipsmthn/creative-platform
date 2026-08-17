import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { clients, invoices, invoiceItems, users } from "@/db/schema";

async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  let user = await db.query.users.findFirst({
    where: eq(users.authUserId, userId),
  });

  // Automatically create the local user record
  // if Clerk knows the user but our DB does not.
  if (!user) {
    const [createdUser] = await db
      .insert(users)
      .values({
        authUserId: userId,
        email: `clerk-${userId}@placeholder.local`,
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
  }

  return user ?? null;
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    const whereCondition = clientId
      ? and(
          eq(invoices.creatorId, user.id),
          eq(invoices.clientId, clientId)
        )
      : eq(invoices.creatorId, user.id);

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
      .where(whereCondition)
      .orderBy(desc(invoices.createdAt));

    const invoiceIds = results.map(
      ({ invoice }) => invoice.id
    );

    const items =
      invoiceIds.length > 0
        ? await db
            .select()
            .from(invoiceItems)
            .where(
              inArray(
                invoiceItems.invoiceId,
                invoiceIds
              )
            )
        : [];

    const response = results.map(
      ({ invoice, client }) => ({
        ...invoice,
        client,
        items: items.filter(
          (item) =>
            item.invoiceId === invoice.id
        ),
      })
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "GET /api/invoices error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

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
      invoiceNumber,
      title,
      status,
      issueDate,
      dueDate,
      notes,
      currency,
      tax,
      items,
    } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      );
    }

    if (!invoiceNumber) {
      return NextResponse.json(
        { error: "invoiceNumber is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error:
            "At least one invoice item is required",
        },
        { status: 400 }
      );
    }

    const client =
      await db.query.clients.findFirst({
        where: and(
          eq(clients.id, clientId),
          eq(clients.creatorId, user.id)
        ),
      });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    let subtotal = 0;

    const normalizedItems = items.map(
      (item: Record<string, unknown>) => {
        const quantity = Math.max(
          1,
          Number(item.quantity) || 1
        );

        const unitPrice = Math.max(
          0,
          Math.round(
            Number(item.unitPrice) || 0
          )
        );

        const amount =
          quantity * unitPrice;

        subtotal += amount;

        return {
          description: String(
            item.description ?? ""
          ).trim(),
          quantity,
          unitPrice,
          amount,
        };
      }
    );

    const taxAmount = Math.max(
      0,
      Math.round(Number(tax) || 0)
    );

    const total =
      subtotal + taxAmount;

    const [invoice] = await db
      .insert(invoices)
      .values({
        creatorId: user.id,
        clientId,
        invoiceNumber:
          String(invoiceNumber).trim(),
        title:
          String(title ?? "Invoice").trim() ||
          "Invoice",
        status:
          String(status ?? "draft").trim() ||
          "draft",
        issueDate: issueDate
          ? new Date(issueDate)
          : new Date(),
        dueDate: dueDate
          ? new Date(dueDate)
          : null,
        notes: notes
          ? String(notes).trim()
          : null,
        currency:
          String(currency ?? "USD")
            .trim()
            .toUpperCase() || "USD",
        subtotal,
        tax: taxAmount,
        total,
      })
      .returning();

    const createdItems =
      await db
        .insert(invoiceItems)
        .values(
          normalizedItems.map(
            (item) => ({
              invoiceId: invoice.id,
              ...item,
            })
          )
        )
        .returning();

    return NextResponse.json(
      {
        ...invoice,
        client,
        items: createdItems,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/invoices error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
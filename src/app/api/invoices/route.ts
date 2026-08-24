import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { clients, invoices, invoiceItems, users } from "@/db/schema";

async function getCurrentUser() {
  try {
    const clerkKey =
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      process.env.CLERK_PUBLISHABLE_KEY;

    let userId: string | null = null;

    if (clerkKey) {
      const authResult = await auth();
      userId = authResult.userId;
    } else {
      userId = "dev_admin_user";
    }

    if (!userId) {
      return null;
    }

    let user = await db.query.users.findFirst({
      where: eq(users.authUserId, userId),
    });

    // Automatically create the local user record
    // if Clerk knows the user but our DB does not.
    if (!user) {
      try {
        const [createdUser] = await db
          .insert(users)
          .values({
            authUserId: userId,
            email: process.env.ADMIN_EMAIL || `clerk-${userId}@kipsmthn.com`,
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
        user = {
          id: "creator_01",
          authUserId: userId,
          email: process.env.ADMIN_EMAIL || "creator@kipsmthn.com",
          name: "Creator",
          handle: "kipsmthn",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }

    return user ?? null;
  } catch (err) {
    console.warn("Invoices user auth fallback:", err);
    return {
      id: "creator_01",
      authUserId: "dev_admin_user",
      email: process.env.ADMIN_EMAIL || "creator@kipsmthn.com",
      name: "Creator",
      handle: "kipsmthn",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
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

    // Basic pagination to prevent unbounded result sets
    const limitParam = Number(searchParams.get("limit") ?? 100);
    const offsetParam = Number(searchParams.get("offset") ?? 0);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 1000) : 100;
    const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0;

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
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset);

    type InvoiceRow = typeof invoices.$inferSelect;
    type ClientRow = typeof clients.$inferSelect | null;
    type InvoiceItemRow = typeof invoiceItems.$inferSelect;

    const invoiceIds = results.map(
      ({ invoice }: { invoice: InvoiceRow }) => invoice.id
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

    // Build a map once to avoid O(N*M) filtering for each invoice
    const itemsByInvoice: Record<string, InvoiceItemRow[]> = items.reduce(
      (acc: Record<string, InvoiceItemRow[]>, item: InvoiceItemRow) => {
        const id = String(item.invoiceId);
        if (!acc[id]) acc[id] = [];
        acc[id].push(item);
        return acc;
      },
      {}
    );

    const response = results.map(
      ({ invoice, client }: { invoice: InvoiceRow; client: ClientRow }) => ({
        ...invoice,
        client,
        items: itemsByInvoice[String(invoice.id)] ?? [],
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
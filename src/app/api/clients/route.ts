import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { clients, users } from "@/db/schema";

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

    if (!userId) return null;

    let user = await db.query.users.findFirst({
      where: eq(users.authUserId, userId),
    });

    if (!user) {
      try {
        const [created] = await db
          .insert(users)
          .values({
            authUserId: userId,
            email: process.env.ADMIN_EMAIL || "creator@kipsmthn.com",
            name: "Somboriot Kipchilat",
          })
          .onConflictDoNothing()
          .returning();

        user = created ?? (await db.query.users.findFirst({
          where: eq(users.authUserId, userId),
        }));
      } catch {
        user = {
          id: "creator_01",
          authUserId: userId,
          email: process.env.ADMIN_EMAIL || "creator@kipsmthn.com",
          name: "Somboriot Kipchilat",
          handle: "kipsmthn",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }

    return user ?? null;
  } catch (error) {
    console.warn("User auth fallback:", error);
    return {
      id: "creator_01",
      authUserId: "dev_admin_user",
      email: process.env.ADMIN_EMAIL || "creator@kipsmthn.com",
      name: "Somboriot Kipchilat",
      handle: "kipsmthn",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

function cleanString(value: unknown) {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await db
      .select()
      .from(clients)
      .where(eq(clients.creatorId, user.id));

    return NextResponse.json(Array.isArray(results) ? results : []);
  } catch (error) {
    console.error("GET /api/clients error:", error);

    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const name = cleanString(body?.name);

    if (!name) {
      return NextResponse.json(
        { error: "Client name is required" },
        { status: 400 }
      );
    }

    const status = cleanString(body?.status) || "active";

    const allowedStatuses = ["active", "inactive", "archived"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid client status" },
        { status: 400 }
      );
    }

    const [client] = await db
      .insert(clients)
      .values({
        id: crypto.randomUUID(),
        creatorId: user.id,
        name,
        company: cleanString(body?.company),
        email: cleanString(body?.email),
        phone: cleanString(body?.phone),
        website: cleanString(body?.website),
        notes: cleanString(body?.notes),
        status,
      })
      .returning();

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("POST /api/clients error:", error);

    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}

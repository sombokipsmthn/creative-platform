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
        // Fallback user object if DB is not connected
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

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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

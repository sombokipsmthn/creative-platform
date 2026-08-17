import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { clients, users } from "@/db/schema";

async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.authUserId, userId),
  });

  return user ?? null;
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

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/clients error:", error);

    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
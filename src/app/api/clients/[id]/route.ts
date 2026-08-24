import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

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

    const user = await db.query.users.findFirst({
      where: eq(users.authUserId, userId),
    });

    return user ?? null;
  } catch (error) {
    console.error("Client API auth error:", error);
    return null;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const status = typeof body?.status === "string" ? body.status.trim() : "";
    const allowedStatuses = ["active", "inactive", "archived"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid client status" },
        { status: 400 }
      );
    }

    const [updatedClient] = await db
      .update(clients)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(and(eq(clients.id, id), eq(clients.creatorId, user.id)))
      .returning();

    if (!updatedClient) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("PATCH /api/clients/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

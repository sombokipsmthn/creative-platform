import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db/index";
import { users } from "@/db/schema";

export async function GET() {
  try {
    const clerkKey =
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      process.env.CLERK_PUBLISHABLE_KEY;

    if (clerkKey) {
      const { userId } = await auth();

      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

      if (adminEmail) {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);
        const email = user.primaryEmailAddress?.emailAddress.toLowerCase();

        if (email && email !== adminEmail) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }

    const result = await db.select().from(users);

    return NextResponse.json({
      success: true,
      count: Array.isArray(result) ? result.length : 0,
      users: Array.isArray(result) ? result : [],
    });
  } catch (error) {
    console.error("Database test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Database connection failed",
      },
      { status: 500 }
    );
  }
}

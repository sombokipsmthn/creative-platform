import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { users } from "@/db/schema";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const result = await db.select().from(users);
    return NextResponse.json({ success: true, count: result.length, users: result });
  } catch (error) {
    console.error("Database test failed:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Database connection failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { users } from "@/db/schema";

export async function GET() {
  try {
    const result = await db.select().from(users);

    return NextResponse.json({
      success: true,
      count: result.length,
      users: result,
    });
  } catch (error) {
    console.error("Database test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
      },
      { status: 500 }
    );
  }
}
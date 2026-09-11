import { NextResponse } from "next/server";

/**
 * Health check endpoint for Docker container orchestration.
 * 
 * Returns 200 if the application and database are operational.
 */
export async function GET() {
  try {
    // Test database connection by running a simple query
    // This will fail fast if DB is unreachable
    const { db } = await import("@/db");
    await db.query.users.findFirst();

    return NextResponse.json(
      { status: "ok", timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { 
        status: "error", 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}

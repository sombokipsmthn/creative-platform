import { NextResponse, NextRequest } from "next/server";
import { getDatabaseMetrics, queryMonitor } from "@/lib/db-monitoring";

/**
 * GET /api/metrics/queries
 * Returns database query performance metrics
 * 
 * SECURITY: In production, protect this endpoint with authentication
 * and restrict access to admins only
 */
export async function GET(request: NextRequest) {
  // Security check: Verify admin authorization
  // TODO: Replace with your actual auth check
  const isAdmin = request.headers.get("x-admin-key") === process.env.ADMIN_METRICS_KEY;
  
  if (!isAdmin && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  return NextResponse.json(getDatabaseMetrics());
}

/**
 * POST /api/metrics/queries/reset
 * Resets query metrics (useful for testing)
 */
export async function POST(request: NextRequest) {
  const isAdmin = request.headers.get("x-admin-key") === process.env.ADMIN_METRICS_KEY;
  
  if (!isAdmin && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  queryMonitor.reset();
  return NextResponse.json({ success: true, message: "Metrics reset" });
}

import { NextResponse, NextRequest } from "next/server";
import { getDatabaseMetrics, queryMonitor } from "@/lib/db-monitoring";
import { getCurrentUserFromRequest } from "@/lib/auth/get-current-user";

async function isAdmin(request: NextRequest) {
  const configuredKey = process.env.ADMIN_METRICS_KEY?.trim();
  const headerKey = request.headers.get("x-admin-key");
  const hasValidKey = Boolean(configuredKey && headerKey && headerKey === configuredKey);

  const user = await getCurrentUserFromRequest(request);
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const hasAuthenticatedAdmin = Boolean(
    user && adminEmail && user.email.toLowerCase() === adminEmail,
  );

  return hasValidKey || hasAuthenticatedAdmin;
}

/**
 * GET /api/metrics/queries
 * Returns database query performance metrics
 * 
 * SECURITY: In production, protect this endpoint with authentication
 * and restrict access to admins only
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
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
  if (!(await isAdmin(request))) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  queryMonitor.reset();
  return NextResponse.json({ success: true, message: "Metrics reset" });
}

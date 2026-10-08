/**
 * Health check endpoint for infrastructure monitoring.
 *
 * Provides detailed health status for:
 * - Application server (Node.js process)
 * - Database connectivity
 * - External service dependencies
 *
 * Returns 200 OK when healthy, 503 Service Unavailable when degraded.
 * Used by Vercel platform monitoring and load balancers.
 *
 * @module api/health
 * @see docs/soc2/LOGGING_MONITORING_PLAN.md
 */

import { NextResponse } from "next/server";
import { logSecurityEvent } from "@/lib/security-logger";
import { logInfrastructureFailure } from "@/lib/monitoring";

/**
 * Health check result status.
 */
type HealthStatus = "healthy" | "degraded" | "unhealthy";

/**
 * Individual component health status.
 */
interface ComponentHealth {
  status: HealthStatus;
  latencyMs: number;
  details?: string;
}

/**
 * Overall health check response.
 */
interface HealthCheckResponse {
  status: HealthStatus;
  timestamp: string;
  version: string;
  components: {
    database: ComponentHealth;
    clerk: ComponentHealth;
    storage: ComponentHealth;
    runtime: ComponentHealth;
  };
  uptime: number;
}

/**
 * Check database connectivity.
 */
async function checkDatabase(): Promise<ComponentHealth> {
  const startTime = Date.now();
  try {
    const { db } = await import("@/db");
    // Run a lightweight query to test connectivity
    await db.query.users.findFirst();
    const latency = Date.now() - startTime;

    if (latency > 1000) {
      return {
        status: "degraded",
        latencyMs: latency,
        details: `Database query took ${latency}ms (threshold: 1000ms)`,
      };
    }

    return { status: "healthy", latencyMs: latency };
  } catch (error) {
    const latency = Date.now() - startTime;
    logInfrastructureFailure(
      "database",
      `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      { latencyMs: latency }
    );
    return {
      status: "unhealthy",
      latencyMs: latency,
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check Clerk authentication service.
 */
async function checkClerk(): Promise<ComponentHealth> {
  const startTime = Date.now();
  try {
    // Try to import Clerk to verify it's configured
    await import("@clerk/nextjs/server");
    const latency = Date.now() - startTime;
    return { status: "healthy", latencyMs: latency };
  } catch (error) {
    const latency = Date.now() - startTime;
    logInfrastructureFailure(
      "clerk",
      `Service check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      { latencyMs: latency }
    );
    return {
      status: "unhealthy",
      latencyMs: latency,
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check storage service (Vercel Blob).
 */
async function checkStorage(): Promise<ComponentHealth> {
  const startTime = Date.now();

  // Check if storage token is configured
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  const latency = Date.now() - startTime;

  if (!hasToken) {
    return {
      status: "degraded",
      latencyMs: latency,
      details: "Storage token not configured",
    };
  }

  return { status: "healthy", latencyMs: latency };
}

/**
 * Check runtime environment.
 */
function checkRuntime(): ComponentHealth {
  const startTime = Date.now();

  const checks = {
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    platform: process.platform,
    arch: process.arch,
  };

  // Log memory usage as warning if high
  const { rss } = checks.memoryUsage;
  if (rss > 500 * 1024 * 1024) {
    // > 500MB
    logSecurityEvent({
      severity: "medium",
      eventType: "infra_memory_high",
      message: `High memory usage detected: ${(rss / 1024 / 1024).toFixed(2)} MB RSS`,
      details: { rss, nodeVersion: checks.nodeVersion },
    });
  }

  const latency = Date.now() - startTime;
  return { status: "healthy", latencyMs: latency };
}

/**
 * GET handler for health check endpoint.
 */
export async function GET(request: Request) {
  const startTime = Date.now();
  const componentChecks = await Promise.allSettled([
    checkDatabase(),
    checkClerk(),
    checkStorage(),
    Promise.resolve(checkRuntime()),
  ]);

  const [database, clerk, storage, runtime] = componentChecks.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    // If check failed, mark as unhealthy
    return {
      status: "unhealthy" as const,
      latencyMs: Date.now() - startTime,
      details: result.reason instanceof Error ? result.reason.message : "Unknown error",
    };
  });

  // Determine overall status
  const statuses = [database.status, clerk.status, storage.status, runtime.status];
  const overallStatus: HealthStatus = statuses.some((s) => s === "unhealthy")
    ? "unhealthy"
    : statuses.some((s) => s === "degraded")
      ? "degraded"
      : "healthy";

  const responseTime = Date.now() - startTime;

  const healthCheck: HealthCheckResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || "development",
    components: {
      database,
      clerk,
      storage,
      runtime,
    },
    uptime: process.uptime(),
  };

  // Log health check result
  logSecurityEvent({
    severity: overallStatus === "healthy" ? "info" : "high",
    eventType: "infra_health_check_failed",
    message: `Health check: ${overallStatus} (${responseTime}ms)`,
    details: {
      components: {
        database: database.status,
        clerk: clerk.status,
        storage: storage.status,
        runtime: runtime.status,
      },
      responseTime,
    },
  });

  const status = overallStatus === "healthy" ? 200 : 503;
  return NextResponse.json(healthCheck, { status });
}

/**
 * POST handler for triggering custom health checks or diagnostics.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Execute diagnostic based on request
    const diagnostics = {
      timestamp: new Date().toISOString(),
      checks: {} as Record<string, { status: string; details?: string }>,
    };

    if (body.checks?.database) {
      const dbCheck = await checkDatabase();
      diagnostics.checks.database = {
        status: dbCheck.status,
        details: dbCheck.details,
      };
    }

    if (body.checks?.clerk) {
      const clerkCheck = await checkClerk();
      diagnostics.checks.clerk = {
        status: clerkCheck.status,
        details: clerkCheck.details,
      };
    }

    if (body.checks?.storage) {
      const storageCheck = await checkStorage();
      diagnostics.checks.storage = {
        status: storageCheck.status,
        details: storageCheck.details,
      };
    }

    return NextResponse.json(diagnostics);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Diagnostic check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

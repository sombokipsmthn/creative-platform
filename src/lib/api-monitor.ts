/**
 * API request monitoring wrapper for structured logging.
 *
 * Provides higher-order functions to wrap API handlers with
 * automatic logging of requests, responses, errors, and performance.
 *
 * @module lib/api-monitor
 * @see docs/soc2/LOGGING_MONITORING_PLAN.md
 */

import { NextResponse } from "next/server";
import { logSecurityEvent } from "./security-logger";
import {
  type ApiErrorCategory,
  logApiError,
  logApiPerformance,
  logRateLimitEvent,
} from "./monitoring";

/**
 * API request context for logging.
 */
interface RequestContext {
  method: string;
  path: string;
  userId?: string;
  ipHash?: string;
  userAgent?: string | null;
  timestamp: string;
}

/**
 * API response context for logging.
 */
interface ResponseContext {
  status: number;
  durationMs: number;
  requestId?: string;
}

/**
 * Monitor options for API request tracking.
 */
interface MonitorOptions {
  trackPerformance?: boolean;
  logRequestBody?: boolean;
  logResponseType?: "structured" | "summary";
  sensitivePaths?: string[];
}

const DEFAULT_OPTIONS: MonitorOptions = {
  trackPerformance: true,
  logResponseType: "structured",
  sensitivePaths: [
    "/api/auth",
    "/api/webhooks",
    "/api/profile",
    "/api/contracts/[id]/send",
  ],
};

/**
 * Wrap an API handler with monitoring and logging.
 *
 * @param handler - The API handler function
 * @param options - Monitoring options
 * @returns Wrapped handler with automatic logging
 */
export function withMonitoring<P extends unknown[]>(
  handler: (request: Request, ...args: P) => Promise<NextResponse>,
  options: MonitorOptions = DEFAULT_OPTIONS
): (request: Request, ...args: P) => Promise<NextResponse> {
  return async (request, ...args) => {
    const startTime = Date.now();
    const path = new URL(request.url).pathname;
    const method = request.method;
    const requestId = request.headers.get("x-request-id") || `req_${Date.now()}`;
    const isSensitive = options.sensitivePaths?.some((p) => path.startsWith(p)) || false;

    // Log request start
    logSecurityEvent({
      severity: "info",
      eventType: "access_admin_access_denied",
      message: `${method} ${isSensitive ? "[SENSITIVE]" : path}`,
      details: {
        requestId,
        method,
        path: isSensitive ? "[SENSITIVE]" : path,
        timestamp: new Date().toISOString(),
      },
    });

    try {
      // Execute handler
      const response = await handler(request, ...args);

      // Log response
      const durationMs = Date.now() - startTime;
      const status = response.status;

      // Log performance metrics
      if (options.trackPerformance) {
        logApiPerformance(path, method, durationMs, status);
      }

      // Log error responses
      if (status >= 400) {
        const category = getErrorCategory(status);
        logApiError(category, response.statusText || "Request failed", status, {
          requestId,
          durationMs,
        });
      }

      return response;
    } catch (error) {
      const durationMs = Date.now() - startTime;

      // Log unhandled exception
      logApiError(
        "internal_server_error",
        error instanceof Error ? error.message : "Internal server error",
        500,
        {
          requestId,
          durationMs,
          stack: sanitizeStack(error instanceof Error ? error.stack : undefined),
        }
      );

      logSecurityEvent({
        severity: "critical",
        eventType: "system_secret_access",
        message: `Unhandled exception in ${method} ${path}`,
        details: {
          requestId,
          durationMs,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      // Return error response
      return NextResponse.json(
        {
          error: "Internal server error",
          requestId,
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Determine API error category based on status code.
 */
function getErrorCategory(status: number): ApiErrorCategory {
  switch (status) {
    case 400:
      return "validation_error";
    case 401:
      return "authentication_error";
    case 403:
      return "authorization_error";
    case 404:
      return "not_found_error";
    case 429:
      return "rate_limit_error";
    case 500:
      return "internal_server_error";
    case 502:
    case 503:
    case 504:
      return "timeout_error";
    default:
      return "internal_server_error";
  }
}

/**
 * Sanitize error stack traces for safe logging.
 */
function sanitizeStack(stack?: string): string {
  if (!stack) return "";
  // Remove sensitive paths
  return stack
    .replace(/\/Users\/[^\/]+\/\./g, "/Users/[REDACTED]/")
    .replace(/C:\\[^\\]+/g, "[REDACTED_PATH]")
    .replace(/internal\/modules\//g, "modules/")
    .replace(/node_modules\//g, "");
}

/**
 * Create a rate limit middleware wrapper.
 *
 * @param maxRequests - Maximum requests per window
 * @param windowMs - Time window in milliseconds
 * @param keyGenerator - Function to generate rate limit key
 * @returns Middleware function
 */
export function createRateLimitMiddleware(
  maxRequests: number,
  windowMs: number,
  keyGenerator: (request: Request) => string
) {
  const requests = new Map<string, number[]>();

  return async function rateLimitMiddleware(request: Request) {
    const key = keyGenerator(request);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request timestamps
    let timestamps = requests.get(key) || [];
    timestamps = timestamps.filter((ts) => ts > windowStart);

    if (timestamps.length >= maxRequests) {
      // Rate limited
      const retryAfter = Math.ceil((timestamps[0] + windowMs - now) / 1000);

      // Log rate limit event
      logRateLimitEvent(key, maxRequests, timestamps.length, retryAfter);

      logSecurityEvent({
        severity: "medium",
        eventType: "access_gallery_rate_limited",
        message: `Rate limit exceeded for key: ${key}`,
        details: { maxRequests, current: timestamps.length, retryAfter },
      });

      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    // Add current request
    timestamps.push(now);
    requests.set(key, timestamps);

    return null; // Continue to next handler
  };
}

/**
 * Log API key usage for security monitoring.
 */
export function logApiKeyEvent(
  apiKeyPrefix: string,
  action: string,
  success: boolean,
  metadata: Record<string, unknown> = {}
): void {
  logSecurityEvent({
    severity: success ? "info" : "high",
    eventType: "system_api_key_rotate",
    message: `API key ${success ? "used" : "failed"}: ${action}`,
    details: {
      apiKeyPrefix,
      action,
      success,
      ...metadata,
    },
  });
}

/**
 * Log database query performance.
 */
export function logDatabaseQuery(
  query: string,
  durationMs: number,
  rowCount: number,
  error?: string
): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level: error ? "error" : durationMs > 1000 ? "warn" : "info",
    type: "database_query",
    query: truncateQuery(query),
    durationMs,
    rowCount,
    error,
  };

  console.log(JSON.stringify(entry));

  if (error) {
    console.error(`[ERROR] [DB] Query failed: ${error} (${durationMs}ms)`);
    logApiError("database_error", error, 500, { durationMs, rowCount });
  } else if (durationMs > 1000) {
    console.warn(`[WARN] [DB] Slow query: ${durationMs}ms for ${rowCount} rows`);
  }
}

/**
 * Truncate query for safe logging.
 */
function truncateQuery(query: string, maxLen = 200): string {
  return query.length > maxLen ? query.slice(0, maxLen) + "..." : query;
}

// Re-export for convenience
export { logSecurityEvent } from "./security-logger";

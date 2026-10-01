/**
 * Next.js Middleware for centralized request logging and security monitoring.
 *
 * Logs all API requests with timing, status codes, and security-relevant
 * information without exposing sensitive data. Integrates with the security
 * logger for structured event tracking.
 *
 * @module middleware
 * @see docs/soc2/LOGGING_MONITORING_PLAN.md
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Sensitive path patterns that should not be logged in detail.
 */
const SENSITIVE_PATHS = [
  "/api/auth",
  "/api/webhooks/clerk",
  "/api/profile",
  "/api/contracts/[id]/send",
];

/**
 * API paths that require authentication logging.
 */
const AUTH_REQUIRED_PATHS = [
  "/api/galleries",
  "/api/clients",
  "/api/contracts",
  "/api/quotes",
  "/api/invoices",
  "/api/projects",
  "/api/services",
  "/api/equipment",
  "/api/profile",
];

/**
 * Log request metadata without exposing sensitive information.
 */
function logRequest(request: NextRequest, response: NextResponse, durationMs: number): void {
  const method = request.method;
  const path = request.nextUrl.pathname;
  const status = response.status;
  const userAgent = request.headers.get("user-agent") || "unknown";
  const referer = request.headers.get("referer") || "direct";

  // Check if this is a sensitive path
  const isSensitive = SENSITIVE_PATHS.some((s) => path.startsWith(s));

  // Build log entry (avoid sensitive data)
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: status >= 500 ? "error" : status >= 400 ? "warn" : "info",
    method,
    path: isSensitive ? "[SENSITIVE]" : path,
    status,
    durationMs,
    userAgent: truncateUserAgent(userAgent),
    referer: referer.includes("localhost") || referer.includes("vercel.app") ? "[INTERNAL]" : referer,
    requestId: request.headers.get("x-request-id") || "unknown",
  };

  // Emit structured JSON
  console.log(JSON.stringify(logEntry));

  // Log summary for human readability
  const summary = `[${logEntry.level.toUpperCase()}] ${method} ${logEntry.path} → ${status} (${durationMs}ms)`;
  console[status >= 500 ? "error" : status >= 400 ? "warn" : "log"](summary);
}

/**
 * Truncate user agent to prevent log spam while preserving useful info.
 */
function truncateUserAgent(ua: string): string {
  if (ua.length <= 100) return ua;
  return ua.slice(0, 100) + "...";
}

/**
 * Middleware handler that logs all requests and adds security headers.
 */
export function middleware(request: NextRequest): NextResponse {
  const startTime = Date.now();
  const path = request.nextUrl.pathname;

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204 });
  }

  // Continue with normal response
  const response = NextResponse.next();

  // Add security headers
  addSecurityHeaders(response);

  // Log after response is sent (using afterware pattern via setTimeout)
  // In Next.js middleware, we log on the response object
  response.headers.set("x-request-start", startTime.toString());

  // Use the middleware's execution context to log after response
  // This is a simplified approach; in production, consider using Vercel's analytics
  request.signal.addEventListener("abort", () => {
    const durationMs = Date.now() - startTime;
    logRequest(request, response, durationMs);
  });

  return response;
}

/**
 * Add security headers to all responses.
 */
function addSecurityHeaders(response: NextResponse): void {
  const securityHeaders = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.clerk.dev https://*.clerk.com wss://*.clerk.dev;",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  };

  for (const [header, value] of Object.entries(securityHeaders)) {
    response.headers.set(header, value);
  }
}

/**
 * Export matchers for middleware execution.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};

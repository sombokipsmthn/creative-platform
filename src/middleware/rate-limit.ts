import type { NextRequest } from "next/server";

/**
 * In-memory rate limiter store.
 * In production, replace with Redis or a distributed store.
 */
const rateLimiters = new Map<string, {
  lastRequest: number;
  count: number;
  limit: number;
  windowMs: number;
}>();

/**
 * Creates a rate limiter middleware function.
 *
 * @param options Configuration for the rate limiter
 * @param options.windowMs Time window in milliseconds (default: 60s = 60000)
 * @param options.max Maximum requests allowed in the window (default: 60)
 * @param options.key Identifier key - "ip" or "user" (default: "ip")
 * @returns Express/Next.js compatible middleware function
 */
export function createRateLimiter({
  windowMs = 60 * 1000, // 1 minute
  max = 60, // 60 requests per window
  key = "ip",
}: { windowMs?: number; max?: number; key?: "ip" | "user" } = {}) {
  return async (req: NextRequest): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
  }> => {
    // Determine the identifier based on key type
    let identifier: string;
    if (key === "user") {
      // Try to get user ID from auth headers or session
      const userId = req.headers.get("x-user-id") || "";
      identifier = userId || "anonymous";
    } else {
      // Use IP address
      identifier = req.ip || "unknown";
    }

    const now = Date.now();
    const last = rateLimiters.get(identifier) || {
      lastRequest: now,
      count: 0,
      limit: max,
      windowMs,
    };

    // Reset if window expired
    if (now - last.lastRequest > last.windowMs) {
      last.lastRequest = now;
      last.count = 0;
    }

    last.count++;

    if (last.count > last.limit) {
      const resetAt = last.lastRequest + last.windowMs;
      return { allowed: false, remaining: 0, resetAt };
    }

    // Update in memory
    rateLimiters.set(identifier, last);

    const remaining = last.limit - last.count;
    return { allowed: true, remaining, resetAt: last.lastRequest + last.windowMs };
  };
}

/**
 * Rate limit check handler for withCreatorApi
 */
export async function withRateLimit<T>(
  req: Request,
  handler: (req: Request, session: import("@/lib/auth").Session) => Promise<T>,
  options: {
    enabled?: boolean;
    windowMs?: number;
    max?: number;
    key?: "ip" | "user";
  } = {},
): Promise<[T, NextResponse?]> {
  // If rate limiting is disabled, proceed directly
  if (!options.enabled) {
    const session = await import("@/lib/auth").getSession(req);
    return [await handler(req, session), null];
  }

  // Apply rate limit check
  const limiter = createRateLimiter({
    windowMs: options.windowMs ?? 60 * 1000,
    max: options.max ?? 60,
    key: options.key ?? "ip",
  });

  const limitStatus = await limiter(req);

  if (!limitStatus.allowed) {
    return [
      null,
      NextResponse.json(
        {
          error: "Too many requests",
          resetAt: limitStatus.resetAt,
          limit: options.max ?? 60,
          remaining: 0,
        },
        { status: 429 },
      ),
    ];
  }

  // Proceed with normal handler
  const session = await import("@/lib/auth").getSession(req);
  return [await handler(req, session), null];
}

/**
 * Get rate limit status for monitoring
 */
export function getRateLimitStatus(): {
  totalTracked: number;
  byKey: Record<string, { count: number; limit: number; windowMs: number }>;
} {
  const byKey: Record<string, { count: number; limit: number; windowMs: number }> = {};
  for (const [key, data] of rateLimiters) {
    byKey[key] = {
      count: data.count,
      limit: data.limit,
      windowMs: data.windowMs,
    };
  }
  return {
    totalTracked: rateLimiters.size,
    byKey,
  };
}

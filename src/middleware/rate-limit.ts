import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import type { Session } from "@/lib/auth/auth";

/**
 * In-memory rate limiter store.
 *
 * This store is process-local. Use a shared store such as Redis for consistent
 * rate limiting across multiple production instances.
 */
const rateLimiters = new Map<
  string,
  {
    lastRequest: number;
    count: number;
    limit: number;
    windowMs: number;
  }
>();

/**
 * Creates a rate limiter.
 *
 * @param options.windowMs Time window in milliseconds (default: 60 seconds).
 * @param options.max Maximum requests allowed in the window (default: 60).
 * @param options.key Identifier key - "ip" or "user" (default: "ip").
 */
export function createRateLimiter({
  windowMs = 60 * 1000,
  max = 60,
  key = "ip",
}: {
  windowMs?: number;
  max?: number;
  key?: "ip" | "user";
} = {}) {
  return async (
    req: Request | NextRequest,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> => {
    let identifier: string;

    if (key === "user") {
      identifier = req.headers.get("x-user-id") || "anonymous";
    } else {
      // NextRequest.ip is not available in the current Next.js request types.
      // Prefer the first forwarded IP, then the direct real-IP header.
      const forwardedFor = req.headers.get("x-forwarded-for");
      const forwardedIp = forwardedFor?.split(",")[0]?.trim();
      identifier =
        forwardedIp ||
        req.headers.get("x-real-ip") ||
        "unknown";
    }

    const now = Date.now();
    const entry = rateLimiters.get(identifier) ?? {
      lastRequest: now,
      count: 0,
      limit: max,
      windowMs,
    };

    if (now - entry.lastRequest > entry.windowMs) {
      entry.lastRequest = now;
      entry.count = 0;
      entry.limit = max;
      entry.windowMs = windowMs;
    }

    entry.count += 1;
    rateLimiters.set(identifier, entry);

    const resetAt = entry.lastRequest + entry.windowMs;
    if (entry.count > entry.limit) {
      return { allowed: false, remaining: 0, resetAt };
    }

    return {
      allowed: true,
      remaining: entry.limit - entry.count,
      resetAt,
    };
  };
}

/**
 * Rate-limit wrapper used by creator API handlers.
 */
export async function withRateLimit<T>(
  req: Request,
  handler: (req: Request, session: Session) => Promise<T>,
  options: {
    enabled?: boolean;
    windowMs?: number;
    max?: number;
    key?: "ip" | "user";
  } = {},
): Promise<[T | null, NextResponse | null]> {
  if (options.enabled) {
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
  }

  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return [
      null,
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    ];
  }

  return [await handler(req, session), null];
}

/**
 * Get rate-limit status for monitoring.
 */
export function getRateLimitStatus(): {
  totalTracked: number;
  byKey: Record<string, { count: number; limit: number; windowMs: number }>;
} {
  const byKey: Record<
    string,
    { count: number; limit: number; windowMs: number }
  > = {};

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

/**
 * In-memory sliding window rate limiter for upload endpoints.
 *
 * Tracks upload counts per userId within a configurable time window.
 * Designed for serverless environments — state is ephemeral and resets
 * on function scale-down. For production multi-tenant deployments,
 * consider replacing with a persistent store (Redis, KV).
 */

import { auth } from "@clerk/nextjs/server";

interface RateLimitEntry {
  timestamps: number[];
}

class RateLimiter {
  private stores: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(options: { windowMs?: number; maxRequests?: number } = {}) {
    this.windowMs = options.windowMs ?? 60_000; // 1 minute
    this.maxRequests = options.maxRequests ?? 20;
  }

  /**
   * Check if the given key has exceeded the rate limit.
   * Returns true if the request is ALLOWED, false if RATE LIMITED.
   */
  async limit(request: Request): Promise<{ success: boolean }> {
    const { userId } = await auth();
    if (!userId) return { success: true }; // Allow if not authenticated (adjust as needed)
    return { success: this.isAllowed(userId) };
  }

  public isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let entry = this.stores.get(key);

    if (!entry) {
      entry = { timestamps: [] };
      this.stores.set(key, entry);
    }

    // Evict old timestamps outside the window
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    if (entry.timestamps.length >= this.maxRequests) {
      return false;
    }

    entry.timestamps.push(now);
    return true;
  }

  /**
   * Get remaining requests in the current window.
   */
  getRemaining(key: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const entry = this.stores.get(key);
    if (!entry) return this.maxRequests;

    const active = entry.timestamps.filter((ts) => ts > windowStart);
    return Math.max(0, this.maxRequests - active.length);
  }

  /**
   * Get retry-after seconds for a rate-limited key.
   */
  getRetryAfter(key: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const entry = this.stores.get(key);
    if (!entry || entry.timestamps.length === 0) return 0;

    const oldest = Math.min(...entry.timestamps.filter((ts) => ts > windowStart));
    const retryAfterMs = oldest + this.windowMs - now;
    return Math.ceil(retryAfterMs / 1000);
  }

  /**
   * Clear entries older than the window (call periodically to prevent memory growth).
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, entry] of this.stores.entries()) {
      entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
      if (entry.timestamps.length === 0) {
        this.stores.delete(key);
      }
    }
  }
}

// Singleton instance — shared across all invocations in the same function container
let limiter: RateLimiter | null = null;

export function getUploadRateLimiter(): RateLimiter {
  if (!limiter) {
    limiter = new RateLimiter({
      windowMs: 60_000,
      maxRequests: 20,
    });
  }
  return limiter;
}

/**
 * Export for testing — allows creating isolated instances.
 */
export function createRateLimiter(options?: { windowMs?: number; maxRequests?: number }): RateLimiter {
  return new RateLimiter(options);
}
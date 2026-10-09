import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Query performance monitoring utility
 * Tracks database query execution time for diagnostics
 */
class QueryMonitor {
  private metrics: Map<string, { count: number; totalTime: number; maxTime: number }> = new Map();

  /**
   * Record a query execution
   */
  recordQuery(label: string, duration: number) {
    const existing = this.metrics.get(label) || { count: 0, totalTime: 0, maxTime: 0 };
    existing.count += 1;
    existing.totalTime += duration;
    existing.maxTime = Math.max(existing.maxTime, duration);
    this.metrics.set(label, existing);

    // Log slow queries (>100ms)
    if (duration > 100) {
      console.warn(`[SLOW QUERY] ${label}: ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Get aggregated metrics
   */
  getMetrics() {
    const result: Record<string, any> = {};
    this.metrics.forEach((metric, label) => {
      result[label] = {
        count: metric.count,
        avgTime: (metric.totalTime / metric.count).toFixed(2) + "ms",
        maxTime: metric.maxTime.toFixed(2) + "ms",
        totalTime: metric.totalTime.toFixed(2) + "ms",
      };
    });
    return result;
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics.clear();
  }
}

export const queryMonitor = new QueryMonitor();

/**
 * Optimized user lookup by email (for sign-in)
 * Uses email index for fast lookups
 */
export async function getUserByEmail(email: string) {
  const start = performance.now();
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    const duration = performance.now() - start;
    queryMonitor.recordQuery("getUserByEmail", duration);
    return user;
  } catch (error) {
    console.error("Error looking up user by email:", error);
    throw error;
  }
}

/**
 * Optimized user lookup by auth ID
 * Used for session validation
 */
export async function getUserByAuthId(authUserId: string) {
  const start = performance.now();
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.authUserId, authUserId))
      .limit(1);
    
    const duration = performance.now() - start;
    queryMonitor.recordQuery("getUserByAuthId", duration);
    return user;
  } catch (error) {
    console.error("Error looking up user by auth ID:", error);
    throw error;
  }
}

/**
 * Optimized account lookup by provider ID
 * Used for OAuth flows
 */
export async function getAccountByProvider(providerId: string, accountId: string) {
  const start = performance.now();
  try {
    const [account] = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.providerId, providerId),
          eq(accounts.accountId, accountId),
        )
      )
      .limit(1);
    
    const duration = performance.now() - start;
    queryMonitor.recordQuery("getAccountByProvider", duration);
    return account;
  } catch (error) {
    console.error("Error looking up account by provider:", error);
    throw error;
  }
}

/**
 * Get aggregated database metrics
 * Use in metrics endpoint: GET /api/metrics/queries
 */
export function getDatabaseMetrics() {
  return {
    timestamp: new Date().toISOString(),
    metrics: queryMonitor.getMetrics(),
  };
}

import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { entitlements, subscriptions, subscriptionPlans } from '@/db/schema';

export const FEATURE_CUSTOM_BRANDING = 'custom_branding';

export type EntitlementCheck = {
  allowed: boolean;
  source: 'subscription' | 'manual' | 'trial' | 'none';
  expiresAt: Date | null;
};

/**
 * Server-side entitlement check. Never trust client-submitted status.
 *
 * A user is entitled to a feature when:
 * 1. They have an explicit `entitlements` row for the feature key that is
 *    enabled and not expired, OR
 * 2. They have an active/trial subscription whose plan includes the feature.
 *
 * Expired or unavailable entitlements fall back to `allowed: false`.
 */
export async function checkEntitlement(
  userId: string,
  featureKey: string = FEATURE_CUSTOM_BRANDING,
): Promise<EntitlementCheck> {
  if (!userId) {
    return { allowed: false, source: 'none', expiresAt: null };
  }

  try {
    // 1. Explicit entitlement row (manual grant / trial / override).
    const [explicit] = await db
      .select()
      .from(entitlements)
      .where(and(eq(entitlements.userId, userId), eq(entitlements.featureKey, featureKey)))
      .limit(1);

    if (explicit && explicit.enabled) {
      if (!explicit.expiresAt || new Date(explicit.expiresAt) > new Date()) {
        return {
          allowed: true,
          source: (explicit.source as EntitlementCheck['source']) ?? 'manual',
          expiresAt: explicit.expiresAt ? new Date(explicit.expiresAt) : null,
        };
      }
    }

    // 2. Active subscription whose plan includes the feature.
    const [row] = await db
      .select({ subscription: subscriptions, plan: subscriptionPlans })
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(and(eq(subscriptions.userId, userId)))
      .limit(1);

    if (
      row &&
      (row.subscription.status === 'active' ||
        row.subscription.status === 'trialing') &&
      Array.isArray(row.plan.features) &&
      row.plan.features.includes(featureKey)
    ) {
      const expiresAt = row.subscription.currentPeriodEnd
        ? new Date(row.subscription.currentPeriodEnd)
        : null;
      return { allowed: true, source: 'subscription', expiresAt };
    }
  } catch (error) {
    console.error('[entitlements] check failed, defaulting to denied:', error);
  }

  return { allowed: false, source: 'none', expiresAt: null };
}

export async function canUseCustomBranding(userId: string): Promise<boolean> {
  return (await checkEntitlement(userId, FEATURE_CUSTOM_BRANDING)).allowed;
}
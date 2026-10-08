import { currentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

function createInitialHandle(name: string, email: string, userId: string) {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "") ||
    "creator";

  const suffix = userId.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toLowerCase();
  return `${base}-${suffix}`;
}

export async function getOrCreateLocalUser(userId: string) {
  const existingByAuthUserId = (
    await db
      .select()
      .from(users)
      .where(eq(users.authUserId, userId))
      .limit(1)
  )[0];

  if (existingByAuthUserId) return existingByAuthUserId;

  const betterAuthUser = await currentUser();

  if (!betterAuthUser) {
    throw new Error("Authenticated user could not be loaded.");
  }

  const normalizedEmail = String(betterAuthUser.email || "").toLowerCase().trim();

  if (!normalizedEmail) {
    throw new Error("No email address is available for this authenticated account.");
  }

  const name =
    String(betterAuthUser.name || "").trim() ||
    normalizedEmail.split("@")[0] ||
    "Creator";

  const existingByEmail = (
    await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1)
  )[0];

  if (existingByEmail) {
    if (existingByEmail.authUserId && existingByEmail.authUserId !== userId) {
      throw new Error(
        "A local creator account already exists for this email but is linked to a different authenticated account."
      );
    }

    const updated = await db
      .update(users)
      .set({
        authUserId: userId,
        email: normalizedEmail,
        name: existingByEmail.name || name,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingByEmail.id))
      .returning();

    if (updated[0]) return updated[0];
    return existingByEmail;
  }

  const handle = createInitialHandle(name, normalizedEmail, userId);

  try {
    const inserted = await db
      .insert(users)
      .values({
        authUserId: userId,
        email: normalizedEmail,
        name,
        handle,
        onboardingStatus: "incomplete",
        onboardingStep: 1,
      })
      .onConflictDoNothing({ target: users.authUserId })
      .returning();

    if (inserted[0]) return inserted[0];
  } catch (error) {
    console.error("Creator sync: local user insert failed:", error);
  }

  const afterInsert = (
    await db
      .select()
      .from(users)
      .where(eq(users.authUserId, userId))
      .limit(1)
  )[0];

  if (afterInsert) return afterInsert;

  const afterEmailConflict = (
    await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1)
  )[0];

  if (afterEmailConflict) {
    if (afterEmailConflict.authUserId && afterEmailConflict.authUserId !== userId) {
      throw new Error(
        "A local creator account already exists for this email but is linked to a different authenticated account."
      );
    }

    const reconciled = await db
      .update(users)
      .set({ authUserId: userId, updatedAt: new Date() })
      .where(eq(users.id, afterEmailConflict.id))
      .returning();

    if (reconciled[0]) return reconciled[0];
  }

  throw new Error("Creator account could not be created.");
}

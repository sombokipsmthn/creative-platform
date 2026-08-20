import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

function createInitialHandle(
  name: string,
  email: string,
  userId: string
) {
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

  const suffix = userId
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-8)
    .toLowerCase();

  return `${base}-${suffix}`;
}

/**
 * Find the local creator account associated with a Clerk user.
 *
 * Resolution order:
 *
 * 1. authUserId
 *    - This is the canonical Clerk → local-user relationship.
 *
 * 2. email
 *    - Handles existing local accounts that were created before
 *      authUserId was correctly associated.
 *
 * 3. Create a new local user.
 *
 * The email reconciliation step is important because `users.email`
 * is unique. Without it, an existing local account can cause a
 * duplicate-email error when Clerk tries to create the account again.
 */
export async function getOrCreateLocalUser(
  userId: string
) {
  /*
   * -------------------------------------------------------
   * 1. FIND BY CLERK USER ID
   * -------------------------------------------------------
   */

  const existingByAuthUserId =
    (
      await db
        .select()
        .from(users)
        .where(
          eq(
            users.authUserId,
            userId
          )
        )
        .limit(1)
    )[0];

  if (existingByAuthUserId) {
    console.log(
      "Creator sync: local user found by authUserId",
      {
        id: existingByAuthUserId.id,
        authUserId:
          existingByAuthUserId.authUserId,
        email:
          existingByAuthUserId.email,
      }
    );

    return existingByAuthUserId;
  }

  /*
   * -------------------------------------------------------
   * 2. GET CLERK USER
   * -------------------------------------------------------
   */

  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error(
      "Authenticated Clerk user could not be loaded."
    );
  }

  const email =
    clerkUser.emailAddresses.find(
      (item) =>
        item.id ===
        clerkUser.primaryEmailAddressId
    )?.emailAddress ??
    clerkUser.emailAddresses[0]
      ?.emailAddress ??
    "";

  if (!email) {
    throw new Error(
      "No email address is available for this Clerk account."
    );
  }

  const normalizedEmail =
    email.toLowerCase().trim();

  const name =
    [
      clerkUser.firstName,
      clerkUser.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    normalizedEmail.split("@")[0] ||
    "Creator";

  /*
   * -------------------------------------------------------
   * 3. FIND EXISTING USER BY EMAIL
   * -------------------------------------------------------
   *
   * This is the important fix.
   *
   * The database has a unique constraint on email. If the user
   * was previously created without the current Clerk ID, we
   * should claim that existing account rather than attempting
   * another INSERT.
   */

  const existingByEmail =
    (
      await db
        .select()
        .from(users)
        .where(
          eq(
            users.email,
            normalizedEmail
          )
        )
        .limit(1)
    )[0];

  if (existingByEmail) {
    /*
     * If the existing record already belongs to a different
     * Clerk account, do NOT silently steal it.
     *
     * This protects against two real Clerk accounts sharing
     * a local account/email unexpectedly.
     */

    if (
      existingByEmail.authUserId &&
      existingByEmail.authUserId !==
        userId
    ) {
      throw new Error(
        "A local creator account already exists for this email but is linked to a different Clerk account."
      );
    }

    /*
     * The existing local user has no Clerk ID.
     *
     * Claim/reconcile the account.
     */

    console.log(
      "Creator sync: reconciling existing local user by email",
      {
        localUserId:
          existingByEmail.id,
        email:
          existingByEmail.email,
        clerkUserId:
          userId,
      }
    );

    const updated =
      await db
        .update(users)
        .set({
          authUserId: userId,
          email: normalizedEmail,
          name:
            existingByEmail.name ||
            name,
          updatedAt:
            new Date(),
        })
        .where(
          eq(
            users.id,
            existingByEmail.id
          )
        )
        .returning();

    if (updated[0]) {
      console.log(
        "Creator sync: existing local user reconciled",
        {
          id: updated[0].id,
          authUserId:
            updated[0].authUserId,
          email:
            updated[0].email,
        }
      );

      return updated[0];
    }

    /*
     * Extremely unlikely, but re-read the account in case
     * another request updated it concurrently.
     */

    const reconciled =
      (
        await db
          .select()
          .from(users)
          .where(
            eq(
              users.id,
              existingByEmail.id
            )
          )
          .limit(1)
      )[0];

    if (reconciled) {
      return reconciled;
    }

    throw new Error(
      "Existing creator account could not be reconciled."
    );
  }

  /*
   * -------------------------------------------------------
   * 4. CREATE A BRAND-NEW LOCAL USER
   * -------------------------------------------------------
   */

  const handle =
    createInitialHandle(
      name,
      normalizedEmail,
      userId
    );

  console.log(
    "Creator sync: creating local user",
    {
      clerkUserId: userId,
      email: normalizedEmail,
      name,
      handle,
    }
  );

  try {
    const inserted =
      await db
        .insert(users)
        .values({
          authUserId: userId,
          email: normalizedEmail,
          name,
          handle,
          onboardingStatus:
            "incomplete",
          onboardingStep: 1,
        })
        .onConflictDoNothing({
          target:
            users.authUserId,
        })
        .returning();

    if (inserted[0]) {
      console.log(
        "Creator sync: local user created",
        {
          id: inserted[0].id,
          authUserId:
            inserted[0].authUserId,
        }
      );

      return inserted[0];
    }
  } catch (error) {
    /*
     * A concurrent request may have created the account,
     * or another unique constraint may have been hit.
     *
     * Do not immediately fail. Re-read using both identifiers.
     */

    console.error(
      "Creator sync: local user insert failed, attempting reconciliation:",
      error
    );
  }

  /*
   * -------------------------------------------------------
   * 5. RETRIEVE AFTER CONCURRENT INSERT / CONFLICT
   * -------------------------------------------------------
   */

  const afterInsertByAuthUserId =
    (
      await db
        .select()
        .from(users)
        .where(
          eq(
            users.authUserId,
            userId
          )
        )
        .limit(1)
    )[0];

  if (afterInsertByAuthUserId) {
    console.log(
      "Creator sync: local user found after insert conflict",
      {
        id:
          afterInsertByAuthUserId.id,
        authUserId:
          afterInsertByAuthUserId.authUserId,
      }
    );

    return afterInsertByAuthUserId;
  }

  /*
   * It is possible that the conflict was caused by the email
   * unique constraint rather than authUserId. Check email again.
   */

  const afterInsertByEmail =
    (
      await db
        .select()
        .from(users)
        .where(
          eq(
            users.email,
            normalizedEmail
          )
        )
        .limit(1)
    )[0];

  if (afterInsertByEmail) {
    if (
      afterInsertByEmail.authUserId &&
      afterInsertByEmail.authUserId !==
        userId
    ) {
      throw new Error(
        "A local creator account already exists for this email but is linked to a different Clerk account."
      );
    }

    const reconciled =
      await db
        .update(users)
        .set({
          authUserId: userId,
          updatedAt:
            new Date(),
        })
        .where(
          eq(
            users.id,
            afterInsertByEmail.id
          )
        )
        .returning();

    if (reconciled[0]) {
      console.log(
        "Creator sync: local user reconciled after insert conflict",
        {
          id:
            reconciled[0].id,
          authUserId:
            reconciled[0].authUserId,
        }
      );

      return reconciled[0];
    }

    return afterInsertByEmail;
  }

  /*
   * -------------------------------------------------------
   * 6. GENUINE FAILURE
   * -------------------------------------------------------
   */

  throw new Error(
    "Creator account could not be created."
  );
}
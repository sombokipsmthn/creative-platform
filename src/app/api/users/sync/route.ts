import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { creatorProfiles, users } from "@/db/schema";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * IMPORTANT:
     *
     * This endpoint only SYNCs an existing local creator.
     *
     * It must NOT create a users row for a brand-new
     * Clerk account.
     *
     * New users are created by:
     *
     *   /admin/onboarding
     *        ↓
     *   POST /api/onboarding
     */

    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.authUserId, userId))
      .limit(1);

    const user = existingUsers[0];

    /*
     * No local account means this is a brand-new creator.
     *
     * Do NOT create the user here.
     */
    if (!user) {
      return NextResponse.json({
        needsOnboarding: true,
        user: null,
        profile: null,
      });
    }

    /*
     * Existing local account.
     *
     * Load the creator profile associated with it.
     */
    const existingProfiles = await db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, user.id))
      .limit(1);

    const profile = existingProfiles[0] ?? null;

    /*
     * If the local user exists but has no creator profile,
     * treat the account as incomplete and send it through
     * onboarding.
     */
    if (!profile) {
      return NextResponse.json({
        needsOnboarding: true,
        user,
        profile: null,
      });
    }

    /*
     * Fully onboarded creator.
     */
    return NextResponse.json({
      needsOnboarding: false,
      user,
      profile,
    });
  } catch (error) {
    console.error(
      "POST /api/users/sync error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to sync user",
      },
      {
        status: 500,
      }
    );
  }
}
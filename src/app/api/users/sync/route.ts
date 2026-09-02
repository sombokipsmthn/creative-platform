import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { creatorProfiles, users } from "@/db/schema";

export async function POST() {
  try {
    const { userId } =
      await auth();

    /*
     * -------------------------------------------------------
     * REQUIRE CLERK AUTHENTICATION
     * -------------------------------------------------------
     */

    if (!userId) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    console.log(
      "Creator sync: checking Clerk user",
      userId
    );

    /*
     * -------------------------------------------------------
     * GET OR CREATE LOCAL USER
     * -------------------------------------------------------
     *
     * A Clerk account is not useful to the application
     * until there is a corresponding local users row.
     *
     * This function safely handles both:
     *
     * 1. Existing local users
     * 2. Brand-new Clerk users
     */

    // Fetch the local user by the Clerk authUserId. Do **not** create a new
    // record here – creation should happen only in /auth or the onboarding flow.
    const [localUser] = await db
      .select()
      .from(users)
      .where(eq(users.authUserId, userId))
      .limit(1);

    // If there is no local user yet, we can immediately respond that
    // onboarding is required. No profile lookup is necessary and we avoid
    // accessing `localUser.id` when undefined.
    if (!localUser) {
      console.log(
        "Creator sync: no local user found for Clerk ID",
        userId
      );
      return NextResponse.json({
        needsOnboarding: true,
        user: null,
        profile: null,
      });
    }

    console.log(
      "Creator sync: local user confirmed",
      {
        id: localUser.id,
        authUserId: localUser.authUserId,
        onboardingStatus: localUser.onboardingStatus,
        onboardingStep: localUser.onboardingStep,
      }
    );

    // -------------------------------------------------------
    // FIND CREATOR PROFILE
    // -------------------------------------------------------
    const existingProfiles = await db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, localUser.id))
      .limit(1);

    const profile = existingProfiles[0] ?? null;

    // -------------------------------------------------------
    // DETERMINE ONBOARDING STATE
    // -------------------------------------------------------
    const needsOnboarding =
      !profile || localUser.onboardingStatus !== "complete";

    // -------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------
    return NextResponse.json({
      needsOnboarding,
      user: localUser,
      profile,
    });
  } catch (error) {
    console.error(
      "POST /api/users/sync error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to sync user",
      },
      {
        status: 500,
      }
    );
  }
}

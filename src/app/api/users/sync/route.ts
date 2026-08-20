import { NextResponse } from "next/server";
import {
  auth,
} from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  creatorProfiles,
  users,
} from "@/db/schema";

import {
  getOrCreateLocalUser,
} from "@/lib/auth/get-or-create-local-user";

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

    const user =
      await getOrCreateLocalUser(
        userId
      );

    console.log(
      "Creator sync: local user confirmed",
      {
        id: user.id,

        authUserId:
          user.authUserId,

        onboardingStatus:
          user.onboardingStatus,

        onboardingStep:
          user.onboardingStep,
      }
    );

    /*
     * -------------------------------------------------------
     * FIND CREATOR PROFILE
     * -------------------------------------------------------
     */

    const existingProfiles =
      await db
        .select()
        .from(
          creatorProfiles
        )
        .where(
          eq(
            creatorProfiles.userId,
            user.id
          )
        )
        .limit(1);

    const profile =
      existingProfiles[0] ??
      null;

    /*
     * -------------------------------------------------------
     * DETERMINE ONBOARDING STATE
     * -------------------------------------------------------
     */

    const needsOnboarding =
      !profile ||
      user.onboardingStatus !==
        "complete";

    /*
     * -------------------------------------------------------
     * RESPONSE
     * -------------------------------------------------------
     */

    return NextResponse.json({
      needsOnboarding,

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
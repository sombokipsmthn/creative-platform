import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { creatorProfiles, users } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

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
      "Creator sync: checking Better Auth user",
      userId
    );

    /*
     * -------------------------------------------------------
     * GET OR CREATE LOCAL USER
     * -------------------------------------------------------
     *
     * A Better Auth account is not useful to the application
     * until there is a corresponding local users row.
     *
     * This function safely handles both:
     *
     * 1. Existing local users
     * 2. Brand-new Better Auth users
     */

    // Fetch the local user by the Better Auth userId. Do **not** create a new
    // record here – creation should happen only in /auth or the onboarding flow.
    const [localUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // If there is no local user yet, we can immediately respond that
    // onboarding is required. No profile lookup is necessary and we avoid
    // accessing `localUser.id` when undefined.
    if (!localUser) {
      console.log(
        "Creator sync: no local user found for Better Auth ID",
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
          "Failed to sync user",
      },
      {
        status: 500,
      }
    );
  }
}

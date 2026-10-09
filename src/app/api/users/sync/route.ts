import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { creatorProfiles, users } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    /*
     * -------------------------------------------------------
     * REQUIRE BETTER AUTH AUTHENTICATION
     * -------------------------------------------------------
     */

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    console.log(
      "Creator sync: checking Better Auth user",
      session.user.id
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

    const [localUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!localUser) {
      const [createdUser] = await db
        .insert(users)
        .values({
          id: session.user.id,
          email: session.user.email.toLowerCase(),
          name: session.user.name || session.user.email.split("@")[0] || "Creator",
          emailVerified: session.user.emailVerified,
          image: session.user.image,
          onboardingStatus: "incomplete",
          onboardingStep: 1,
        })
        .onConflictDoNothing({ target: users.id })
        .returning();

      const provisionedUser = createdUser ?? await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      });

      if (!provisionedUser) {
        return NextResponse.json({ error: "Unable to provision your creator account." }, { status: 500 });
      }

      return NextResponse.json({ needsOnboarding: true, user: provisionedUser, profile: null });
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
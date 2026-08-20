import {
  auth,
} from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  creatorProfiles,
} from "@/db/schema";

import {
  getOrCreateLocalUser,
} from "@/lib/auth/get-or-create-local-user";

export default async function AuthRedirectPage() {
  /*
   * -------------------------------------------------------
   * REQUIRE CLERK AUTHENTICATION
   * -------------------------------------------------------
   */

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  /*
   * -------------------------------------------------------
   * GET OR CREATE LOCAL USER
   * -------------------------------------------------------
   *
   * All local-user creation/reconciliation is handled by
   * the shared helper.
   *
   * This prevents /auth from having a separate user-creation
   * implementation that can conflict with CreatorContext or
   * the onboarding API.
   */

  let localUser;

  try {
    localUser =
      await getOrCreateLocalUser(
        userId
      );
  } catch (error) {
    console.error(
      "Auth redirect: unable to resolve local user:",
      error
    );

    /*
     * Do not attempt another INSERT here.
     *
     * The shared helper is the single source of truth for
     * creating/reconciling local creator accounts.
     */

    redirect("/admin/onboarding");
  }

  /*
   * -------------------------------------------------------
   * SAFETY CHECK
   * -------------------------------------------------------
   */

  if (!localUser) {
    console.error(
      "Auth redirect: local user still missing",
      {
        clerkUserId: userId,
      }
    );

    redirect("/admin/onboarding");
  }

  /*
   * -------------------------------------------------------
   * CHECK CREATOR PROFILE
   * -------------------------------------------------------
   */

  const profile =
    (
      await db
        .select()
        .from(creatorProfiles)
        .where(
          eq(
            creatorProfiles.userId,
            localUser.id
          )
        )
        .limit(1)
    )[0];

  /*
   * -------------------------------------------------------
   * ONBOARDING
   * -------------------------------------------------------
   *
   * A local user without a creator profile, or with an
   * incomplete onboarding status, needs to continue
   * onboarding.
   */

  if (
    !profile ||
    localUser.onboardingStatus !==
      "complete"
  ) {
    redirect(
      "/admin/onboarding"
    );
  }

  /*
   * -------------------------------------------------------
   * CREATOR WORKSPACE
   * -------------------------------------------------------
   */

  redirect("/admin");
}
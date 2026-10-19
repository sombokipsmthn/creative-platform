import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { creatorProfiles } from "@/db/schema";
import { getOrCreateLocalUser } from "@/lib/auth/get-or-create-local-user";

export default async function AuthRedirectPage() {
  /*
   * -------------------------------------------------------
   * REQUIRE BETTER AUTH SESSION
   * -------------------------------------------------------
   */

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  /*
   * -------------------------------------------------------
   * GET OR CREATE LOCAL USER
   * -------------------------------------------------------
   *
   * Find the local creator account associated with the Better Auth user.
   */

  const localUser = await getOrCreateLocalUser(session.user);

  /*
   * -------------------------------------------------------
   * SAFETY CHECK
   * -------------------------------------------------------
   */

  /*
   * -------------------------------------------------------
   * CHECK CREATOR PROFILE
   * -------------------------------------------------------
   */

  const profile = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, localUser.id),
  });

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
    localUser.onboardingStatus !== "complete"
  ) {
    redirect("/admin/onboarding");
  }

  /*
   * -------------------------------------------------------
   * CREATOR WORKSPACE
   * -------------------------------------------------------
   */

  redirect("/admin");
}
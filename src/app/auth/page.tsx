import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  creatorProfiles,
  users,
} from "@/db/schema";

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

  const localUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!localUser) {
    // Create local user record if it doesn't exist
    const [newUser] = await db.insert(users).values({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || session.user.email.split("@")[0],
      onboardingStatus: "incomplete",
      onboardingStep: 1,
      emailVerified: session.user.emailVerified || false,
      image: session.user.image,
    }).returning();

    if (newUser) {
      redirect("/admin/onboarding");
    }
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
        authUserId: session.user.id,
      }
    );

    redirect("/admin/onboarding");
  }

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
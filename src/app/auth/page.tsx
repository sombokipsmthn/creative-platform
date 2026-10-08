import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
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
    headers: new Headers(),
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
    where: eq(users.authUserId, session.user.id),
    limit: 1,
  });

  if (!localUser) {
    // Create local user record if it doesn't exist
    const [newUser] = await db.insert(users).values({
      authUserId: session.user.id,
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
    limit: 1,
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
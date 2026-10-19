import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

type AuthenticatedIdentity = {
  id: string;
  email: string;
  name?: string | null;
  emailVerified?: boolean;
  image?: string | null;
};

export async function getOrCreateLocalUser(authUser: AuthenticatedIdentity) {
  const existing = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
  });
  if (existing) return existing;

  const email = authUser.email.toLowerCase().trim();
  const [created] = await db
    .insert(users)
    .values({
      id: authUser.id,
      email,
      name: authUser.name?.trim() || email.split("@")[0] || "Creator",
      emailVerified: authUser.emailVerified ?? false,
      image: authUser.image ?? null,
      onboardingStatus: "incomplete",
      onboardingStep: 1,
    })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  // Another request may have created this identity after the initial read.
  const concurrentUser = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
  });
  if (concurrentUser) return concurrentUser;

  // A different account already owns this email; never guess an identity link.
  throw new Error("Creator account could not be provisioned due to an identity conflict.");
}

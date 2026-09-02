import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Retrieve the local creator record that matches the given Clerk `authUserId`.
 * This function **does not** create a new row – it simply returns the existing
 * record or throws an error if none is found. All API routes that need a
 * guaranteed local user should call this after verifying the Clerk session.
 */
export async function getLocalUser(authUserId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, authUserId))
    .limit(1);

  if (!user) {
    throw new Error(
      `Local user not found for Clerk ID ${authUserId}. ` +
        "Ensure the user has been created via /auth before accessing this endpoint."
    );
  }

  return user;
}


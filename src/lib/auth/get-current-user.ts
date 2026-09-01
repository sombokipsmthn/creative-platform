import { auth } from "@clerk/nextjs/server";
import { getLocalUser } from "./get-local-user";

/**
 * Retrieves the currently authenticated creator user from the database.
 *
 * This function:
 * 1. Uses Clerk to verify the session and retrieve the authUserId.
 * 2. Uses getOrCreateLocalUser to ensure a corresponding local record exists in the database.
 * 3. Returns the local user record or null if not authenticated/not found.
 *
 * This is the canonical way to identify the creator for admin API requests.
 */
export async function getCurrentUser() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    try {
      return await getLocalUser(userId);
    } catch (e) {
      throw new Error(
        `Local creator account not found for Clerk ID ${userId}. ` +
        "Ensure the user has been created via /auth before calling this function."
      );
    }
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

export default getCurrentUser;

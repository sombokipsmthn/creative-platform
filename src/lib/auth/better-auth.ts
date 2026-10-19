import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, galleries, clients } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Require authentication and return the user's session.
 * Throws redirect to sign-in if not authenticated.
 */
export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  return session;
}

/**
 * Require authentication and return the user's session, or null if not authenticated.
 * Does not redirect; useful for API routes where you want to return 401.
 */
export async function optionalAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Get the local user (creator) from the database using the Better Auth user ID.
 * This is the canonical way to identify the creator for admin API requests.
 */
export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    return await getLocalUser(session.user.id);
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

/**
 * Retrieve the local creator record that matches the given Better Auth user ID.
 * This function does not create a new row – it simply returns the existing
 * record or throws an error if none is found.
 */
export async function getLocalUser(authUserId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, authUserId),
  });

  if (!user) {
    throw new Error(`Local user not found for Better Auth user ${authUserId}.`);
  }

  return user;
}

/**
 * Verify that a resource belongs to the current user.
 * @param userId The current user's ID
 * @param resourceUserId The user ID associated with the resource
 * @throws Error if ownership does not match
 */
export function assertOwnership(userId: string | null | undefined, resourceUserId: string) {
  if (!userId || userId !== resourceUserId) {
    throw new Error('Unauthorized');
  }
}

/**
 * Async version that fetches the resource's owner from the database.
 * @param userId The current user's ID
 * @param fetchOwnerFn A function that returns a Promise of the resource's owner ID
 */
export async function assertOwnershipAsync(
  userId: string | null | undefined,
  fetchOwnerFn: () => Promise<string>
) {
  if (!userId) {
    throw new Error('Unauthorized');
  }
  const resourceUserId = await fetchOwnerFn();
  if (userId !== resourceUserId) {
    throw new Error('Unauthorized');
  }
}

/**
 * Verify resource ownership for galleries
 */
export async function verifyGalleryOwnership(galleryId: string, userId: string) {
  const gallery = await db.query.galleries.findFirst({
    where: eq(galleries.id, galleryId),
  });
  const ownerId = gallery?.creatorId;

  if (!ownerId || ownerId !== userId) {
    throw new Error('Unauthorized');
  }
}

/**
 * Verify client ownership
 */
export async function verifyClientOwnership(clientId: string, userId: string) {
  const client = await db.query.clients.findFirst({
    where: eq(clients.id, clientId),
  });
  const ownerId = client?.creatorId;

  if (!ownerId || ownerId !== userId) {
    throw new Error('Unauthorized');
  }
}

export { eq } from "drizzle-orm";
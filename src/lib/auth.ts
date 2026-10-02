import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { galleries, clients } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Require authentication and return the user's session.
 * Throws redirect to sign-in if not authenticated.
 */
export async function requireAuth() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Optional: validate session expiration server-side
  const expiresAt = sessionClaims?.exp ? Number(sessionClaims.exp) * 1000 : undefined;
  if (expiresAt && Date.now() >= expiresAt) {
    // Force sign out by redirecting to sign-in
    redirect('/sign-out');
  }

  return { userId, sessionClaims };
}

/**
 * Require authentication and return the user's session, or null if not authenticated.
 * Does not redirect; useful for API routes where you want to return 401.
 */
export async function optionalAuth() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return null;
  }
  const expiresAt = sessionClaims?.exp ? Number(sessionClaims.exp) * 1000 : undefined;
  if (expiresAt && Date.now() >= expiresAt) {
    return null;
  }
  return { userId, sessionClaims };
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
 * Verify session expiration server-side
 */
export async function enforceSessionExpiration() {
  const session = await auth();
  if (!session || !session.sessionClaims?.exp) {
    throw new Error('Session expired');
  }
  const expiresAt = Number(session.sessionClaims.exp) * 1000;
  if (Date.now() >= expiresAt) {
    throw new Error('Session expired');
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

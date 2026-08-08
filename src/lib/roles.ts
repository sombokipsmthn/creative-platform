import { auth } from "@clerk/nextjs/server";

export type Role = "admin" | "client";

/**
 * Reads the signed-in user's role from Clerk session claims.
 * Role lives in publicMetadata.role — set it:
 *   - manually per-user in the Clerk dashboard (Users -> select user -> Metadata), or
 *   - programmatically via clerkClient().users.updateUserMetadata() when you
 *     invite a client from /admin/clients.
 */
export async function getCurrentRole(): Promise<Role | null> {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: Role } | undefined)?.role;
  return role ?? null;
}

export async function requireRole(role: Role) {
  const current = await getCurrentRole();
  if (current !== role) {
    throw new Error(`Forbidden: requires role "${role}", got "${current}"`);
  }
}

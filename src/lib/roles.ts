import { getCurrentSession } from "@/lib/auth";

export type Role = "admin" | "client";

/**
 * Determines the application role from the authenticated Better Auth user.
 * The configured admin email receives the admin role.
 */
export async function getCurrentRole(): Promise<Role | null> {
  const session = await getCurrentSession();
  if (!session?.user) return null;

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return adminEmail && session.user.email.toLowerCase() === adminEmail ? "admin" : null;
}

export async function requireRole(role: Role) {
  const current = await getCurrentRole();
  if (current !== role) {
    throw new Error(`Forbidden: requires role "${role}", got "${current}"`);
  }
}

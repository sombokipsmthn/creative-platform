import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getLocalUser(userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new Error(`Local user not found for authenticated user ${userId}.`);
  return user;
}

export async function getOrCreateLocalUser(userId?: string) {
  const session = userId ? null : await auth.api.getSession({ headers: await headers() });
  const authUser = session?.user;
  const id = userId || authUser?.id;
  if (!id) throw new Error("Unauthenticated");
  const existing = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (existing) return existing;
  if (!authUser) throw new Error("Authenticated user could not be loaded.");
  const [created] = await db.insert(users).values({ id, email: authUser.email.toLowerCase().trim(), name: authUser.name || authUser.email.split("@")[0] || "Creator", emailVerified: authUser.emailVerified, image: authUser.image }).returning();
  if (!created) throw new Error("Application user could not be created.");
  return created;
}

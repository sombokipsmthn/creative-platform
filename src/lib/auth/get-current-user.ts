import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user ? await db.query.users.findFirst({ where: eq(users.id, session.user.id) }) ?? null : null;
  } catch { return null; }
}

export async function getCurrentUserFromRequest(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    return session?.user ? await db.query.users.findFirst({ where: eq(users.id, session.user.id) }) ?? null : null;
  } catch { return null; }
}

export async function getLocalUser(userId: string) {
  return db.query.users.findFirst({ where: eq(users.id, userId) });
}

export default getCurrentUser;

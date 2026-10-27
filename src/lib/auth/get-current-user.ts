import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isLocalAuthBypassEnabled } from "@/lib/auth/local-bypass";

const DEV_EMAIL = "dev-admin@localhost.test";

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user
    ? await db.query.users.findFirst({ where: eq(users.id, session.user.id) }) ?? null
    : null;
}

export async function getCurrentUserFromRequest(request: Request) {
  // Honor the bypass cookie only when the shared gate confirms local development,
  // the explicit flag is enabled, and the request hostname is loopback.
  const hasBypassCookie = (request.headers.get("cookie") || "")
    .split(";")
    .some((cookie) => cookie.trim() === "local-auth-bypass=1");

  if (hasBypassCookie && isLocalAuthBypassEnabled(request)) {
    const devUser = await db.query.users.findFirst({
      where: eq(users.email, DEV_EMAIL)
    });
    return devUser ?? null;
  }

  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user
    ? await db.query.users.findFirst({ where: eq(users.id, session.user.id) }) ?? null
    : null;
}

export async function getLocalUser(userId: string) {
  return db.query.users.findFirst({ where: eq(users.id, userId) });
}

export default getCurrentUser;

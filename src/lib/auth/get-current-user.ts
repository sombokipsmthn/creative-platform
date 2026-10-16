import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const DEV_EMAIL = "dev-admin@localhost.test";

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user
    ? await db.query.users.findFirst({ where: eq(users.id, session.user.id) }) ?? null
    : null;
}

export async function getCurrentUserFromRequest(request: Request) {
  // In development with local auth bypass enabled, check for bypass cookie
  const cookies = request.headers.get("cookie") || "";
  const isDevBypass = cookies.includes("local-auth-bypass=1") &&
    process.env.NODE_ENV === "development";

  if (isDevBypass) {
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

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getLocalAuthBypassState } from "@/lib/auth/local-bypass";

const DEV_EMAIL = "dev-admin@localhost.test";
const DEV_PASSWORD = "local-development-only-password";

export async function POST(request: Request) {
  const bypassState = getLocalAuthBypassState(request);
  if (!bypassState.enabled) {
    return NextResponse.json({ error: "Not available." }, { status: 404 });
  }

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, DEV_EMAIL),
    });

    if (existingUser && !existingUser.emailVerified) {
      await db
        .update(users)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(users.id, existingUser.id));
    }

    const endpoint = existingUser ? "sign-in" : "sign-up";
    const requestUrl = new URL(request.url);
    const host = request.headers.get("host") || requestUrl.host;
    const origin = `http://${host}`;
    const authRequest = new Request(new URL(`/api/auth/${endpoint}/email`, origin), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin,
      },
      body: JSON.stringify(
        existingUser
          ? { email: DEV_EMAIL, password: DEV_PASSWORD, rememberMe: true }
          : { name: "Local Development Admin", email: DEV_EMAIL, password: DEV_PASSWORD, rememberMe: true },
      ),
    });

    return auth.handler(authRequest);
  } catch (error) {
    console.error("Local auth bootstrap failed:", error);
    return NextResponse.json({ error: "Unable to bootstrap local authentication." }, { status: 500 });
  }
}

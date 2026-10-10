import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getLocalAuthBypassState } from "@/lib/auth/local-bypass";
import { logUnexpectedApiError } from "@/lib/api/route-boundaries";

const DEV_EMAIL = "dev-admin@localhost.test";
const DEV_PASSWORD = "local-development-only-password";

async function callAuthEndpoint(
  request: Request,
  endpoint: "sign-in" | "sign-up",
  body: Record<string, string | boolean>
) {
  const origin = new URL(request.url).origin;
  const authRequest = new Request(
    new URL(`/api/auth/${endpoint}/email`, origin),
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin,
      },
      body: JSON.stringify(body),
    }
  );

  return auth.handler(authRequest);
}

export async function POST(request: Request) {
  if (!getLocalAuthBypassState(request).enabled) {
    return NextResponse.json({ error: "Not available." }, { status: 404 });
  }

  try {
    let devUser = await db.query.users.findFirst({
      where: eq(users.email, DEV_EMAIL),
    });

    if (!devUser) {
      const signUpResponse = await callAuthEndpoint(request, "sign-up", {
        name: "Local Development Admin",
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
        rememberMe: true,
      });

      // A concurrent bootstrap request may win account creation first.
      devUser = await db.query.users.findFirst({
        where: eq(users.email, DEV_EMAIL),
      });

      if (!signUpResponse.ok && !devUser) {
        console.error("Local auth bootstrap sign-up failed", {
          status: signUpResponse.status,
        });
        return NextResponse.json(
          { error: "Unable to bootstrap local authentication." },
          { status: 500 }
        );
      }
    }

    if (!devUser) {
      throw new Error("Development account was not created.");
    }

    if (!devUser.emailVerified) {
      await db
        .update(users)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(users.id, devUser.id));
    }

    const signInResponse = await callAuthEndpoint(request, "sign-in", {
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
      rememberMe: true,
    });

    if (!signInResponse.ok) {
      console.error("Local auth bootstrap sign-in failed", {
        status: signInResponse.status,
      });
      return NextResponse.json(
        { error: "Unable to bootstrap local authentication." },
        { status: signInResponse.status >= 500 ? 500 : 401 }
      );
    }

    return signInResponse;
  } catch (error) {
    logUnexpectedApiError(request, "dev-auth.bootstrap", error);
    return NextResponse.json(
      { error: "Unable to bootstrap local authentication." },
      { status: 500 }
    );
  }
}

import { getLocalAuthBypassState } from "@/lib/auth/local-bypass";
import { NextResponse } from "next/server";

function isAdminRoute(pathname: string) {
  return pathname.startsWith("/admin");
}

function isOnboardingRoute(pathname: string) {
  return pathname.startsWith("/admin/onboarding");
}

function isAuthRoute(pathname: string) {
  return pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
}

function isApiAuthRoute(pathname: string) {
  return pathname.startsWith("/api/auth");
}

function getAuthOrigin() {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3005";
  }

  const configuredOrigin = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;

  if (!configuredOrigin) {
    console.error("Cannot verify the admin session because no auth server URL is configured.");
    return null;
  }

  try {
    return new URL(configuredOrigin).origin;
  } catch (error) {
    console.error("Cannot verify the admin session because the auth server URL is invalid:", error);
    return null;
  }
}

async function hasAuthenticatedSession(request: Request, origin: string) {
  try {
    const response = await fetch(new URL("/api/auth/get-session", origin), {
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("Failed to verify the admin session; auth route returned:", response.status);
      return false;
    }

    const session: unknown = await response.json();
    return (
      typeof session === "object" &&
      session !== null &&
      "user" in session &&
      Boolean(session.user)
    );
  } catch (error) {
    console.error("Failed to verify the admin session in proxy:", error);
    return false;
  }
}

export default async function customMiddleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const bypassState = getLocalAuthBypassState(request);

  if (isAuthRoute(pathname) || isApiAuthRoute(pathname)) {
    return NextResponse.next();
  }

  // This bypass only affects page navigation. API routes retain their own auth checks.
  if (bypassState.enabled && (isOnboardingRoute(pathname) || isAdminRoute(pathname))) {
    const response = NextResponse.next();
    response.cookies.set("local-auth-bypass", "1", {
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
    return response;
  }

  if (isOnboardingRoute(pathname) || isAdminRoute(pathname)) {
    const authOrigin = getAuthOrigin();
    if (!authOrigin || !(await hasAuthenticatedSession(request, authOrigin))) {
      const signInUrl = new URL("/sign-in", url.origin);
      signInUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(signInUrl);
      response.cookies.delete("local-auth-bypass");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/api/(.*)",
  ],
};

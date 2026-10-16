import { getLocalAuthBypassState } from "@/lib/auth/local-bypass";
import { NextResponse } from "next/server";

function configuredOrigin(): string | null {
  return process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3005";
}

function getAuthOrigin(): string | null {
  return configuredOrigin();
}

async function hasAuthenticatedSession(request: Request, authOrigin: string): Promise<boolean> {
  try {
    const session = await fetch(`${authOrigin}/api/auth/session`, {
      headers: request.headers,
    });
    return session.ok;
  } catch {
    return false;
  }
}

function isAdminRoute(pathname: string) {
  return pathname.startsWith("/admin");
}

function isOnboardingRoute(pathname: string) {
  return pathname.startsWith("/admin/onboarding");
}

export default async function customMiddleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const bypassState = getLocalAuthBypassState(request);

  if (!configuredOrigin()) {
    console.error("Cannot verify the admin session because no auth server URL is configured.");
    return null;
  }

  // This bypass only affects page navigation. API routes retain their own auth checks.
  if (bypassState.enabled && (isOnboardingRoute(pathname) || isAdminRoute(pathname))) {
    // Always preserve the bypass cookie for localhost development
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
      // Only delete the bypass cookie in production; preserve it in development
      if (!bypassState.enabled) {
        response.cookies.delete("local-auth-bypass");
      }
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
import { getLocalAuthBypassState } from "@/lib/auth/local-bypass";
import { NextResponse } from "next/server";

function configuredOrigin(request?: Request): string {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (request) {
    try {
      const url = new URL(request.url);
      return url.origin;
    } catch {
      // ignore
    }
  }
  return "http://localhost:3000";
}

function getAuthOrigin(request?: Request): string {
  return configuredOrigin(request);
}

async function hasAuthenticatedSession(request: Request): Promise<boolean> {
  try {
    // Probe Better Auth through the same origin that received the request so
    // the browser's session cookie is evaluated by the same app instance.
    const sessionUrl = new URL("/api/auth/get-session", request.url);
    const session = await fetch(sessionUrl, {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
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

  // In development with local auth bypass enabled, skip auth checks for all routes
  if (bypassState.enabled) {
    // Preserve the bypass cookie for localhost development
    const response = NextResponse.next();
    response.cookies.set("local-auth-bypass", "1", {
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
    return response;
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
    if (!(await hasAuthenticatedSession(request))) {
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
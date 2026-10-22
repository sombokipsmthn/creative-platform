import { getLocalAuthBypassState } from "@/lib/auth/local-bypass";
import { NextResponse } from "next/server";

async function hasAuthenticatedSession(request: Request): Promise<boolean> {
  try {
    // Better Auth exposes the current session at /get-session.
    // Use this request's origin so local development never calls a deployed host.
    const requestUrl = new URL(request.url);
    const response = await fetch(new URL("/api/auth/get-session", requestUrl.origin), {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return false;
    }

    const result: unknown = await response.json();
    if (!result || typeof result !== "object") {
      return false;
    }

    const sessionResult = result as {
      session?: unknown;
      user?: unknown;
    };

    return Boolean(sessionResult.session && sessionResult.user);
  } catch (error) {
    console.error("Unable to verify the Better Auth session:", error);
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

  // In development with local auth bypass enabled, skip auth checks for all routes.
  if (bypassState.enabled) {
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
      response.cookies.delete("local-auth-bypass");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/api/(.*)"],
};

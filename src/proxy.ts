import { getLocalAuthBypassState } from "@/lib/auth/local-bypass";
import { auth } from "@/lib/auth/auth";
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
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
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

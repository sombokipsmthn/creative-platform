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

  /*
   * -------------------------------------------------------
   * PUBLIC AUTH ROUTES
   * -------------------------------------------------------
   *
   * Sign-in and sign-up must remain publicly accessible.
   * Also allow the Better Auth API routes to pass through.
   */

  if (isAuthRoute(pathname) || isApiAuthRoute(pathname)) {
    return NextResponse.next();
  }

  /*
   * -------------------------------------------------------
   * CREATOR ONBOARDING
   * -------------------------------------------------------
   *
   * Onboarding requires a valid session, but does not
   * require the creator to already have a completed local
   * account.
   *
   * The onboarding API is responsible for creating/
   * retrieving the local creator account.
   */

  if (isOnboardingRoute(pathname)) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      const signInUrl = new URL("/sign-in", url.origin);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  }

  /*
   * -------------------------------------------------------
   * CREATOR ADMIN PORTAL
   * -------------------------------------------------------
   *
   * The creator portal is for authenticated creators.
   *
   * Authentication and creator authorization are separate
   * concerns. Better Auth authentication is enforced here, while
   * the application/database determines whether the user
   * has a creator account and what they can access.
   */

  if (isAdminRoute(pathname)) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      const signInUrl = new URL("/sign-in", url.origin);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  }

  /*
   * -------------------------------------------------------
   * ALL OTHER ROUTES
   * -------------------------------------------------------
   *
   * Public routes continue normally.
   */

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/api/(.*)",
  ],
};
import { getLocalAuthBypassState } from "./lib/auth/local-bypass";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { creatorWorkspaceBranding, users } from "./db/schema";

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

function isPortfolioRoute(pathname: string) {
  return pathname.startsWith("/p/") || pathname.startsWith("/portfolio/");
}

async function handleCustomDomain(request: Request): Promise<NextResponse | null> {
  const url = new URL(request.url);
  const hostname = url.hostname;

  // Skip if this is our own domain
  const isOwnDomain = hostname.includes('localhost') ||
    hostname.includes('.vercel.app') ||
    hostname.includes('kipsmthn.com') ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/https?:\/\//, '').replace(/\/.*$/, '') === hostname;

  if (isOwnDomain) {
    return null;
  }

  // Try to find a user with this custom domain
  try {
    const branding = await db.query.creatorWorkspaceBranding.findFirst({
      where: eq(creatorWorkspaceBranding.customDomain, hostname),
    });

    if (branding) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, branding.userId),
      });

      if (user?.handle) {
        // Rewrite to the public portfolio page
        const rewrittenUrl = new URL(url);
        rewrittenUrl.pathname = `/p/${user.handle}`;
        return NextResponse.rewrite(rewrittenUrl);
      }
    }
  } catch (error) {
    console.error('Custom domain middleware error:', error);
  }

  return null;
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

  // Handle custom domains for portfolio routes
  const customDomainResponse = await handleCustomDomain(request);
  if (customDomainResponse) {
    return customDomainResponse;
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

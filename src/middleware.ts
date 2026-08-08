import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require the visitor to be signed in at all
const isProtectedRoute = createRouteMatcher([
  "/client(.*)",
  "/admin(.*)",
]);

// Routes that require the "admin" role specifically
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) {
    return NextResponse.next();
  }

  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Role is stored in Clerk's publicMetadata.role — set this per-user
  // in the Clerk dashboard (or via the Backend API when you create clients).
  const role = (sessionClaims?.metadata as { role?: string } | undefined)
    ?.role;

  if (isAdminRoute(req) && role !== "admin") {
    // A signed-in client hitting /admin gets bounced to their own dashboard,
    // not an error page — keeps it friendly.
    return NextResponse.redirect(new URL("/client", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

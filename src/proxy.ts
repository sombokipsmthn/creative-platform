import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY;

const isOwnerRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/db-test",
]);

function forbiddenResponse(request: Request) {
  if (new URL(request.url).pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.redirect(new URL("/", request.url));
}

const customMiddleware = clerkMiddleware(
  async (auth, req) => {
    if (req.nextUrl.pathname === '/admin/login') {
      return;
    }

    if (!isOwnerRoute(req)) {
      return;
    }

    const { redirectToSignIn, userId } = await auth();

    if (!userId) {
      return redirectToSignIn();
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (!adminEmail) {
      // In dev / preview without adminEmail configured, allow passage to prevent locking out
      return;
    }

    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      const email = user.primaryEmailAddress?.emailAddress.toLowerCase();

      if (email && email !== adminEmail) {
        return forbiddenResponse(req);
      }
    } catch (error) {
      console.error("Unable to verify admin access", error);
      return;
    }
  },
  publishableKey ? { publishableKey } : undefined
);

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (!publishableKey) {
    return NextResponse.next();
  }

  return customMiddleware(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpeg|jpg|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};


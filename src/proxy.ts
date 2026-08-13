import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isOwnerRoute = createRouteMatcher(["/admin(.*)", "/api/db-test"]);

function forbiddenResponse(request: Request) {
  if (new URL(request.url).pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export default clerkMiddleware(async (auth, req) => {
  if (!isOwnerRoute(req)) {
    return;
  }

  const { redirectToSignIn, userId } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!adminEmail) {
    console.error("Missing ADMIN_EMAIL");
    return new NextResponse("Admin access is not configured", { status: 500 });
  }

  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress.toLowerCase();

    if (email !== adminEmail) {
      return forbiddenResponse(req);
    }
  } catch (error) {
    console.error("Unable to verify admin access", error);
    return new NextResponse("Unable to verify admin access", { status: 503 });
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpeg|jpg|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

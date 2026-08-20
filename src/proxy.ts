import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

import {
  NextFetchEvent,
  NextRequest,
  NextResponse,
} from "next/server";


const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.CLERK_PUBLISHABLE_KEY;


/*
|--------------------------------------------------------------------------
| ROUTE ACCESS CONTROL
|--------------------------------------------------------------------------
*/

// Admin dashboard routes
const isOwnerRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/db-test",
]);


// Creator onboarding must be public to authenticated users
// because new creators do not exist in the DB yet.
const isOnboardingRoute = createRouteMatcher([
  "/admin/onboarding(.*)",
]);


// Auth pages should always remain accessible
const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);


function forbiddenResponse(request: Request) {
  const pathname = new URL(request.url).pathname;

  console.log(
    "FORBIDDEN ACCESS REDIRECT:",
    pathname
  );

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: "Forbidden",
      },
      {
        status: 403,
      }
    );
  }

  return NextResponse.redirect(
    new URL("/", request.url)
  );
}



const customMiddleware = clerkMiddleware(
  async (auth, req) => {


    /*
    |--------------------------------------------------------------------------
    | PUBLIC AUTH ROUTES
    |--------------------------------------------------------------------------
    */

    if (isAuthRoute(req)) {
      return;
    }


    /*
    |--------------------------------------------------------------------------
    | CREATOR ONBOARDING
    |--------------------------------------------------------------------------
    |
    | New users land here after Clerk signup.
    | Do NOT apply admin restrictions.
    |
    */

    if (isOnboardingRoute(req)) {
      const {
        userId,
        redirectToSignIn,
      } = await auth();


      if (!userId) {
        return redirectToSignIn();
      }


      return;
    }



    /*
    |--------------------------------------------------------------------------
    | OWNER ADMIN ROUTES
    |--------------------------------------------------------------------------
    */

    if (!isOwnerRoute(req)) {
      return;
    }


    const {
      redirectToSignIn,
      userId,
    } = await auth();



    if (!userId) {
      return redirectToSignIn();
    }



    const adminEmail =
      process.env.ADMIN_EMAIL
        ?.trim()
        .toLowerCase();



    /*
    |--------------------------------------------------------------------------
    | DEV SAFETY
    |--------------------------------------------------------------------------
    */

    if (!adminEmail) {
      return;
    }



    try {

      const clerk =
        await clerkClient();


      const user =
        await clerk.users.getUser(userId);



      const email =
        user.primaryEmailAddress
          ?.emailAddress
          .toLowerCase();



      if (
        email &&
        email !== adminEmail
      ) {
        return forbiddenResponse(req);
      }


    } catch (error) {

      console.error(
        "Unable to verify admin access",
        error
      );

      return;

    }


  },

  publishableKey
    ? {
        publishableKey,
      }
    : undefined
);



export default function middleware(
  req: NextRequest,
  event: NextFetchEvent
) {

  if (!publishableKey) {
    return NextResponse.next();
  }


  return customMiddleware(
    req,
    event
  );

}



export const config = {

  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpeg?|jpg|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],

};
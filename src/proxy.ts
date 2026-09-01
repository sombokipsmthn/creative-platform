import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
]);

const isOnboardingRoute = createRouteMatcher([
  "/admin/onboarding(.*)",
]);

const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const customMiddleware = clerkMiddleware(
  async (auth, req) => {
    /*
     * -------------------------------------------------------
     * PUBLIC AUTH ROUTES
     * -------------------------------------------------------
     *
     * Sign-in and sign-up must remain publicly accessible.
     */

    if (isAuthRoute(req)) {
      return;
    }

    /*
     * -------------------------------------------------------
     * CREATOR ONBOARDING
     * -------------------------------------------------------
     *
     * Onboarding requires a valid Clerk session, but does not
     * require the creator to already have a completed local
     * account.
     *
     * The onboarding API is responsible for creating/
     * retrieving the local creator account.
     */

    if (isOnboardingRoute(req)) {
      try {
        const {
          userId,
          redirectToSignIn,
        } = await auth();

        if (!userId) {
          return redirectToSignIn();
        }
      } catch (error) {
        console.error('[Middleware] Auth error in onboarding route:', error);
        const { redirectToSignIn } = await auth();
        return redirectToSignIn();
      }

      return;
    }

    /*
     * -------------------------------------------------------
     * CREATOR ADMIN PORTAL
     * -------------------------------------------------------
     *
     * The creator portal is for authenticated creators.
     *
     * IMPORTANT:
     *
     * Do NOT use ADMIN_EMAIL here.
     *
     * ADMIN_EMAIL was previously being used as an owner-only
     * authorization gate. That caused a completed creator
     * onboarding flow to do this:
     *
     *   /admin/onboarding
     *        ↓
     *   /admin
     *        ↓
     *   ADMIN_EMAIL check
     *        ↓
     *   /
     *
     * Authentication and creator authorization are separate
     * concerns. Clerk authentication is enforced here, while
     * the application/database determines whether the user
     * has a creator account and what they can access.
     */

    if (isAdminRoute(req)) {
      try {
        const {
          userId,
          redirectToSignIn,
        } = await auth();

        if (!userId) {
          return redirectToSignIn();
        }
      } catch (error) {
        console.error('[Middleware] Auth error in admin route:', error);
        const { redirectToSignIn } = await auth();
        return redirectToSignIn();
      }

      return;
    }

    /*
     * -------------------------------------------------------
     * ALL OTHER ROUTES
     * -------------------------------------------------------
     *
     * Public routes continue normally.
     */

    return;
  }
);

export default customMiddleware;

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/api/(.*)",
  ],
};
"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || undefined,
});

type CompatUser = any;

export function useUser() {
  const session = authClient.useSession();
  const rawUser = session.data?.user ?? null;
  const user: CompatUser = rawUser ? { ...rawUser, fullName: rawUser.name, firstName: rawUser.name?.split(" ")[0], lastName: rawUser.name?.split(" ").slice(1).join(" "), primaryEmailAddress: { emailAddress: rawUser.email }, primaryEmailAddressId: rawUser.email, emailAddresses: [{ emailAddress: rawUser.email, id: rawUser.email }], imageUrl: rawUser.image ?? undefined, username: rawUser.email?.split("@")[0], update: async () => {} } : null;
  return {
    isLoaded: !session.isPending,
    isSignedIn: Boolean(user),
    user,
  };
}

export function useAuth() {
  const session = authClient.useSession();
  return { isLoaded: !session.isPending, isSignedIn: Boolean(session.data?.user), signOut: (options?: { redirectUrl?: string }) => authClient.signOut({ callbackURL: options?.redirectUrl }) };
}

export function useClerk() {
  return { signOut: (options?: { redirectUrl?: string }) => authClient.signOut({ callbackURL: options?.redirectUrl }) };
}

export function SignIn() {
  return null;
}

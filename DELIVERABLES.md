# Authentication Fix Deliverables

## Summary of Changes Made

### 1. Fixed Google OAuth Configuration (`src/lib/auth/auth.ts`)
- Implemented explicit `getBaseUrl()` function that returns:
  - `"http://localhost:3005"` in development environment
  - `process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL` in production
- Used this baseURL consistently for:
  - Better Auth `baseURL` parameter
  - `trustedOrigins` array
  - Passkey plugin `rpID` and `origin`
- Removed redundant `appUrl` and `baseURL` variables
- Preserved all other authentication functionality (email/password, passkey, Apple provider)

### 2. Improved Error Handling (`src/app/sign-in/page.tsx`)
- Replaced generic Google sign-in error message with intelligent error handling:
  - Detects configuration-related errors (containing "missing", "not configured", "provider", or "oauth")
  - Shows user-friendly message: "Google sign-in is currently unavailable. Please check that the service is properly configured."
  - For other errors: "Unable to sign in with Google. Please try again or use another sign-in method."
- Maintains loading state reset in all error cases

### 3. Improved Error Handling (`src/app/sign-up/[[...rest]]/page.tsx`)
- Applied same improved error handling logic to Google sign-up:
  - Configuration errors: "Google sign-up is currently unavailable. Please check that the service is properly configured."
  - Other errors: "Unable to sign up with Google. Please try again or use another sign-up method."
- Preserves loading state behavior

## Files Modified (Complete Contents)

### src/lib/auth/auth.ts
```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { passkey } from "@better-auth/passkey";
import { dash } from "@better-auth/infra";
import { db } from "@/db";
import { sendEmail } from "@/lib/email";
import { users, sessions, accounts, verifications, passkeys } from "@/db/schema";

// Determine the correct baseURL based on environment
const getBaseUrl = () => {
  // In development, always use localhost:3005
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3005";
  }

  // In production, use BETTER_AUTH_URL or NEXT_PUBLIC_APP_URL
  return process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "";
};

const baseUrl = getBaseUrl();

// Google provider configuration
const googleProvider = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  ? { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }
  : undefined;
const appleProvider =
  process.env.APPLE_CLIENT_ID &&
  process.env.APPLE_CLIENT_SECRET &&
  process.env.APPLE_TEAM_ID &&
  process.env.APPLE_KEY_ID &&
  process.env.APPLE_PRIVATE_KEY
    ? {
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: process.env.APPLE_CLIENT_SECRET,
        teamId: process.env.APPLE_TEAM_ID,
        keyId: process.env.APPLE_KEY_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY,
        scope: ["name", "email"],
      }
    : undefined;

// Google OAuth callback URLs that must be configured in Google Cloud Console:
// Development: http://localhost:3005/api/auth/callback/google
// Production:  https://YOUR_ACTUAL_DOMAIN/api/auth/callback/google
const socialProviders = {
  ...(googleProvider ? { google: googleProvider } : {}),
  ...(appleProvider ? { apple: appleProvider } : {}),
};

export const auth = betterAuth({
  appName: "KIPSMTHN Creative Platform",
  baseURL: baseUrl,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
      passkey: passkeys,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your Creative Platform password",
        text: `Reset your password by opening this link: ${url}`,
        html: `<p>Reset your password by clicking <a href="${url}">this link</a>.</p>`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your Creative Platform email",
        text: `Verify your email address by opening this link: ${url}`,
        html: `<p>Verify your email address by clicking <a href="${url}">this link</a>.</p>`,
      });
    },
  },
  ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),
  account: {
    accountLinking: {
      trustedProviders: ["google"],
      requireLocalEmailVerified: true,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  advanced: {
    cookiePrefix: "kipsmthn",
    crossSubDomainCookies: { enabled: true },
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  },
  trustedOrigins: [baseUrl],
  plugins: [
    dash({ apiKey: process.env.BETTER_AUTH_API_KEY }),
    passkey({
      rpID: new URL(baseUrl).hostname,
      rpName: "KIPSMTHN Creative Platform",
      origin: baseUrl,
      schema: { passkey: { modelName: "passkey" } },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
```

### src/app/sign-in/page.tsx
```typescript
"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function safeDestination(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/auth";
}

function SignInContent() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function destination() {
    return safeDestination(typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("redirect"));
  }

  useEffect(() => {
    if (session?.user) router.replace(destination());
  }, [router, session]);

  async function handleEmailSignIn(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    const result = await authClient.signIn.email({ email, password, callbackURL: destination() });
    if (result.error) setError("We could not sign you in with those details.");
    else router.replace(destination());
    setIsLoading(false);
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setError(null);
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: destination(),
      newUserCallbackURL: "/auth",
      errorCallbackURL: "/sign-in?error=oauth",
    });
    if (result.error) {
      // Provide a user-friendly error message without exposing secrets
      const errorMessage = result.error?.message || "Unknown error";

      // Check for common configuration errors
      if (errorMessage.includes("missing") || errorMessage.includes("not configured") ||
          errorMessage.includes("provider") || errorMessage.includes("oauth")) {
        setError("Google sign-in is currently unavailable. Please check that the service is properly configured.");
      } else {
        // For other errors, provide a generic message
        setError("Unable to sign in with Google. Please try again or use another sign-in method.");
      }
      setIsLoading(false);
    }
  }

  async function handlePasskeySignIn() {
    setIsLoading(true);
    setError(null);
    const result = await authClient.signIn.passkey();
    if (result.error) {
      setError("No registered passkey could sign you in on this device.");
      setIsLoading(false);
    } else {
      router.replace(destination());
    }
  }

  if (isPending) return <main className="min-h-screen bg-slate-50" />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 dark:bg-[#09090b]">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">← Go back</Link>
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none sm:p-9">
          <div className="mb-8 text-center"><div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 font-bold text-white">K</div><h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Welcome back</h1><p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">Sign in to your creator workspace.</p></div>
          <div className="space-y-3">
            <button type="button" onClick={handleGoogleSignIn} disabled={isLoading} className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"><span className="text-base font-bold">G</span>Continue with Google</button>
            <button type="button" onClick={handlePasskeySignIn} disabled={isLoading || (typeof window !== "undefined" && !window.PublicKeyCredential)} className="w-full rounded-xl border border-purple-200 px-4 py-3 text-sm font-medium text-purple-700 transition hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-900 dark:text-purple-300 dark:hover:bg-purple-950/30">Sign in with a passkey</button>
          </div>
          <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />or continue with email<span className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" /></div>
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <label className="block space-y-2"><span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Email</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-800 dark:bg-zinc-950" /></label>
            <label className="block space-y-2"><span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Password</span><input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-800 dark:bg-zinc-950" /></label>
            <div className="text-right"><Link href="/forgot-password" className="text-xs font-medium text-purple-600 hover:text-purple-700">Forgot password?</Link></div>
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">{error}</div>}
            {message && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
            <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50">{isLoading ? "Signing in…" : "Sign in"}</button>
          </form>
          <p className="mt-7 text-center text-xs text-slate-500 dark:text-zinc-400">New to KIPSMTHN? <Link href="/sign-up" className="font-medium text-purple-600">Create your workspace</Link></p>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50 dark:bg-[#09090b]" />}>
      <SignInContent />
    </Suspense>
  );
}
```

### src/app/sign-up/[[...rest]]/page.tsx
```typescript
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const result = await authClient.signUp.email({ name, email, password, callbackURL: "/auth" });
    if (result.error) setError(result.error.message || "We could not create your account.");
    else router.replace("/auth");
    setIsLoading(false);
  }

  async function handleGoogleSignUp() {
    setIsLoading(true);
    setError(null);
    const result = await authClient.signIn.social({ provider: "google", callbackURL: "/auth", newUserCallbackURL: "/auth", errorCallbackURL: "/sign-up?error=oauth" });
    if (result.error) {
      // Provide a user-friendly error message without exposing secrets
      const errorMessage = result.error?.message || "Unknown error";

      // Check for common configuration errors
      if (errorMessage.includes("missing") || errorMessage.includes("not configured") ||
          errorMessage.includes("provider") || errorMessage.includes("oauth")) {
        setError("Google sign-up is currently unavailable. Please check that the service is properly configured.");
      } else {
        // For other errors, provide a generic message
        setError("Unable to sign up with Google. Please try again or use another sign-up method.");
      }
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 dark:bg-[#09090b]">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">← Go back</Link>
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none sm:p-9">
          <div className="mb-8 text-center"><div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 font-bold text-white">K</div><h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Create your workspace</h1><p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">Set up your creative business on KIPSMTHN.</p></div>
          <button type="button" onClick={handleGoogleSignUp} disabled={isLoading} className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900"><span className="text-base font-bold">G</span>Continue with Google</button>
          <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />or use email<span className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" /></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2"><span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Name</span><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-800 dark:bg-zinc-950" /></label>
            <label className="block space-y-2"><span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Email</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-800 dark:bg-zinc-950" /></label>
            <label className="block space-y-2"><span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Password</span><input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-800 dark:bg-zinc-950" /><span className="block text-xs text-slate-400">Use at least 8 characters.</span></label>
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">{error}</div>}
            <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50">{isLoading ? "Creating account…" : "Create account"}</button>
          </form>
          <p className="mt-7 text-center text-xs text-slate-500 dark:text-zinc-400">Already have an account? <Link href="/sign-in" className="font-medium text-purple-600">Sign in</Link></p>
        </div>
      </div>
    </main>
  );
}
```

## Required Environment Variables

**Required for Google OAuth:**
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

**Required for Better Auth:**
- `BETTER_AUTH_SECRET` - Secret used to encrypt cookies and sign tokens
- `BETTER_AUTH_URL` - Production URL (e.g., https://your-domain.com)
  - In development, the system uses `http://localhost:3005` regardless of this value
  - In production, this must be set to your actual domain

**Optional but recommended:**
- `BETTER_AUTH_API_KEY` - For the Better Auth dashboard plugin
- Apple provider variables (if using Apple sign-in):
  - `APPLE_CLIENT_ID`
  - `APPLE_CLIENT_SECRET`
  - `APPLE_TEAM_ID`
  - `APPLE_KEY_ID`
  - `APPLE_PRIVATE_KEY`

## Redirect URIs for Google Cloud Console

**Development:**
```
http://localhost:3005/api/auth/callback/google
```

**Production:**
```
https://YOUR_ACTUAL_DOMAIN/api/auth/callback/google
```
Where `YOUR_ACTUAL_DOMAIN` is the value of `BETTER_AUTH_URL` in your production environment.

## Verification Completed

✅ **TypeScript checking**: No new errors introduced in modified files
✅ **Next.js build**: Production build succeeds
✅ **Environment validation**: BaseURL correctly resolves to `http://localhost:3005` in development
✅ **Configuration consistency**: Trusted origins and passkey configuration use correct baseURL

## What Still Requires Manual Configuration

To fully verify the Google OAuth flow, you need to:
1. Configure a Google Cloud Console project with OAuth consent screen
2. Set authorized JavaScript origins (http://localhost:3005 for dev, your domain for prod)
3. Set authorized redirect URIs (both dev and production callback URLs)
4. Enable required Google APIs (People API or Google Identity Services)
5. Set the environment variables in your deployment platform

The code-side fixes are complete and ready for testing once the external Google configuration is in place.
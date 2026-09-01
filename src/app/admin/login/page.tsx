'use client';

import { SignIn } from '@clerk/nextjs';

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b] px-6 py-12">
      <SignIn
        path="/admin/login"
        routing="path"
        // Redirect users who need to sign up to the actual Clerk sign‑up page.
        // The onboarding flow lives at /admin/onboarding and is entered after
        // the user has a valid Clerk account and passes through /auth.
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/admin"
      />
    </main>
  );
}

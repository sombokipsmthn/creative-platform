'use client';

import { SignIn } from '@clerk/nextjs';

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b] px-6 py-12">
      <SignIn
        path="/admin/login"
        routing="path"
        signUpUrl="/admin/onboarding"
        fallbackRedirectUrl="/admin"
      />
    </main>
  );
}
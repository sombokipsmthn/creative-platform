"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (result.error) {
      setError(result.error.message || "Unable to send the reset email.");
    } else {
      setMessage("If an account exists for that email, a reset link has been sent.");
    }
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/sign-in" className="mb-6 inline-flex text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">← Back to sign in</Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Forgot password?</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">Enter your email and we’ll send a secure reset link.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
            {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{message}</p>}
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-50">{isLoading ? "Sending..." : "Send reset link"}</button>
          </form>
        </div>
      </div>
    </main>
  );
}

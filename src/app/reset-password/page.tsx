"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(token ? null : "This reset link is missing its token.");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!token) return setError("This reset link is invalid or incomplete.");
    if (password !== confirmation) return setError("Passwords do not match.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");

    setIsLoading(true);
    const result = await authClient.resetPassword({ newPassword: password, token });
    if (result.error) setError(result.error.message || "This reset link is invalid or expired.");
    else { setMessage("Your password has been reset. You can now sign in."); setPassword(""); setConfirmation(""); }
    setIsLoading(false);
  }

  return <form onSubmit={handleSubmit} className="mt-6 space-y-4">
    <input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} disabled={isLoading || !token} placeholder="New password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
    <input type="password" required minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={isLoading || !token} placeholder="Confirm new password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
    {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{message}</p>}
    {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
    <button type="submit" disabled={isLoading || !token} className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-50">{isLoading ? "Resetting..." : "Reset password"}</button>
  </form>;
}

export default function ResetPasswordPage() {
  return <main className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex items-center justify-center px-6"><div className="w-full max-w-md"><Link href="/sign-in" className="mb-6 inline-flex text-sm text-zinc-500">← Back to sign in</Link><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"><h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Reset your password</h1><p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">Choose a new password for your workspace.</p><Suspense fallback={<p className="mt-6 text-sm text-slate-500">Loading reset link...</p>}><ResetPasswordForm /></Suspense></div></div></main>;
}

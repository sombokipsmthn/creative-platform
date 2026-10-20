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
      setError("Google sign-up is currently unavailable. Check the provider configuration.");
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

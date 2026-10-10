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
      setError("Google sign-in is currently unavailable. Check the provider configuration.");
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

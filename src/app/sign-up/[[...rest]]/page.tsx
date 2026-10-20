"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
          <Button type="button" onClick={handleGoogleSignUp} disabled={isLoading} variant="outline" className="w-full"><span className="text-base font-bold">G</span>Continue with Google</Button>
          <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />or use email<span className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" /></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2"><span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Name</span><Input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required disabled={isLoading} /></label>
            <label className="block space-y-2"><span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Email</span><Input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={isLoading} /></label>
            <label className="block space-y-2"><span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Password</span><Input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required disabled={isLoading} /><span className="block text-xs text-slate-400">Use at least 8 characters.</span></label>
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">{error}</div>}
            <Button type="submit" disabled={isLoading} variant="primary" className="w-full">{isLoading ? "Creating account…" : "Create account"}</Button>
          </form>
          <p className="mt-7 text-center text-xs text-slate-500 dark:text-zinc-400">Already have an account? <Link href="/sign-in" className="font-medium text-purple-600">Sign in</Link></p>
        </div>
      </div>
    </main>
  );
}

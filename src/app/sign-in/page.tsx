"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user) router.replace("/admin");
  }, [router, session]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await authClient.signIn.email({ email, password });
    if (result.error) {
      setError(result.error.message || "Invalid email or password");
    } else {
      router.push("/admin");
    }
    setIsLoading(false);
  }

  if (isPending) return null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">← Go back</Link>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white font-bold">K</div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Sign in to your workspace</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">Welcome back to KIPSMTHN</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2"><span className="block text-xs font-medium text-slate-700 dark:text-zinc-300">Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={isLoading} className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 dark:bg-zinc-950" /></label>
          <label className="block space-y-2"><span className="block text-xs font-medium text-slate-700 dark:text-zinc-300">Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={isLoading} className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 dark:bg-zinc-950" /></label>
          <div className="mt-1 text-right"><Link href="/forgot-password" className="text-xs font-medium text-purple-600 hover:text-purple-700">Forgot password?</Link></div>
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">{error}</div>}
          <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-purple-600 px-4 py-3 text-center text-sm font-medium text-white shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-colors disabled:opacity-50">{isLoading ? "Signing in..." : "Sign In"}</button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-zinc-400">Don&apos;t have an account? <Link href="/sign-up" className="font-medium text-purple-600">Get started</Link></p>
      </div>
    </main>
  );
}

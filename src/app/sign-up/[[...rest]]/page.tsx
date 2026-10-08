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

    const result = await authClient.signUp.email({ name, email, password });
    if (result.error) {
      setError(result.error.message || "Unable to create your account");
    } else {
      router.push("/admin/onboarding");
    }
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center"><div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white font-bold">K</div><h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Create your workspace</h1><p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">Join KIPSMTHN and build your creative business.</p></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2"><span className="block text-xs font-medium text-slate-700 dark:text-zinc-300">Name</span><input value={name} onChange={(event) => setName(event.target.value)} required disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950" /></label>
          <label className="block space-y-2"><span className="block text-xs font-medium text-slate-700 dark:text-zinc-300">Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950" /></label>
          <label className="block space-y-2"><span className="block text-xs font-medium text-slate-700 dark:text-zinc-300">Password</span><input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required disabled={isLoading} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950" /></label>
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">{error}</div>}
          <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">{isLoading ? "Creating account..." : "Create account"}</button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-zinc-400">Already have an account? <Link href="/sign-in" className="font-medium text-purple-600">Sign in</Link></p>
      </div>
    </main>
  );
}

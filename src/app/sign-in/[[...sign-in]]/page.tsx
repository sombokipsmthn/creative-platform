"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await authClient.signIn.email({
      email: email.trim().toLowerCase(),
      password,
    });

    if (result.error) {
      setError(result.error.message || "Unable to sign in.");
      setLoading(false);
      return;
    }

    router.replace("/auth");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-600">
            KIPSMTHN
          </p>
          <h1 className="mt-3 text-2xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in and we&apos;ll take you to the right place in your workspace.
          </p>
        </div>

        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          autoComplete="email"
          className="w-full rounded-xl border px-4 py-3"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          className="w-full rounded-xl border px-4 py-3"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <Link href="/sign-up" className="block text-center text-sm text-purple-600">
          Don&apos;t have an account? Create one
        </Link>
      </form>
    </main>
  );
}

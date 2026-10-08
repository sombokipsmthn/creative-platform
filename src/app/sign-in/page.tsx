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
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError(null);
    const result = await authClient.signIn.email({ email, password });
    if (result.error) setError(result.error.message || "Invalid email or password");
    else router.replace("/admin");
    setLoading(false);
  }
  return <main className="min-h-screen flex items-center justify-center px-6"><form onSubmit={submit} className="w-full max-w-md space-y-4"><h1 className="text-2xl font-semibold">Sign in to your workspace</h1><input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border px-4 py-3" /><input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border px-4 py-3" />{error && <p className="text-red-600">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-purple-600 px-4 py-3 text-white">{loading ? "Signing in…" : "Sign in"}</button><Link href="/sign-up" className="block text-center text-purple-600">Create an account</Link></form></main>;
}

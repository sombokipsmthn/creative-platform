'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); setIsLoading(true); setError(null);
    try { const { data, error: signInError } = await authClient.signIn.email({ email, password }); if (signInError) { setError(signInError.message || 'Invalid email or password'); return; } if (data) router.push('/admin'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Invalid email or password'); }
    finally { setIsLoading(false); }
  }
  return <main className="ui-page ui-page-padded"><div className="ui-shell max-w-md"><div className="ui-card p-6 sm:p-8"><Link href="/" className="admin-breadcrumb">← Go back</Link><div className="mt-8"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold">K</div><h1 className="admin-page-title mt-6">Sign in to your workspace</h1><p className="admin-page-description">Welcome back to KIPSMTHN</p></div><form onSubmit={handleSubmit} className="mt-8 space-y-5"><div className="space-y-2"><label htmlFor="email" className="ui-label">Email</label><Input id="email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="your@email.com" required disabled={isLoading} /></div><div className="space-y-2"><label htmlFor="password" className="ui-label">Password</label><Input id="password" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="••••••••" required disabled={isLoading} /></div>{error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</div>}<Button type="submit" disabled={isLoading} className="w-full">{isLoading ? 'Signing in…' : 'Sign in'}</Button></form><p className="mt-6 text-sm text-muted-foreground">Don&apos;t have an account? <Link href="/admin/onboarding" className="font-medium text-foreground underline-offset-4 hover:underline">Get started</Link></p></div></div></main>;
}

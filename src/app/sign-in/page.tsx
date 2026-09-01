'use client';

import { useSignIn } from '@clerk/nextjs/legacy';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SignInPage() {
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to admin
  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      router.replace('/admin');
    }
  }, [isUserLoaded, isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn || !setActive) return;
    setIsLoading(true);
    setError(null);

    try {
      // Use Clerk's signIn.create method
      const result = await signIn.create({
        identifier: email,
        password,
      });

      // Handle successful sign-in
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/admin');
      } else {
        // Handle cases where additional steps are needed (2FA, email verification, etc.)
        setError('Authentication requires additional steps. Please check your email.');
      }
    } catch (err) {
      const clerkError = err as { errors?: { longMessage?: string; message?: string }[] };
      setError(clerkError.errors?.[0]?.longMessage || clerkError.errors?.[0]?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Go back
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white font-bold">
            K
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Sign in to your workspace
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            Welcome back to KIPSMTHN
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-zinc-950"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-medium text-slate-700 dark:text-zinc-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-zinc-950"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-purple-600 px-4 py-3 text-center text-sm font-medium text-white shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Don't have an account?{' '}
            <Link href="/admin/onboarding" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
              Get started
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

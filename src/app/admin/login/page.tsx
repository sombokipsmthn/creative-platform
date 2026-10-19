'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await authClient.signIn.email({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || 'Invalid email or password');
        setIsLoading(false);
        return;
      }
      if (data) {
        router.push('/admin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="">
      <div className="">
        <Link
          href="/"
          className=""
        >
          ← Go back
        </Link>

        <div className="">
          <div className="">
            K
          </div>

          <h1 className="">
            Sign in to your workspace
          </h1>

          <p className="">
            Welcome back to KIPSMTHN
          </p>
        </div>

        <form onSubmit={handleSubmit} className="">
          <div className="">
            <label htmlFor="email" className="block">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className=""
              disabled={isLoading}
            />
          </div>

          <div className="">
            <label htmlFor="password" className="block">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className=""
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className=""
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="">
          <p className="">
            Don&apos;t have an account?{' '}
            <Link href="/admin/onboarding" className="">
              Get started
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

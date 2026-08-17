// src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreator } from '@/context/CreatorContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginUser } = useCreator();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const loggedIn = await loginUser(email, password);

      if (loggedIn) {
        router.push('/admin');
      } else {
        setError('Invalid email or password.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b] px-6">
      <section className="w-full max-w-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-widest text-slate-900 dark:text-white">
            KIPSMTHN<span className="text-purple-500">.</span>
          </h1>

          <p className="mt-3 text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400">
            Creator Admin Portal
          </p>
        </div>


        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2 text-slate-500">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-purple-500"
              placeholder="creator@email.com"
            />
          </div>


          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2 text-slate-500">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-purple-500"
              placeholder="••••••••"
            />
          </div>


          {error && (
            <p className="text-center text-sm text-red-500">
              {error}
            </p>
          )}


          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white py-3 text-xs font-mono uppercase tracking-widest font-bold transition disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Login'}
          </button>

        </form>


        <button
          onClick={() => router.push('/')}
          className="mt-6 w-full text-xs font-mono text-slate-500 hover:text-purple-600 transition"
        >
          ← Back to Website
        </button>

      </section>
    </main>
  );
}
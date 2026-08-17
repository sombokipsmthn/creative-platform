// src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreator } from '@/context/CreatorContext';

export default function AdminLoginPage() {
  const router = useRouter();

  const { loginUser } = useCreator();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      // CreatorContext currently expects a string
      loginUser(email);

      router.push('/admin');

    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <main className="
      min-h-screen
      flex items-center justify-center
      bg-slate-50 dark:bg-[#09090b]
      px-6
    ">

      <form
        onSubmit={handleSubmit}
        className="
          w-full
          max-w-md
          bg-white
          dark:bg-zinc-950
          border
          border-slate-200
          dark:border-zinc-800
          rounded-2xl
          p-8
          shadow-xl
          space-y-6
        "
      >

        <div className="text-center">

          <h1 className="
            text-3xl
            font-bold
            tracking-widest
            text-slate-900
            dark:text-white
          ">
            KIPSMTHN<span className="text-purple-500">.</span>
          </h1>


          <p className="
            mt-3
            text-xs
            font-mono
            uppercase
            tracking-[0.25em]
            text-purple-500
          ">
            Creator Portal
          </p>

        </div>



        {error && (
          <div className="
            text-sm
            text-red-500
            text-center
            bg-red-50
            dark:bg-red-950/20
            rounded-lg
            p-3
          ">
            {error}
          </div>
        )}



        <div className="space-y-3">

          <label className="
            text-xs
            font-mono
            uppercase
            tracking-widest
            text-slate-500
          ">
            Creator Email
          </label>


          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="creator@email.com"
            required
            className="
              w-full
              px-4
              py-3
              rounded-xl
              bg-slate-100
              dark:bg-zinc-900
              border
              border-slate-200
              dark:border-zinc-800
              text-slate-900
              dark:text-white
              outline-none
              focus:border-purple-500
            "
          />

        </div>



        <button
          type="submit"
          disabled={loading}
          className="
            w-full
            py-3
            rounded-xl
            bg-purple-600
            hover:bg-purple-700
            text-white
            text-xs
            font-mono
            uppercase
            tracking-widest
            transition-all
            disabled:opacity-50
          "
        >
          {loading ? 'Signing In...' : 'Access Dashboard'}
        </button>



        <p className="
          text-center
          text-[10px]
          font-mono
          uppercase
          tracking-widest
          text-slate-400
        ">
          Kipsmthn Creator Management System
        </p>


      </form>

    </main>
  );
}
// src/app/portal/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientPortalLandingPage() {
  const [tokenInput, setTokenInput] = useState('');
  const router = useRouter();

  const handleAccessGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    
    // If client pastes full URL (http://localhost:3000/portal/g/xK9_mQ2pL7v) or just token
    const cleanedToken = tokenInput.includes('/portal/g/') 
      ? tokenInput.split('/portal/g/')[1].trim()
      : tokenInput.trim();

    router.push(`/portal/g/${cleanedToken}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col justify-between p-6 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center py-4">
        <Link href="/" className="text-xl font-bold tracking-wider text-slate-900 dark:text-white font-sans uppercase">
          KIPSMTHN<span className="text-purple-500">.</span>
        </Link>
        <Link
          href="/"
          className="text-xs font-mono text-slate-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 uppercase tracking-widest"
        >
          ← Back to Portfolio
        </Link>
      </div>

      {/* Main Token Entry Box */}
      <div className="max-w-md w-full mx-auto p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl text-center space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase text-purple-600 dark:text-purple-400 tracking-widest">KIPSMTHN PLATFORM</p>
          <h1 className="text-2xl font-light text-slate-900 dark:text-white">Private Client Portal</h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-light leading-relaxed">
            Enter your secret token or gallery link to view your deliverables & proofing portal.
          </p>
        </div>

        <form onSubmit={handleAccessGallery} className="space-y-4">
          <input
            type="text"
            placeholder="Paste Secret Token (e.g. demo)"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="w-full text-center text-xs font-mono py-3 px-4 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
          />

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono uppercase tracking-widest rounded-lg transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)]"
          >
            Access Gallery
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 dark:border-zinc-900 flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-zinc-600">
          <span>Try token: <code className="text-purple-600 dark:text-purple-400">demo</code></span>
          <Link href="/admin/login" className="text-purple-600 dark:text-purple-400 hover:underline">
            Creator Admin →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center py-4 text-[11px] font-mono text-slate-500 dark:text-zinc-600">
        © {new Date().getFullYear()} KIPSMTHN Platform. All rights reserved.
      </div>
    </div>
  );
}
// src/app/portal/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientPortalLandingPage() {
  const [tokenInput, setTokenInput] = useState('');
  const router = useRouter();

  const handleAccessGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    
    let cleanedToken = tokenInput.trim();
    if (cleanedToken.includes('/portal/g/')) {
      cleanedToken = cleanedToken.split('/portal/g/')[1].trim();
    }

    router.push(`/portal/g/${cleanedToken}`);
  };

  const openSampleGallery = (token: string) => {
    router.push(`/portal/g/${token}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col justify-between p-6 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center py-4">
        <Link href="/" className="text-xl font-bold tracking-wider text-slate-900 dark:text-white font-sans uppercase">
          KIPSMTHN<span className="text-purple-500">.</span>
        </Link>
        <Link href="/" className="text-xs font-mono text-slate-600 dark:text-zinc-400 hover:text-purple-600 uppercase tracking-widest">
          ← Back to Portfolio
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl text-center space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase text-purple-600 dark:text-purple-400 tracking-widest font-bold">KIPSMTHN PLATFORM</p>
          <h1 className="text-2xl font-light text-slate-900 dark:text-white">Private Client Portal</h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-light leading-relaxed">
            Enter your secret token or gallery link to view your deliverables & proofing portal.
          </p>
        </div>

        <form onSubmit={handleAccessGallery} className="space-y-4">
          <input
            type="text"
            placeholder="Paste Secret Token or Link"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="w-full text-center text-xs font-mono py-3 px-4 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
          />

          <button
            type="submit"
            className="w-full py-3 btn-primary text-xs font-mono uppercase tracking-widest rounded-lg transition-colors shadow-md cursor-pointer"
          >
            Access Gallery →
          </button>
        </form>

        {/* Quick Test Gallery Buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-zinc-900 space-y-3 text-center">
          <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase">Or Click to Open Sample Gallery:</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => openSampleGallery('xK9_mQ2pL7v')}
              className="px-3 py-2 btn-secondary text-xs font-mono rounded-lg transition-colors text-purple-600 dark:text-purple-400 cursor-pointer font-bold"
            >
              UNDP Timbuktoo Summit 2026 (PIN: 4821) ↗
            </button>
            <button
              onClick={() => openSampleGallery('burn_impact_2025')}
              className="px-3 py-2 btn-secondary text-xs font-mono rounded-lg transition-colors text-purple-600 dark:text-purple-400 cursor-pointer font-bold"
            >
              BURN Manufacturing Series (PIN: 1234) ↗
            </button>
          </div>
        </div>

        <div className="pt-2 text-[11px] font-mono text-slate-500 dark:text-zinc-600">
          <Link href="/admin/login" className="text-purple-600 dark:text-purple-400 hover:underline font-bold">
            Creator Admin Login →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full text-center py-4 text-[11px] font-mono text-slate-500 dark:text-zinc-600">
        © {new Date().getFullYear()} KIPSMTHN Platform. All rights reserved.
      </div>
    </div>
  );
}
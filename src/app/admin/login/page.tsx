// src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorLoginPage() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleCreatorLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (passcode === 'sombo2026' || passcode === 'admin') {
      document.cookie = 'creator_session=authenticated; path=/; max-age=86400';
      router.push('/admin');
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full p-8 border border-zinc-800 bg-zinc-950 rounded-2xl space-y-6 text-center shadow-[0_0_60px_rgba(124,58,237,0.15)] relative">
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase text-purple-400 tracking-widest">Somboriot Kipchilat</p>
          <h1 className="text-2xl font-light text-white">Creator Admin Portal</h1>
          <p className="text-xs text-zinc-400 font-light">
            Enter creator passphrase to access client management & gallery builder.
          </p>
        </div>

        <form onSubmit={handleCreatorLogin} className="space-y-4">
          <div className="space-y-1">
            <input
              type="password"
              placeholder="Creator Passphrase"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError(false);
              }}
              className="w-full text-center text-sm font-mono py-3 px-4 bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:border-purple-600 focus:outline-none"
            />
            {error && <p className="text-[11px] text-red-400 font-mono">Invalid passphrase. Try "sombo2026"</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono uppercase tracking-widest rounded-lg transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)]"
          >
            Access Creator Dashboard
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-900 text-[11px] text-zinc-600 font-mono">
          <p>Passphrase for local dev: <code className="text-purple-400">sombo2026</code></p>
        </div>
      </div>
    </div>
  );
}
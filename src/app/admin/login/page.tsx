<<<<<<< HEAD
import { redirect } from "next/navigation";

export default function CreatorLoginPage() {
  redirect("/admin");
}
=======
// src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreator } from '@/context/CreatorContext';

export default function CreatorLoginPage() {
  const { loginUser, usersDb } = useCreator();
  const [selectedUserId, setSelectedUserId] = useState('sombo');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = usersDb[selectedUserId];

    if (user && (passcode === user.passcode || passcode === 'admin' || passcode === 'sombo2026' || passcode === 'demo2026')) {
      loginUser(selectedUserId);
      router.push('/admin');
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl space-y-6 text-center shadow-2xl relative">
        
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase text-purple-600 dark:text-purple-400 tracking-widest font-bold">KIPSMTHN PLATFORM</p>
          <h1 className="text-2xl font-light text-slate-900 dark:text-white">Creator Login</h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-light">
            Select a database user account or enter your passphrase.
          </p>
        </div>

        {/* Database User Select */}
        <form onSubmit={handleLogin} className="space-y-4 text-left font-mono text-xs">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Database Account *</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-xl focus:border-purple-600 focus:outline-none"
            >
              <option value="sombo">Somboriot Kipchilat (somboriot@gmail.com)</option>
              <option value="alex">Alex Mercer (alex@creativestudio.com)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Passphrase *</label>
            <input
              type="password"
              placeholder="sombo2026 or demo2026"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError(false);
              }}
              className="w-full p-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-xl focus:border-purple-600 focus:outline-none"
            />
            {error && <p className="text-[11px] text-red-500">Invalid passphrase. Use &quot;sombo2026&quot; or &quot;demo2026&quot;</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 btn-primary text-xs font-mono uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer font-bold"
          >
            Authenticate & Open Dashboard →
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 dark:border-zinc-900">
          <Link
            href="/admin/onboarding"
            className="inline-block w-full py-3 btn-secondary text-xs font-mono uppercase tracking-widest rounded-xl font-bold hover:text-purple-600"
          >
            + Register New Creator Account
          </Link>
        </div>

      </div>
    </div>
  );
}
>>>>>>> 9f8fb121e74b992ce270fd85a042444e53857047

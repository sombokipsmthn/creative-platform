// src/app/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/header';
import ThemeToggle from '@/components/ThemeToggle';
import { useCreator } from '@/context/CreatorContext';

export default function HomePage() {
  const { activeUser } = useCreator();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="relative pt-36 pb-20 px-6 max-w-7xl mx-auto text-center space-y-8">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-purple-600/15 blur-3xl pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs font-mono uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          KIPSMTHN PLATFORM • Nairobi, Kenya
        </div>

        <div className="space-y-4 max-w-5xl mx-auto">
          {activeUser ? (
            <>
              <p className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest font-bold">
                LOGGED IN CREATOR: {activeUser.name}
              </p>
              <h1 className="heading-editorial text-slate-900 dark:text-white max-w-4xl mx-auto">
                {activeUser.title}
              </h1>
              <p className="text-sm md:text-base text-slate-600 dark:text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed pt-2">
                {activeUser.bio}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest font-bold">
                CREATIVE PORTFOLIO & PRIVATE CLIENT DELIVERY PLATFORM
              </p>
              <h1 className="heading-editorial text-slate-900 dark:text-white max-w-4xl mx-auto">
                Multi-Creator Portfolio & Private Delivery Engine
              </h1>
              <p className="text-sm md:text-base text-slate-600 dark:text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed pt-2">
                Discover portfolio case studies, access private client delivery galleries, or log in to manage your creator account.
              </p>
            </>
          )}
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
          {activeUser ? (
            <Link
              href="/admin"
              className="px-8 py-4 btn-primary font-medium text-xs tracking-widest uppercase rounded-sm transition-all shadow-md"
            >
              Open Creator Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/admin/login"
                className="px-8 py-4 btn-primary font-medium text-xs tracking-widest uppercase rounded-sm transition-all shadow-md"
              >
                Creator Login
              </Link>
              <Link
                href="/portal"
                className="px-8 py-4 btn-secondary font-medium text-xs tracking-widest uppercase rounded-sm transition-all"
              >
                Client Gallery Access
              </Link>
            </>
          )}
        </div>
      </section>

      {/* 2. PORTFOLIO SHOWCASE */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-12 border-t border-slate-200 dark:border-zinc-800">
        <div className="flex justify-between items-end border-b border-slate-200 dark:border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">Portfolio</span>
            <h2 className="text-3xl font-light text-slate-900 dark:text-white mt-1">
              {activeUser ? `${activeUser.name}'s Productions` : 'Published Case Studies'}
            </h2>
          </div>
        </div>

        {/* Clean Data Strip State */}
        {!activeUser || activeUser.projects.length === 0 ? (
          <div className="p-16 border-2 border-dashed border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-3xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-purple-600/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-mono text-xl font-bold">+</div>
            <h3 className="text-xl font-medium text-slate-900 dark:text-white">No Public Case Studies Published</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto font-mono">
              Log in as a creator to publish case studies and client delivery galleries to the KIPSMTHN platform.
            </p>
            <Link href="/admin/login" className="inline-block px-6 py-3 btn-primary text-xs font-mono uppercase tracking-widest rounded-full shadow-md">
              Creator Login →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeUser.projects.map((p) => (
              <div key={p.id} className="p-6 border rounded-2xl bg-white dark:bg-zinc-900/30">
                <h3 className="text-xl font-bold">{p.title}</h3>
                <p className="text-xs text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-900 rounded-t-3xl pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-light text-slate-900 dark:text-white font-sans uppercase">
                KIPSMTHN<span className="text-purple-500">.</span>
              </h2>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                {activeUser ? activeUser.email : 'contact@kipsmthn.com'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/portal" className="px-4 py-2 text-xs font-mono btn-secondary rounded-full">
                Client Portal
              </Link>
              <Link href="/admin/login" className="px-4 py-2 text-xs font-mono btn-secondary rounded-full font-bold">
                Creator Login
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-zinc-900 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 dark:text-zinc-600 font-mono gap-4">
            <p>© {new Date().getFullYear()} KIPSMTHN Platform. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <ThemeToggle />
              <span>Nairobi, Kenya</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
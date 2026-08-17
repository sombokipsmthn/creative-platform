// src/app/about/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/header';
import ThemeToggle from '@/components/ThemeToggle';
import { useCreator } from '@/context/CreatorContext';

const resolveImage = (source?: string, fallbackUrl?: string) => {
  if (!source) return fallbackUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80';
  if (source.startsWith('http://') || source.startsWith('https://')) return source;
  return `https://lh3.googleusercontent.com/d/${source}`;
};

export default function AboutPage() {
  const { activeUser } = useCreator();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="relative pt-36 pb-16 px-6 max-w-7xl mx-auto text-center space-y-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-purple-600/15 blur-3xl pointer-events-none rounded-full" />

        <p className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">
          {activeUser ? `ABOUT ${activeUser.name}` : 'ABOUT KIPSMTHN PLATFORM'}
        </p>

        <h1 className="heading-editorial text-slate-900 dark:text-white max-w-4xl mx-auto">
          {activeUser ? activeUser.title : 'Multi-Creator Portfolio & Client Delivery Engine'}
        </h1>

        <p className="text-sm md:text-base text-slate-600 dark:text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
          {activeUser ? activeUser.bio : 'KIPSMTHN is a multi-tenant creative portfolio engine and private client delivery platform.'}
        </p>
      </section>

      {/* 2. CREATOR BIO & DETAILS (ONLY WHEN LOGGED IN) */}
      {!activeUser ? (
        <section className="py-16 px-6 max-w-4xl mx-auto text-center">
          <div className="p-12 border-2 border-dashed border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-3xl space-y-4">
            <h2 className="text-xl font-medium text-slate-900 dark:text-white">No Creator Logged In</h2>
            <p className="text-xs text-slate-500 font-mono">
              Log in to your creator account to view your bio, press features, and career milestones.
            </p>
            <Link href="/admin/login" className="inline-block px-6 py-3 btn-primary text-xs font-mono uppercase tracking-widest rounded-full">
              Creator Login →
            </Link>
          </div>
        </section>
      ) : (
        <section className="py-12 px-6 max-w-7xl mx-auto space-y-16">
          <div className="relative border border-slate-200 dark:border-zinc-800 bg-linear-to-r from-purple-100/80 via-slate-50 to-white dark:from-purple-950/40 dark:via-zinc-900/60 dark:to-zinc-950 rounded-3xl p-8 md:p-16 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-mono rounded-full font-semibold">
                {activeUser.name} — {activeUser.location}
              </span>

              <h2 className="text-3xl md:text-5xl font-light text-slate-900 dark:text-white leading-tight">
                {activeUser.title}
              </h2>

              <p className="text-sm text-slate-700 dark:text-zinc-300 font-light leading-relaxed">
                {activeUser.bio}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                {activeUser.socials?.linkedin && (
                  <a href={activeUser.socials.linkedin} target="_blank" className="px-6 py-3 btn-primary text-xs uppercase font-medium tracking-widest rounded-full">
                    LinkedIn ↗
                  </a>
                )}
                {activeUser.socials?.linktree && (
                  <a href={activeUser.socials.linktree} target="_blank" className="px-6 py-3 btn-secondary text-xs uppercase font-medium tracking-widest rounded-full">
                    Linktree ↗
                  </a>
                )}
              </div>
            </div>

            <div className="relative aspect-square w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl">
              <Image
                src={resolveImage(activeUser.avatarUrl)}
                alt={activeUser.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          {/* PRESS FEATURES (IF ANY) */}
          {activeUser.pressFeatures && activeUser.pressFeatures.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-light text-slate-900 dark:text-white">Press & Public Mentions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeUser.pressFeatures.map((press, i) => (
                  <a key={i} href={press.link} target="_blank" className="p-6 bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-2 hover:border-purple-600 transition-all">
                    <span className="text-[10px] font-mono text-purple-600 uppercase font-bold">{press.tag}</span>
                    <h4 className="text-base font-medium text-slate-900 dark:text-white">{press.title}</h4>
                    <p className="text-xs text-slate-500 font-mono">{press.publication}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-900 rounded-t-3xl pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 dark:text-zinc-600 font-mono gap-4">
          <p>© {new Date().getFullYear()} {activeUser ? activeUser.handle : 'KIPSMTHN'}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <span>{activeUser ? activeUser.location : 'Nairobi, Kenya'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
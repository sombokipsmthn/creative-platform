// src/app/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/header';
import ThemeToggle from '@/components/ThemeToggle';
import PartnerLogos from '@/components/PartnerLogos';
import { useCreator } from '@/context/CreatorContext';

const resolveImage = (source?: string, fallbackUrl?: string) => {
  if (!source) return fallbackUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80';
  if (source.startsWith('http://') || source.startsWith('https://')) return source;
  return `https://lh3.googleusercontent.com/d/${source}`;
};

const curvedGallery = [
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
];

export default function HomePage() {
  const { activeCreator } = useCreator();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="relative pt-36 pb-20 px-6 max-w-7xl mx-auto text-center space-y-8">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-purple-600/15 blur-3xl pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs font-mono uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          {activeCreator?.handle || 'KIPSMTHN'} • {activeCreator?.location || 'Nairobi, Kenya'}
        </div>

        <div className="space-y-4 max-w-5xl mx-auto">
          <p className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest font-bold">
            {activeCreator ? `FEATURED CREATOR: ${activeCreator.name}` : 'MULTI-TENANT CREATOR ENGINE'}
          </p>

          <h1 className="heading-editorial text-slate-900 dark:text-white max-w-4xl mx-auto">
            {activeCreator?.title || 'Creative Director & Ecosystem Storytelling Specialist'}
          </h1>

          <p className="text-sm md:text-base text-slate-600 dark:text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed pt-2">
            {activeCreator?.bio || 'Documenting African startup ecosystems, venture studios, accelerator programs, and clean-tech innovation through photography, film, and digital media.'}
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
          <Link
            href="/contact"
            className="px-8 py-4 btn-primary font-medium text-xs tracking-widest uppercase rounded-sm transition-all shadow-md"
          >
            Start a Collaboration
          </Link>
          {activeCreator?.socials?.linkedin && (
            <a
              href={activeCreator.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 btn-secondary font-medium text-xs tracking-widest uppercase rounded-sm transition-all"
            >
              LinkedIn ↗
            </a>
          )}
          {activeCreator?.socials?.youtube && (
            <a
              href={activeCreator.socials.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 btn-secondary font-medium text-xs tracking-widest uppercase rounded-sm transition-all"
            >
              YouTube / Kraft Digital ↗
            </a>
          )}
          {activeCreator?.socials?.linktree && (
            <a
              href={activeCreator.socials.linktree}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 btn-secondary font-medium text-xs tracking-widest uppercase rounded-sm transition-all"
            >
              Linktree
            </a>
          )}
        </div>

        {/* Laptop Hero Showcase Frame */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="relative aspect-16/10 bg-slate-900 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            <Image
              src={resolveImage(activeCreator?.avatarUrl)}
              alt={activeCreator?.name || 'KIPSMTHN'}
              fill
              priority
              className="object-cover opacity-85"
              unoptimized
            />
            <div className="absolute inset-0 bg-linear-to-trom-slate-950/90 via-transparent to-black/40 dark:from-[#09090b]" />

            <div className="absolute inset-0 flex flex-col justify-between p-8 text-left">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold tracking-wider text-white font-sans uppercase">
                  {activeCreator?.handle || 'KIPSMTHN'}<span className="text-purple-500">.</span>
                </span>
                <span className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 text-purple-200 text-[10px] font-mono rounded-full">
                  Verified Creator Profile
                </span>
              </div>

              <div className="space-y-2 max-w-lg">
                <p className="text-xs font-mono text-purple-400 uppercase">{activeCreator?.title || 'Ecosystem Storytelling'}</p>
                <h2 className="text-3xl md:text-5xl font-light text-white">{activeCreator?.name || 'Somboriot Kipchilat'}</h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PARTNERS TICKER */}
      <PartnerLogos />

      {/* 3. FEATURED CASE STUDIES */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">Featured Portfolio</span>
            <h2 className="text-3xl md:text-4xl font-light text-slate-900 dark:text-white mt-1">Creator Productions</h2>
          </div>
          {activeCreator?.socials?.linkedin && (
            <a
              href={activeCreator.socials.linkedin}
              target="_blank"
              className="text-xs font-mono uppercase tracking-widest text-slate-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              LinkedIn Credentials →
            </a>
          )}
        </div>

        {!activeCreator || activeCreator.projects.length === 0 ? (
          /* 💡 CLEAN ONBOARDING PLACEHOLDER FOR DEMO / NEW CREATORS */
          <div className="p-16 border-2 border-dashed border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-3xl text-center space-y-4 shadow-sm dark:shadow-none">
            <div className="w-12 h-12 mx-auto rounded-full bg-purple-600/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-mono text-xl font-bold">+</div>
            <h3 className="text-xl font-medium text-slate-900 dark:text-white">No Case Studies Published Yet</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto font-mono">
              {activeCreator ? (
                <>You are logged in as <strong className="text-purple-600 dark:text-purple-400">{activeCreator.name}</strong>. Create your first gallery in the Gallery Builder to publish case studies!</>
              ) : (
                <>Log in to your creator account to publish case studies and client delivery galleries to your portfolio.</>
              )}
            </p>
            <Link href={activeCreator ? '/admin/projects' : '/admin/login'} className="inline-block px-6 py-3 btn-primary text-xs font-mono uppercase tracking-widest rounded-full shadow-md">
              {activeCreator ? '+ Create First Gallery in Builder' : 'Creator Login →'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeCreator.projects.map((project) => (
              <div
                key={project.id}
                className={`group relative border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 rounded-2xl overflow-hidden hover:border-purple-600/60 transition-all duration-500 shadow-md dark:shadow-none ${
                  project.featured ? 'md:col-span-2' : ''
                }`}
              >
                <div className={`relative w-full ${project.featured ? 'aspect-21/9' : 'aspect-4/3'} overflow-hidden`}>
                  <Image
                    src={resolveImage(project.image)}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/60 to-transparent" />
                </div>

                <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 flex justify-between items-end bg-linear-to-t from-black/95 via-black/70 to-transparent pt-12">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-purple-600/30 border border-purple-400/50 text-purple-200 text-[10px] font-mono uppercase tracking-widest rounded-sm font-semibold">
                        {project.category}
                      </span>
                      <span className="text-xs text-zinc-300 font-mono">{project.year}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-medium text-white group-hover:text-purple-300 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-zinc-200 font-light leading-relaxed">{project.desc}</p>
                    <p className="text-[11px] text-purple-300 font-mono font-semibold">Partner: {project.client}</p>
                  </div>

                  <div className="w-10 h-10 rounded-full border border-white/30 bg-black/70 flex items-center justify-center text-white group-hover:bg-purple-600 group-hover:border-purple-600 transition-all shrink-0">
                    ↗
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. ABOUT BANNER */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="relative border border-slate-200 dark:border-zinc-800 bg-linear-to-r from-purple-100/80 via-slate-50 to-white dark:from-purple-950/40 dark:via-zinc-900/60 dark:to-zinc-950 rounded-3xl p-8 md:p-16 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-mono rounded-full font-semibold">
              {activeCreator?.name || 'Somboriot Kipchilat'} — {activeCreator?.location || 'Nairobi, Kenya'}
            </span>
            <h2 className="text-4xl md:text-6xl font-light text-slate-900 dark:text-white">The Person Behind the Story</h2>
            <p className="text-sm text-slate-700 dark:text-zinc-300 font-light leading-relaxed">
              {activeCreator?.bio || 'Extensive experience producing visual narratives across donor programs, startup accelerators, and venture studios.'}
            </p>

            <div className="flex gap-4 pt-2">
              {activeCreator?.socials?.linkedin && (
                <a href={activeCreator.socials.linkedin} target="_blank" className="px-6 py-3 btn-primary text-xs uppercase font-medium tracking-widest rounded-full">
                  Connect on LinkedIn ↗
                </a>
              )}
              {activeCreator?.socials?.instagram && (
                <a href={activeCreator.socials.instagram} target="_blank" className="px-6 py-3 btn-secondary text-xs uppercase font-medium tracking-widest rounded-full">
                  Instagram ↗
                </a>
              )}
            </div>
          </div>

          <div className="relative aspect-square w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl">
            <Image
              src={resolveImage(activeCreator?.avatarUrl)}
              alt={activeCreator?.name || 'KIPSMTHN'}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-purple-900/20 mix-blend-overlay" />
          </div>
        </div>
      </section>

      {/* 5. PERSPECTIVE FAN ARC GALLERY */}
      <section className="py-28 px-6 max-w-7xl mx-auto space-y-16 text-center border-t border-slate-200 dark:border-zinc-800">
        <div className="space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">Media Vault</span>
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 dark:text-white">Curious What Else We&apos;ve Captured?</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-light">
            Explore short-form video content, social storytelling, and tech documentaries on Kraft Digital.
          </p>
          <a
            href={activeCreator?.socials?.youtube || 'https://www.youtube.com/@kraftdigital7749'}
            target="_blank"
            className="inline-block px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-medium text-xs uppercase tracking-widest rounded-full hover:bg-purple-600 hover:text-white transition-colors"
          >
            Watch Kraft Digital on YouTube ↗
          </a>
        </div>

        <div className="flex justify-center items-center gap-3 overflow-x-auto py-8">
          {[
            { rot: '-rotate-12 translate-y-6', img: curvedGallery[0] },
            { rot: '-rotate-6 translate-y-2', img: curvedGallery[1] },
            { rot: 'rotate-0', img: curvedGallery[2] },
            { rot: 'rotate-6 translate-y-2', img: curvedGallery[3] },
            { rot: 'rotate-12 translate-y-6', img: curvedGallery[4] },
          ].map((item, i) => (
            <div
              key={i}
              className={`relative w-40 md:w-56 aspect-3/5 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transform ${item.rot} hover:scale-110 hover:z-20 hover:rotate-0 transition-all duration-300 shadow-2xl shrink-0`}
            >
              <Image
                src={resolveImage(item.img)}
                alt="Portfolio item"
                fill
                priority={i === 0}
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-900 rounded-t-3xl pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-light text-slate-900 dark:text-white font-sans uppercase">
                {activeCreator?.handle || 'KIPSMTHN'}<span className="text-purple-500">.</span>
              </h2>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                {activeCreator?.email || 'somboriot@gmail.com'} • {activeCreator?.phone || '+254 722 145 776'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeCreator?.socials?.linkedin && (
                <a href={activeCreator.socials.linkedin} target="_blank" className="px-4 py-2 text-xs font-mono rounded-full bg-purple-600 text-white">
                  LinkedIn
                </a>
              )}
              {activeCreator?.socials?.instagram && (
                <a href={activeCreator.socials.instagram} target="_blank" className="px-4 py-2 text-xs font-mono btn-secondary rounded-full">
                  Instagram
                </a>
              )}
              {activeCreator?.socials?.youtube && (
                <a href={activeCreator.socials.youtube} target="_blank" className="px-4 py-2 text-xs font-mono btn-secondary rounded-full">
                  YouTube
                </a>
              )}
              {activeCreator?.socials?.linktree && (
                <a href={activeCreator.socials.linktree} target="_blank" className="px-4 py-2 text-xs font-mono btn-secondary rounded-full">
                  Linktree
                </a>
              )}
              <Link href="/portal" className="px-4 py-2 text-xs font-mono btn-secondary rounded-full">
                Client Portal
              </Link>
              <Link href={activeCreator ? '/admin' : '/admin/login'} className="px-4 py-2 text-xs font-mono btn-secondary rounded-full font-bold hover:text-purple-600 dark:hover:text-purple-400">
                {activeCreator ? 'Creator Dashboard' : 'Creator Login'}
              </Link>
            </div>
          </div>

          {/* Copyright Bottom Bar */}
          <div className="border-t border-slate-200 dark:border-zinc-900 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 dark:text-zinc-600 font-mono gap-4">
            <p>© {new Date().getFullYear()} {activeCreator?.handle || 'KIPSMTHN Platform'}. All rights reserved.</p>
            
            <div className="flex items-center gap-6">
              <ThemeToggle />
              <span className="text-slate-500 dark:text-zinc-500">{activeCreator?.location || 'Nairobi, Kenya'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
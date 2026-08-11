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

const platformFeatures = [
  {
    num: '01',
    title: 'Editorial Portfolio Showcase',
    desc: 'Typography-driven public portfolios with small-caps headlines, custom domain support, and dual light/dark mode styling.',
    icon: '✨',
  },
  {
    num: '02',
    title: 'Private Client Gallery Portal',
    desc: 'Pixieset & Pic-Time inspired client access via secret share links, 4-digit PINs, and organized gallery collections.',
    icon: '🔒',
  },
  {
    num: '03',
    title: 'Interactive Proofing & Feedback',
    desc: 'Clients favorite photos with live selection counters (e.g., 14/20 Selected) and leave retoucher comments per item.',
    icon: '💬',
  },
  {
    num: '04',
    title: 'Kenyan Tax & KRA eTIMS Invoicing',
    desc: 'PDF quotation & invoice generator with automatic 16% VAT math, 50% deposit calculations, and KRA eTIMS portal bridge.',
    icon: '📄',
  },
  {
    num: '05',
    title: 'KRA Receipt Scanner & Tax Shield',
    desc: 'OCR scan camera gear and venue receipts to capture merchant KRA PINs and claim 30% corporate income tax deductions.',
    icon: '📷',
  },
  {
    num: '06',
    title: 'Zero-Egress High-Res ZIP Downloads',
    desc: 'Cloudflare R2 object storage integration offering unlimited high-res photo/video downloads with $0 egress fees.',
    icon: '⚡',
  },
];

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
          {activeUser ? `${activeUser.handle} • ${activeUser.location}` : 'KIPSMTHN PLATFORM • ALL-IN-ONE CREATIVE ENGINE'}
        </div>

        <div className="space-y-4 max-w-5xl mx-auto">
          <p className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest font-bold">
            {activeUser ? `ACTIVE CREATOR: ${activeUser.name}` : 'CREATIVE PORTFOLIO & PRIVATE CLIENT DELIVERY PLATFORM'}
          </p>

          <h1 className="heading-editorial text-slate-900 dark:text-white max-w-4xl mx-auto">
            {activeUser ? activeUser.title : 'The Ultimate Platform for Creative Directors & Visual Studios'}
          </h1>

          <p className="text-sm md:text-base text-slate-600 dark:text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed pt-2">
            {activeUser 
              ? activeUser.bio 
              : 'Manage portfolios, run client CRM with KRA eTIMS invoicing, deliver private proofing galleries, and stream high-res ZIP downloads—all inside one branded ecosystem.'}
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
          {activeUser ? (
            <>
              <Link
                href="/admin"
                className="px-8 py-4 btn-primary font-medium text-xs tracking-widest uppercase rounded-sm transition-all shadow-md"
              >
                Open Creator Dashboard
              </Link>
              {activeUser.socials?.linkedin && (
                <a
                  href={activeUser.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 btn-secondary font-medium text-xs tracking-widest uppercase rounded-sm transition-all"
                >
                  LinkedIn ↗
                </a>
              )}
            </>
          ) : (
            <>
              <Link
                href="/admin/login"
                className="px-8 py-4 btn-primary font-medium text-xs tracking-widest uppercase rounded-sm transition-all shadow-md"
              >
                Creator Login & Sign Up
              </Link>
              <Link
                href="/portal"
                className="px-8 py-4 btn-secondary font-medium text-xs tracking-widest uppercase rounded-sm transition-all"
              >
                Client Gallery Portal
              </Link>
            </>
          )}
        </div>

        {/* Laptop Hero Showcase Frame */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="relative aspect-16/10 bg-slate-900 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            <Image
              src={resolveImage(activeUser?.avatarUrl, 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80')}
              alt={activeUser?.name || 'KIPSMTHN Platform'}
              fill
              priority
              className="object-cover opacity-85"
              unoptimized
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-transparent to-black/40 dark:from-[#09090b]" />

            <div className="absolute inset-0 flex flex-col justify-between p-8 text-left">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold tracking-wider text-white font-sans uppercase">
                  {activeUser ? activeUser.handle : 'KIPSMTHN'}<span className="text-purple-500">.</span>
                </span>
                <span className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 text-purple-200 text-[10px] font-mono rounded-full">
                  {activeUser ? 'Verified Creator Account' : 'Platform Interface'}
                </span>
              </div>

              <div className="space-y-2 max-w-lg">
                <p className="text-xs font-mono text-purple-400 uppercase">
                  {activeUser ? activeUser.title : 'All-in-One Creative Workflow'}
                </p>
                <h2 className="text-3xl md:text-5xl font-light text-white">
                  {activeUser ? activeUser.name : 'Creative Production & Delivery Engine'}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PARTNER LOGOS (ONLY RENDERED IF LOGGED-IN CREATOR HAS PARTNERS) */}
      {activeUser && activeUser.partners && activeUser.partners.length > 0 && (
        <PartnerLogos partnersList={activeUser.partners} />
      )}

      {/* 3. PLATFORM CAPABILITIES GRID (LOGGED OUT SHOWCASE) */}
      {!activeUser && (
        <section className="py-24 px-6 max-w-7xl mx-auto space-y-12 border-t border-slate-200 dark:border-zinc-800">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">Platform Possibilities</span>
            <h2 className="text-3xl md:text-5xl font-light text-slate-900 dark:text-white">Everything You Need to Run Your Creative Studio</h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-mono">
              Designed for photographers, filmmakers, motion designers, and ecosystem storytellers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformFeatures.map((f) => (
              <div key={f.num} className="p-8 bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 rounded-2xl space-y-4 hover:border-purple-600/50 transition-all shadow-sm dark:shadow-none">
                <div className="flex justify-between items-center font-mono">
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">{f.num}</span>
                  <span className="text-lg">{f.icon}</span>
                </div>
                <h3 className="text-xl font-medium text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 font-light leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Interactive Client Portal Teaser Box */}
          <div className="p-8 border border-purple-500/30 bg-purple-100/50 dark:bg-purple-950/20 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg">
            <div className="space-y-2 max-w-xl">
              <span className="px-2.5 py-0.5 bg-purple-600/20 text-purple-700 dark:text-purple-300 text-[10px] font-mono rounded-full uppercase font-semibold">
                Pixieset & Pic-Time Inspired Engine
              </span>
              <h3 className="text-xl font-medium text-slate-900 dark:text-white">Test the Live Client Gallery Portal</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-300 font-light leading-relaxed">
                Experience how clients view, favorite, leave feedback comments, and download high-res ZIP archives.
              </p>
            </div>

            <Link href="/portal/g/xK9_mQ2pL7v" className="px-6 py-3 btn-primary text-xs uppercase font-medium tracking-widest rounded-full shrink-0 font-mono shadow-md">
              Test Sample Client Gallery (PIN: 4821) ↗
            </Link>
          </div>
        </section>
      )}

      {/* 4. FEATURED CASE STUDIES (LOGGED IN ONLY) */}
      {activeUser && (
        <section className="py-24 px-6 max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">Portfolio</span>
              <h2 className="text-3xl md:text-4xl font-light text-slate-900 dark:text-white mt-1">
                {`${activeUser.name}'s Productions`}
              </h2>
            </div>
          </div>

          {activeUser.projects.length === 0 ? (
            <div className="p-16 border-2 border-dashed border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-3xl text-center space-y-4 shadow-sm dark:shadow-none">
              <div className="w-12 h-12 mx-auto rounded-full bg-purple-600/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-mono text-xl font-bold">+</div>
              <h3 className="text-xl font-medium text-slate-900 dark:text-white">No Public Case Studies Published</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto font-mono">
                You are logged in as <strong className="text-purple-600 dark:text-purple-400">{activeUser.name}</strong>. Create your first gallery in the Gallery Builder to publish case studies to your portfolio!
              </p>
              <Link href="/admin/projects" className="inline-block px-6 py-3 btn-primary text-xs font-mono uppercase tracking-widest rounded-full shadow-md">
                + Create First Gallery in Builder
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activeUser.projects.map((project) => (
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
                      <span className="px-2.5 py-1 bg-purple-600/30 border border-purple-400/50 text-purple-200 text-[10px] font-mono uppercase tracking-widest rounded-sm font-semibold">
                        {project.category}
                      </span>
                      <h3 className="text-xl md:text-2xl font-medium text-white group-hover:text-purple-300 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs text-zinc-200 font-light leading-relaxed">{project.desc}</p>
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
      )}

      {/* 5. ABOUT BANNER (LOGGED IN ONLY) */}
      {activeUser && (
        <section className="py-12 px-6 max-w-7xl mx-auto">
          <div className="relative border border-slate-200 dark:border-zinc-800 bg-linear-to-r from-purple-100/80 via-slate-50 to-white dark:from-purple-950/40 dark:via-zinc-900/60 dark:to-zinc-950 rounded-3xl p-8 md:p-16 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-mono rounded-full font-semibold">
                {activeUser.name} — {activeUser.location}
              </span>
              <h2 className="text-4xl md:text-6xl font-light text-slate-900 dark:text-white">The Person Behind the Story</h2>
              <p className="text-sm text-slate-700 dark:text-zinc-300 font-light leading-relaxed">
                {activeUser.bio}
              </p>

              <div className="flex gap-4 pt-2">
                {activeUser.socials?.linkedin && (
                  <a href={activeUser.socials.linkedin} target="_blank" className="px-6 py-3 btn-primary text-xs uppercase font-medium tracking-widest rounded-full">
                    Connect on LinkedIn ↗
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
              <div className="absolute inset-0 bg-purple-900/20 mix-blend-overlay" />
            </div>
          </div>
        </section>
      )}

      {/* 6. MEDIA VAULT / CURVED GALLERY (GENERIC PLATFORM SHOWCASE WHEN LOGGED OUT) */}
      <section className="py-28 px-6 max-w-7xl mx-auto space-y-16 text-center border-t border-slate-200 dark:border-zinc-800">
        <div className="space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">Media Vault</span>
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 dark:text-white">Curious What Else We&apos;ve Captured?</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-light">
            Explore short-form video content, social storytelling, and tech documentaries across digital channels.
          </p>
          <a
            href={activeUser?.socials?.youtube || 'https://youtube.com'}
            target="_blank"
            className="inline-block px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-medium text-xs uppercase tracking-widest rounded-full hover:bg-purple-600 hover:text-white transition-colors"
          >
            Watch Video Vault on YouTube ↗
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

      {/* 7. FOOTER */}
      <footer className="bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-900 rounded-t-3xl pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-light text-slate-900 dark:text-white font-sans uppercase">
                {activeUser ? activeUser.handle : 'KIPSMTHN'}<span className="text-purple-500">.</span>
              </h2>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                {activeUser ? activeUser.email : 'contact@kipsmthn.com'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeUser?.socials?.linkedin && (
                <a href={activeUser.socials.linkedin} target="_blank" className="px-4 py-2 text-xs font-mono rounded-full bg-purple-600 text-white">
                  LinkedIn
                </a>
              )}
              <Link href="/portal" className="px-4 py-2 text-xs font-mono btn-secondary rounded-full">
                Client Portal
              </Link>
              <Link href={activeUser ? '/admin' : '/admin/login'} className="px-4 py-2 text-xs font-mono btn-secondary rounded-full font-bold hover:text-purple-600 dark:hover:text-purple-400">
                {activeUser ? 'Creator Dashboard' : 'Creator Login'}
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-zinc-900 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 dark:text-zinc-600 font-mono gap-4">
            <p>© {new Date().getFullYear()} {activeUser ? activeUser.handle : 'KIPSMTHN Platform'}. All rights reserved.</p>
            
            <div className="flex items-center gap-6">
              <ThemeToggle />
              <span>{activeUser ? activeUser.location : 'Nairobi, Kenya'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
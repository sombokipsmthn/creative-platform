// src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';

// 💡 Smart Image Resolver: Handles full URLs, Google Drive IDs, and Fallbacks
const resolveImage = (source?: string, fallbackUrl?: string) => {
  if (!source) return fallbackUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80';
  if (source.startsWith('http://') || source.startsWith('https://')) return source;
  // If it's a Google Drive ID
  return `https://lh3.googleusercontent.com/d/${source}`;
};

// 💡 Pre-loaded High-Res Creative Photos + Google Drive ID Slots
const portfolioMedia = {
  // Hero Mockup Image (Can be Google Drive ID OR direct Web URL)
  hero: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80',
  
  // About Section Image
  about: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',

  // Featured Projects (Mix of Google Drive IDs or Web URLs)
  projects: [
    {
      id: '01',
      title: 'UNDP Timbuktoo & EdTech Fellowship',
      client: 'iHUB / ccHUB',
      category: 'Ecosystem Storytelling & Program Documentation',
      year: '2023 - 2026',
      desc: 'Documenting founders, accelerator cohorts, and international ecosystem milestones across Africa.',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      featured: true,
    },
    {
      id: '02',
      title: 'Clean Energy Impact Series',
      client: 'BURN Manufacturing USA',
      category: 'Visual Storytelling & Media Production',
      year: '2025 - Present',
      desc: 'Impact video production, photography, and digital web UX improvements across African clean energy markets.',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
      featured: false,
    },
    {
      id: '03',
      title: 'Circular Economy & Climate Tech Summits',
      client: 'Delta40 Venture Studio',
      category: 'Venture Studio Media',
      year: '2025',
      desc: 'Capturing climate-tech founders across energy, mobility, and circular economy scale programs.',
      image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
      featured: false,
    },
  ],

  // Services Images
  services: [
    { num: '01', title: 'Startup Ecosystem Storytelling', desc: 'Translating accelerator programs, founder journeys, and innovation initiatives into compelling visual narratives.', tags: ['Program Documentation', 'Founder Spotlights', 'Impact Reporting', 'Demo Days'], image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80' },
    { num: '02', title: 'Accelerator & Venture Media', desc: 'End-to-end coverage for donor programs, venture studios, and innovation hubs across Africa.', tags: ['iHUB/ccHUB', 'Delta40 Studio', 'GrowthAfrica', 'UNDP Timbuktoo'], image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80' },
    { num: '03', title: 'E-Commerce & Brand Media', desc: 'High-scale product photography, creative direction, and digital marketing strategy for retail leaders.', tags: ['Shop Zetu', 'Copia Kenya', 'Home 254', 'Estee Lauder'], image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80' },
    { num: '04', title: 'Short-Form & Social Storytelling', desc: 'Engaging video, motion content, and brand narratives built for multi-platform digital reach.', tags: ['Kraft Digital', 'YouTube', 'Instagram Reels', 'Campaign Assets'], image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80' },
  ],

  // Curved Perspective Gallery Images
  curvedGallery: [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
  ],
};

const ecosystemPartners = [
  'iHUB / ccHUB',
  'UNDP Timbuktoo',
  'Mastercard Foundation',
  'Safaricom Spark',
  'BURN Manufacturing',
  'Delta40 Studio',
  'JICA NINJA',
  'GrowthAfrica',
  'Shop Zetu',
  'Estee Lauder',
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-purple-600 selection:text-white">
      <Header />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-36 pb-20 px-6 max-w-7xl mx-auto text-center space-y-8">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-purple-600/15 blur-[160px] pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/30 text-purple-300 text-xs font-mono uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          Nairobi, Kenya • Open for Global Ecosystem Projects
        </div>

        <div className="space-y-4 max-w-5xl mx-auto">
          <p className="text-xs font-mono text-purple-400 uppercase tracking-widest">
            SOMBORIOT KIPCHILAT (SOMBO / kipsmthn)
          </p>
          <h1 className="text-5xl md:text-8xl font-light tracking-tight text-white leading-[1.05]">
            CREATIVE DIRECTOR & <span className="font-normal text-purple-400">ECOSYSTEM STORYTELLING</span> SPECIALIST
          </h1>
          <p className="text-sm md:text-base text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed pt-2">
            Documenting African startup ecosystems, venture studios, accelerator programs, and clean-tech innovation through photography, film, and digital media.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
          <Link
            href="/contact"
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs tracking-widest uppercase rounded-sm transition-all shadow-[0_0_30px_rgba(124,58,237,0.35)]"
          >
            Start a Collaboration
          </Link>
          <a
            href="https://www.linkedin.com/in/sombo09/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-4 border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:text-white hover:border-purple-500/50 font-medium text-xs tracking-widest uppercase rounded-sm transition-all"
          >
            LinkedIn ↗
          </a>
          <a
            href="https://www.youtube.com/@kraftdigital7749"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-4 border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:text-white hover:border-purple-500/50 font-medium text-xs tracking-widest uppercase rounded-sm transition-all"
          >
            YouTube / Kraft Digital ↗
          </a>
          <a
            href="https://linktr.ee/kipsmthn"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-4 border border-zinc-800 text-zinc-400 hover:text-purple-400 font-medium text-xs tracking-widest uppercase rounded-sm transition-all"
          >
            Linktree
          </a>
        </div>

        {/* Laptop Hero Showcase Frame */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="relative aspect-16/10 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-[0_0_80px_rgba(124,58,237,0.2)]">
            <Image
              src={resolveImage(portfolioMedia.hero)}
              alt="Somboriot Kipchilat Portfolio Showcase"
              fill
              className="object-cover opacity-85"
              unoptimized
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#09090b] via-transparent to-black/40" />

            <div className="absolute inset-0 flex flex-col justify-between p-8 text-left">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold tracking-wider text-white">
                  SOMBO<span className="text-purple-500">.</span>
                </span>
                <span className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 text-purple-200 text-[10px] font-mono rounded-full">
                  Microsoft Imagine Cup Winner
                </span>
              </div>

              <div className="space-y-2 max-w-lg">
                <p className="text-xs font-mono text-purple-400 uppercase">African Innovation & Startup Stories</p>
                <h2 className="text-3xl md:text-5xl font-light text-white">Documenting Founders & Impact</h2>
                <p className="text-xs text-zinc-300 font-light">
                  Supporting iHUB, ccHUB, UNDP Timbuktoo, Safaricom Spark, and Delta40 Studio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PARTNERS TICKER */}
      {/* ========================================================================= */}
      <section className="py-12 border-y border-zinc-900 bg-zinc-950/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">
            Programs, Venture Studios & Brands Documented
          </p>
          <div className="flex flex-wrap justify-between items-center gap-6 text-sm font-mono text-zinc-300">
            {ecosystemPartners.map((partner) => (
              <span key={partner} className="px-3 py-1 bg-zinc-900/60 border border-zinc-800 rounded-sm">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURED CASE STUDIES */}
      {/* ========================================================================= */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-purple-400">Ecosystem Work</span>
            <h2 className="text-3xl md:text-4xl font-light text-white mt-1">Featured Programs & Productions</h2>
          </div>
          <a
            href="https://www.linkedin.com/in/sombo09/"
            target="_blank"
            className="text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-purple-400 transition-colors"
          >
            LinkedIn Credentials →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {portfolioMedia.projects.map((project) => (
            <div
              key={project.id}
              className={`group relative border border-zinc-800/80 bg-zinc-900/30 rounded-2xl overflow-hidden hover:border-purple-600/60 transition-all duration-500 ${
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
                <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-85" />
              </div>

              <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 flex justify-between items-end">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-purple-600/20 border border-purple-500/40 text-purple-300 text-[10px] font-mono uppercase tracking-widest rounded-sm">
                      {project.category}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">{project.year}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-medium text-white group-hover:text-purple-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-zinc-300 font-light leading-relaxed">{project.desc}</p>
                  <p className="text-[11px] text-purple-400 font-mono">Partner: {project.client}</p>
                </div>

                <div className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-950/80 flex items-center justify-center text-zinc-300 group-hover:bg-purple-600 group-hover:border-purple-600 group-hover:text-white transition-all">
                  ↗
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ABOUT & AWARDS */}
      {/* ========================================================================= */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="relative border border-zinc-800 bg-linear-to-r from-purple-950/40 via-zinc-900/60 to-zinc-950 rounded-3xl p-8 md:p-16 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-mono rounded-full">
              Somboriot Kipchilat — Nairobi, Kenya
            </span>
            <h2 className="text-4xl md:text-6xl font-light text-white">The Person Behind the Story</h2>
            <p className="text-sm text-zinc-300 font-light leading-relaxed">
              Extensive experience producing visual narratives across donor programs, startup accelerators, and venture studios. Former National Winner & World Citizenship Finalist at the Microsoft Imagine Cup in Russia.
            </p>

            <div className="space-y-2 border-t border-zinc-800 pt-4 text-xs text-zinc-400 font-mono">
              <p className="text-purple-400 font-semibold">🏆 Recognition & Honors:</p>
              <p>• World Citizenship Winner – Microsoft Imagine Cup (Russia)</p>
              <p>• National Final Winner – Microsoft Imagine Cup</p>
              <p>• BSc – Jomo Kenyatta University of Agriculture & Technology</p>
            </div>

            <div className="flex gap-4 pt-2">
              <a href="https://www.linkedin.com/in/sombo09/" target="_blank" className="px-6 py-3 bg-purple-600 text-white text-xs uppercase font-medium tracking-widest rounded-full hover:bg-purple-700 transition-colors">
                Connect on LinkedIn ↗
              </a>
              <a href="https://www.instagram.com/sombo_kipsmthn/" target="_blank" className="px-6 py-3 border border-zinc-700 text-zinc-300 text-xs uppercase font-medium tracking-widest rounded-full hover:bg-zinc-800 transition-colors">
                Instagram ↗
              </a>
            </div>
          </div>

          <div className="relative aspect-square w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-purple-500/30">
            <Image
              src={resolveImage(portfolioMedia.about)}
              alt="Somboriot Kipchilat"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-purple-900/20 mix-blend-overlay" />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CORE EXPERTISE & SERVICES */}
      {/* ========================================================================= */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-800 pb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-purple-400">Core Expertise</span>
            <h2 className="text-3xl md:text-4xl font-light text-white mt-1">Production & Storytelling Services</h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-sm font-light">
            Providing end-to-end visual storytelling, studio photography, video production, and brand narrative design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portfolioMedia.services.map((s) => (
            <div key={s.num} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-6 hover:border-purple-600/50 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-zinc-950">
                  <Image src={resolveImage(s.image)} alt={s.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                </div>
                <span className="text-xs font-mono text-purple-500">{s.num}</span>
                <h3 className="text-xl font-medium text-white">{s.title}</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">{s.desc}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {s.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono rounded-sm">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. PERSPECTIVE FAN ARC GALLERY */}
      {/* ========================================================================= */}
      <section className="py-28 px-6 max-w-7xl mx-auto space-y-16 text-center border-t border-zinc-800">
        <div className="space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-400">Media Vault</span>
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <h2 className="text-4xl md:text-5xl font-light text-white">Curious What Else I've Captured?</h2>
          <p className="text-xs text-zinc-400 font-light">
            Explore short-form video content, social storytelling, and tech documentaries on Kraft Digital.
          </p>
          <a
            href="https://www.youtube.com/@kraftdigital7749"
            target="_blank"
            className="inline-block px-8 py-3 bg-white text-black font-medium text-xs uppercase tracking-widest rounded-full hover:bg-purple-400 hover:text-white transition-colors"
          >
            Watch Kraft Digital on YouTube ↗
          </a>
        </div>

        <div className="flex justify-center items-center gap-3 overflow-x-auto py-8">
          {[
            { rot: '-rotate-12 translate-y-6', img: portfolioMedia.curvedGallery[0] },
            { rot: '-rotate-6 translate-y-2', img: portfolioMedia.curvedGallery[1] },
            { rot: 'rotate-0', img: portfolioMedia.curvedGallery[2] },
            { rot: 'rotate-6 translate-y-2', img: portfolioMedia.curvedGallery[3] },
            { rot: 'rotate-12 translate-y-6', img: portfolioMedia.curvedGallery[4] },
          ].map((item, i) => (
            <div
              key={i}
              className={`relative w-40 md:w-56 aspect-3/5 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 transform ${item.rot} hover:scale-110 hover:z-20 hover:rotate-0 transition-all duration-300 shadow-2xl shrink-0`}
            >
              <Image src={resolveImage(item.img)} alt="Portfolio item" fill className="object-cover" unoptimized />
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-zinc-950 border-t border-zinc-900 rounded-t-3xl pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-light text-white">
                Somboriot Kipchilat
              </h2>
              <p className="text-xs text-purple-400 font-mono">somboriot@gmail.com • +254 722 145 776</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a href="https://www.linkedin.com/in/sombo09/" target="_blank" className="px-4 py-2 text-xs font-mono rounded-full bg-purple-600 text-white">
                LinkedIn
              </a>
              <a href="https://www.instagram.com/sombo_kipsmthn/" target="_blank" className="px-4 py-2 text-xs font-mono rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white">
                Instagram
              </a>
              <a href="https://www.youtube.com/@kraftdigital7749" target="_blank" className="px-4 py-2 text-xs font-mono rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white">
                YouTube
              </a>
              <a href="https://linktr.ee/kipsmthn" target="_blank" className="px-4 py-2 text-xs font-mono rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white">
                Linktree
              </a>
              <Link href="/portal" className="px-4 py-2 text-xs font-mono rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white">
                Client Delivery Portal
              </Link>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-zinc-600 font-mono gap-2">
            <p>© {new Date().getFullYear()} Somboriot Kipchilat (SOMBO / kipsmthn). All rights reserved.</p>
            <p>Nairobi, Kenya</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
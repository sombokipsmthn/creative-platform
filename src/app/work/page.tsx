'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/header';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';

const resolveImage = (source?: string, fallbackUrl?: string) => {
  if (!source) return fallbackUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80';
  if (source.startsWith('http://') || source.startsWith('https://')) return source;
  return `https://lh3.googleusercontent.com/d/${source}`;
};

const creativePillars = [
  {
    num: '01',
    id: 'Photography',
    title: 'Photography',
    subtitle: 'Commercial & Ecosystem',
    desc: 'Large-scale catalog production, studio portraiture, and ecosystem event documentation.',
    tags: ['E-Commerce Catalogs', 'Startup Cohorts', 'Studio & Location', 'Color Grading'],
    count: '3 Projects',
  },
  {
    num: '02',
    id: 'Videography',
    title: 'Videography',
    subtitle: 'Brand Films & Impact',
    desc: 'Cinematic storytelling, documentaries, founder interviews, and short-form video content.',
    tags: ['Impact Series', 'Founder Spotlights', 'Documentary', 'Short-Form Reels'],
    count: '3 Projects',
  },
  {
    num: '03',
    id: 'Branding',
    title: 'Branding & Graphic Design',
    subtitle: 'Identity & Visual Systems',
    desc: 'Comprehensive visual architecture, event branding, print assets, and brand design guidelines.',
    tags: ['Visual Identity', 'TEDx Branding', 'Merchandise', 'Style Guides'],
    count: '3 Projects',
  },
  {
    num: '04',
    id: 'UI/UX',
    title: 'UI / UX',
    subtitle: 'Digital & E-Commerce',
    desc: 'Optimizing web platforms, user journeys, and e-commerce marketplace experiences.',
    tags: ['Marketplace UX', 'Web Platforms', 'User Journeys', 'E-Commerce Growth'],
    count: '2 Projects',
  },
];

const allProjects = [
  {
    id: 'ph_01',
    title: 'Shop Zetu & Vivo Woman E-Commerce Studio',
    client: 'Shop Zetu / Vivo Woman',
    category: 'Photography',
    year: '2021 - 2023',
    desc: 'Built out Zetu Studios and led large-scale catalogue photography for East Africa’s leading fashion marketplace.',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
    featured: true,
  },
  {
    id: 'ph_02',
    title: 'Copia Kenya Product Catalogue Photography',
    client: 'Copia Kenya',
    category: 'Photography',
    year: '2021 - 2023',
    desc: 'Managed large-scale catalogue production for Copia’s entire e-commerce product platform ensuring visual consistency.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    featured: false,
  },
  {
    id: 'ph_03',
    title: 'Delta40 Climate Tech & Circular Economy Summits',
    client: 'Delta40 Venture Studio',
    category: 'Photography',
    year: '2025',
    desc: 'Event and founder documentation across Circular Economy Scale Summits and Energy Innovation Programs.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    featured: false,
  },
  {
    id: 'vid_01',
    title: 'Clean Energy Impact Film Series',
    client: 'BURN Manufacturing USA',
    category: 'Videography',
    year: '2025 - Present',
    desc: 'Producing visual storytelling and documentary videography highlighting clean energy impact across African markets.',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    featured: true,
  },
  {
    id: 'vid_02',
    title: 'UNDP Timbuktoo & EdTech Fellowship Stories',
    client: 'iHUB / ccHUB',
    category: 'Videography',
    year: '2023 - 2026',
    desc: 'Video production, founder spotlights, and cohort documentation across international accelerator programs.',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    featured: false,
  },
  {
    id: 'vid_03',
    title: 'JICA NINJA & GrowthAfrica Accelerator Stories',
    client: 'GrowthAfrica / GIZ',
    category: 'Videography',
    year: '2020 - 2024',
    desc: 'Documenting startup founders and investor demo days through short-form video and program storytelling.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    featured: false,
  },
  {
    id: 'brand_01',
    title: 'Uhuru Market Action Research Visual Identity',
    client: 'HEVA Fund',
    category: 'Branding',
    year: '2020',
    desc: 'Created visual identity systems and communications assets for Kenya’s textile and fashion sector research initiative.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
    featured: true,
  },
  {
    id: 'brand_02',
    title: 'TEDx Parklands Event Brand & Visual System',
    client: 'TEDx Parklands',
    category: 'Branding',
    year: '2018 - 2019',
    desc: 'Overseeing event brand identity, stage graphics, photography, and print communications.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    featured: false,
  },
  {
    id: 'brand_03',
    title: 'HustleSasa Passion to Profit Brand Identities',
    client: 'HustleSasa',
    category: 'Branding',
    year: '2023',
    desc: 'Developed brand assets, logos, and merchandise design for 20+ entrepreneur participants.',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
    featured: false,
  },
  {
    id: 'ui_01',
    title: 'BURN Manufacturing Platform UX Systems',
    client: 'BURN Manufacturing USA',
    category: 'UI/UX',
    year: '2025 - Present',
    desc: 'Collaborating with product teams on visual systems, interface hierarchy, and UX improvements across web platforms.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    featured: true,
  },
  {
    id: 'ui_02',
    title: 'Home 254 E-Commerce Digital Growth',
    client: 'Home 254',
    category: 'UI/UX',
    year: '2020 - 2021',
    desc: 'Led digital marketing, user experience optimization, and visual identity for East African streetwear e-commerce.',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    featured: false,
  },
];

export default function WorkIndexPage() {
  const [selectedPillar, setSelectedPillar] = useState('All');

  const filteredProjects = selectedPillar === 'All'
    ? allProjects
    : allProjects.filter((p) => p.category === selectedPillar);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="relative pt-36 pb-12 px-6 max-w-7xl mx-auto text-center space-y-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-purple-600/15 blur-3xl pointer-events-none rounded-full" />

        <p className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">
          KIPSMTHN PORTFOLIO ARCHIVE
        </p>

        <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto">
          Selected Works Across <span className="font-normal text-purple-600 dark:text-purple-400">Four Creative Pillars</span>
        </h1>

        <p className="text-sm text-slate-600 dark:text-zinc-400 font-light max-w-xl mx-auto leading-relaxed">
          Specialized production and visual direction in Photography, Videography, Branding, and UI/UX.
        </p>
      </section>

      {/* 2. CREATIVE PILLARS CARDS OVERVIEW */}
      <section className="py-8 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {creativePillars.map((p) => {
            const isActive = selectedPillar === p.id;
            return (
              <div
                key={p.num}
                onClick={() => setSelectedPillar(p.id)}
                className={`p-6 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isActive
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 shadow-lg'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-purple-500/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-mono text-xs">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">{p.num}</span>
                    <span className="text-slate-500 dark:text-zinc-500">{p.count}</span>
                  </div>
                  <h3 className="text-xl font-medium text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 font-light leading-relaxed">{p.desc}</p>
                </div>

                <div className="flex flex-wrap gap-1 pt-2">
                  {p.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] text-slate-700 dark:text-zinc-400 font-mono rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. INTERACTIVE PILLAR SWITCHER BAR */}
      <section className="py-6 px-6 max-w-7xl mx-auto border-y border-slate-200 dark:border-zinc-900">
        <div className="flex gap-3 overflow-x-auto justify-start md:justify-center py-2">
          <Button
            variant={selectedPillar === 'All' ? 'primary' : 'secondary'}
            onClick={() => setSelectedPillar('All')}
            className="text-xs font-mono uppercase tracking-widest whitespace-nowrap"
          >
            All Works ({allProjects.length})
          </Button>

          <Button
            variant={selectedPillar === 'Photography' ? 'primary' : 'secondary'}
            onClick={() => setSelectedPillar('Photography')}
            className="text-xs font-mono uppercase tracking-widest whitespace-nowrap"
          >
            01. Photography ({allProjects.filter((p) => p.category === 'Photography').length})
          </Button>

          <Button
            variant={selectedPillar === 'Videography' ? 'primary' : 'secondary'}
            onClick={() => setSelectedPillar('Videography')}
            className="text-xs font-mono uppercase tracking-widest whitespace-nowrap"
          >
            02. Videography ({allProjects.filter((p) => p.category === 'Videography').length})
          </Button>

          <Button
            variant={selectedPillar === 'Branding' ? 'primary' : 'secondary'}
            onClick={() => setSelectedPillar('Branding')}
            className="text-xs font-mono uppercase tracking-widest whitespace-nowrap"
          >
            03. Branding ({allProjects.filter((p) => p.category === 'Branding').length})
          </Button>

          <Button
            variant={selectedPillar === 'UI/UX' ? 'primary' : 'secondary'}
            onClick={() => setSelectedPillar('UI/UX')}
            className="text-xs font-mono uppercase tracking-widest whitespace-nowrap"
          >
            04. UI / UX ({allProjects.filter((p) => p.category === 'UI/UX').length})
          </Button>
        </div>
      </section>

      {/* 4. SHOWCASE GRID */}
      <main className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`group relative border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 rounded-xl overflow-hidden hover:border-purple-600/60 transition-all duration-500 shadow-md dark:shadow-none ${project.featured ? 'md:col-span-2' : ''}`}
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

              {/* OVERLAY TEXT */}
              <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 flex justify-between items-end bg-linear-to-t from-black/95 via-black/70 to-transparent pt-12">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-purple-600/30 border border-purple-400/50 text-purple-200 text-[10px] font-mono uppercase tracking-widest rounded-sm font-semibold">
                      {project.category}
                    </span>
                    <span className="text-xs text-zinc-300 font-mono">{project.year}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-medium text-white group-hover:text-purple-300 transition-colors">
                    {project.title}
                  </h2>
                  <p className="text-xs text-zinc-200 font-light leading-relaxed">{project.desc}</p>
                  <p className="text-[11px] text-purple-300 font-mono font-semibold">Client: {project.client}</p>
                </div>

                <div className="w-10 h-10 rounded-full border border-white/30 bg-black/70 flex items-center justify-center text-white group-hover:bg-purple-600 group-hover:border-purple-600 transition-all shrink-0">
                  ↗
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 5. FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-100 dark:bg-zinc-950 rounded-t-xl pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-light text-slate-900 dark:text-white font-sans uppercase">
                KIPSMTHN<span className="text-purple-500">.</span>
              </h2>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">somboriot@gmail.com • +254 722 145 776</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="https://www.linkedin.com/in/sombo09/"
                target="_blank"
                rel="noopener noreferrer"
                className="Button Button--primary"
              >
                LinkedIn
              </Link>
              <Link
                href="https://www.instagram.com/sombo_kipsmthn/"
                target="_blank"
                rel="noopener noreferrer"
                className="Button Button--secondary"
              >
                Instagram
              </Link>
              <Link
                href="https://www.youtube.com/@kraftdigital7749"
                target="_blank"
                rel="noopener noreferrer"
                className="Button Button--secondary"
              >
                YouTube
              </Link>
              <Link
                href="https://linktr.ee/kipsmthn"
                target="_blank"
                rel="noopener noreferrer"
                className="Button Button--secondary"
              >
                Linktree
              </Link>
              <Link
                href="/portal"
                className="Button Button--secondary"
              >
                Client Delivery Portal
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-zinc-900 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 dark:text-zinc-600 font-mono gap-4">
            <p>© {new Date().getFullYear()} KIPSMTHN Platform. All rights reserved.</p>

            <div className="flex items-center gap-6">
              <ThemeToggle />
              <span className="text-slate-500 dark:text-zinc-500">Nairobi, Kenya</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

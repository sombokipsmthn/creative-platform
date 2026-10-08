'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/header';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';

interface Project {
  id: string;
  name: string;
  short_description: string | null;
  slug: string | null;
  category: string | null;
  year: string | null;
  location: string | null;
  featured: boolean;
  published_at: string | null;
  client_name: string | null;
  client_company: string | null;
  cover_display_url: string | null;
  cover_thumbnail_url: string | null;
  cover_alt_text: string | null;
  cover_caption: string | null;
}

interface CategoryInfo {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  tags: string[];
}

const creativePillars: CategoryInfo[] = [
  {
    id: 'Photography',
    title: 'Photography',
    subtitle: 'Commercial & Ecosystem',
    desc: 'Large-scale catalog production, studio portraiture, and ecosystem event documentation.',
    tags: ['E-Commerce Catalogs', 'Startup Cohorts', 'Studio & Location', 'Color Grading'],
  },
  {
    id: 'Videography',
    title: 'Videography',
    subtitle: 'Brand Films & Impact',
    desc: 'Cinematic storytelling, documentaries, founder interviews, and short-form video content.',
    tags: ['Impact Series', 'Founder Spotlights', 'Documentary', 'Short-Form Reels'],
  },
  {
    id: 'Branding',
    title: 'Branding & Graphic Design',
    subtitle: 'Identity & Visual Systems',
    desc: 'Comprehensive visual architecture, event branding, print assets, and brand design guidelines.',
    tags: ['Visual Identity', 'Event Branding', 'Print Assets', 'Style Guides'],
  },
  {
    id: 'UI/UX',
    title: 'UI / UX',
    subtitle: 'Digital & E-Commerce',
    desc: 'Optimizing web platforms, user journeys, and e-commerce marketplace experiences.',
    tags: ['Marketplace UX', 'Web Platforms', 'User Journeys', 'E-Commerce Growth'],
  },
];

const resolveImage = (source?: string | null, fallbackUrl?: string) => {
  if (!source) return fallbackUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80';
  if (source.startsWith('http://') || source.startsWith('https://')) return source;
  return `https://lh3.googleusercontent.com/d/${source}`;
};

export default function WorkIndexPage() {
  const [selectedPillar, setSelectedPillar] = useState('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/public/projects', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load projects');
        }

        const data = await response.json();
        if (!cancelled) {
          setProjects(data.projects || []);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        if (!cancelled) {
          setError('Unable to load projects. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  const availableCategories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean))) as string[];

  const filteredProjects = selectedPillar === 'All'
    ? projects
    : projects.filter((p) => p.category === selectedPillar);

  const allPillars = ['All', ...creativePillars.map((p) => p.id), ...availableCategories.filter((c) => !creativePillars.map((p) => p.id).includes(c))];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="relative pt-36 pb-12 px-6 max-w-7xl mx-auto text-center space-y-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-purple-600/15 blur-3xl pointer-events-none rounded-full" />

        <p className="text-xs font-sans uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">
          KIPSMTHN PORTFOLIO ARCHIVE
        </p>

        <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto">
          Selected Works Across <span className="font-normal text-purple-600 dark:text-purple-400">Creative Disciplines</span>
        </h1>

        <p className="text-sm text-slate-600 dark:text-zinc-400 font-light max-w-xl mx-auto leading-relaxed">
          Specialized production and visual direction across photography, videography, branding, and digital experiences.
        </p>
      </section>

      {/* 2. CREATIVE PILLARS CARDS OVERVIEW */}
      <section className="py-8 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {creativePillars.map((p) => {
            const isActive = selectedPillar === p.id;
            const count = projects.filter((proj) => proj.category === p.id).length;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPillar(p.id)}
                className={`p-6 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isActive
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 shadow-lg'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-purple-500/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-sans text-xs">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">01</span>
                    <span className="text-slate-500 dark:text-zinc-500">{count} Projects</span>
                  </div>
                  <h3 className="text-xl font-medium text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 font-light leading-relaxed">{p.desc}</p>
                </div>

                <div className="flex flex-wrap gap-1 pt-2">
                  {p.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] text-slate-700 dark:text-zinc-400 font-sans rounded-sm">
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
          {allPillars.map((pillar) => {
            const count = pillar === 'All' ? projects.length : projects.filter((proj) => proj.category === pillar).length;
            const isActive = selectedPillar === pillar;
            return (
              <Button
                key={pillar}
                variant={isActive ? 'primary' : 'secondary'}
                onClick={() => setSelectedPillar(pillar)}
                className="text-xs font-sans uppercase tracking-widest whitespace-nowrap"
              >
                {pillar === 'All' ? 'All Works' : pillar} ({count})
              </Button>
            );
          })}
        </div>
      </section>

      {/* 4. SHOWCASE GRID */}
      <main className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        {loading ? (
          <div className="p-12 text-center border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950/40">
            <p className="text-xs font-sans text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Loading portfolio…</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center border border-red-500/30 dark:border-red-900/30 bg-red-500/10 dark:bg-red-900/10 rounded-xl">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-300 dark:border-zinc-800 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              {selectedPillar === 'All' ? 'No published projects yet.' : `No projects in ${selectedPillar} yet.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map((project) => {
              const coverUrl = project.cover_display_url || project.cover_thumbnail_url;
              const clientName = project.client_company || project.client_name || 'Confidential Client';
              return (
                <Link
                  key={project.id}
                  href={project.slug ? `/work/${project.slug}` : '#'}
                  className={`group relative border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 rounded-xl overflow-hidden hover:border-purple-600/60 transition-all duration-500 shadow-md dark:shadow-none ${project.featured ? 'md:col-span-2' : ''}`}
                >
                  <div className={`relative w-full ${project.featured ? 'aspect-21/9' : 'aspect-4/3'} overflow-hidden`}>
                    <Image
                      src={resolveImage(coverUrl)}
                      alt={project.cover_alt_text || project.name}
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
                        <span className="px-2.5 py-1 bg-purple-600/30 border border-purple-400/50 text-purple-200 text-[10px] font-sans uppercase tracking-widest rounded-sm font-semibold">
                          {project.category || 'Project'}
                        </span>
                        <span className="text-xs text-zinc-300 font-sans">{project.year || ''}</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-medium text-white group-hover:text-purple-300 transition-colors">
                        {project.name}
                      </h2>
                      {project.short_description && (
                        <p className="text-xs text-zinc-200 font-light leading-relaxed">{project.short_description}</p>
                      )}
                      <p className="text-[11px] text-purple-300 font-sans font-semibold">Client: {clientName}</p>
                    </div>

                    <div className="w-10 h-10 rounded-full border border-white/30 bg-black/70 flex items-center justify-center text-white group-hover:bg-purple-600 group-hover:border-purple-600 transition-all shrink-0">
                      ↗
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* 5. FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-100 dark:bg-zinc-950 rounded-t-xl pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-light text-slate-900 dark:text-white font-sans uppercase">
                KIPSMTHN<span className="text-purple-500">.</span>
              </h2>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-sans">somboriot@gmail.com • +254 722 145 776</p>
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

          <div className="border-t border-slate-200 dark:border-zinc-900 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 dark:text-zinc-600 font-sans gap-4">
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
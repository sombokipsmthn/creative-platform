'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/components/header';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: "Work | KIPSMTHN",
  description:
    "Selected works across photography, videography, branding, and UI/UX. Portfolio archive of commercial production, brand films, and creative systems.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Work | KIPSMTHN",
    description:
      "Selected works across photography, videography, branding, and UI/UX. Portfolio archive of commercial production, brand films, and creative systems.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "KIPSMTHN Work",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Work | KIPSMTHN",
    description:
      "Selected works across photography, videography, branding, and UI/UX. Portfolio archive of commercial production, brand films, and creative systems.",
  },
};

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
    <div className="">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="">
        <div className="" />

        <p className="">
          KIPSMTHN PORTFOLIO ARCHIVE
        </p>

        <h1 className="">
          Selected Works Across <span className="">Four Creative Pillars</span>
        </h1>

        <p className="">
          Specialized production and visual direction in Photography, Videography, Branding, and UI/UX.
        </p>
      </section>

      {/* 2. CREATIVE PILLARS CARDS OVERVIEW */}
      <section className="">
        <div className="">
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
                <div className="">
                  <div className="">
                    <span className="">{p.num}</span>
                    <span className="">{p.count}</span>
                  </div>
                  <h3 className="">{p.title}</h3>
                  <p className="">{p.desc}</p>
                </div>

                <div className="">
                  {p.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="">
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
      <section className="">
        <div className="">
          <Button
            variant={selectedPillar === 'All' ? 'primary' : 'secondary'}
            onClick={() => setSelectedPillar('All')}
            className=""
          >
            All Works ({allProjects.length})
          </Button>

          <Button
            variant={selectedPillar === 'Photography' ? 'primary' : 'secondary'}
            onClick={() => setSelectedPillar('Photography')}
            className=""
          >
            01. Photography ({allProjects.filter((p) => p.category === 'Photography').length})
          </Button>

          <Button
            variant={selectedPillar === 'Videography' ? 'primary' : 'secondary'}
            onClick={() => setSelectedPillar('Videography')}
            className=""
          >
            02. Videography ({allProjects.filter((p) => p.category === 'Videography').length})
          </Button>

          <Button
            variant={selectedPillar === 'Branding' ? 'primary' : 'secondary'}
            onClick={() => setSelectedPillar('Branding')}
            className=""
          >
            03. Branding ({allProjects.filter((p) => p.category === 'Branding').length})
          </Button>

          <Button
            variant={selectedPillar === 'UI/UX' ? 'primary' : 'secondary'}
            onClick={() => setSelectedPillar('UI/UX')}
            className=""
          >
            04. UI / UX ({allProjects.filter((p) => p.category === 'UI/UX').length})
          </Button>
        </div>
      </section>

      {/* 4. SHOWCASE GRID */}
      <main className="">
        <div className="">
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
                  className="ease-out"
                  unoptimized
                />
                <div className="to-transparent" />
              </div>

              {/* OVERLAY TEXT */}
              <div className="to-transparent">
                <div className="">
                  <div className="">
                    <span className="">
                      {project.category}
                    </span>
                    <span className="">{project.year}</span>
                  </div>
                  <h2 className="">
                    {project.title}
                  </h2>
                  <p className="">{project.desc}</p>
                  <p className="">Client: {project.client}</p>
                </div>

                <div className="">
                  ↗
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 5. FOOTER */}
      <footer className="">
        <div className="">
          <div className="">
            <div>
              <h2 className="">
                KIPSMTHN<span className="">.</span>
              </h2>
              <p className="">somboriot@gmail.com • +254 722 145 776</p>
            </div>

            <div className="">
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

          <div className="">
            <p>© {new Date().getFullYear()} KIPSMTHN Platform. All rights reserved.</p>

            <div className="">
              <ThemeToggle />
              <span className="">Nairobi, Kenya</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

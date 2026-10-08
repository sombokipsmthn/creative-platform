'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/header';
import ThemeToggle from '@/components/ThemeToggle';

const allProjects = [
  {
    id: 1,
    name: "Brand Identity for Nairobi Coffee",
    category: "Branding",
    image: "/project1.jpg",
    description: "Full brand identity design for a specialty coffee roaster in Nairobi.",
  },
  {
    id: 2,
    name: "Corporate Headshots Series",
    category: "Photography",
    image: "/project2.jpg",
    description: "Professional corporate headshots for a tech startup in Nairobi.",
  },
  {
    id: 3,
    name: "Wedding Film - Karen",
    category: "Videography",
    image: "/project3.jpg",
    description: "Cinematic wedding film shot in Karen, Nairobi.",
  },
  {
    id: 4,
    name: "Product Photography - Tech",
    category: "Photography",
    image: "/project4.jpg",
    description: "Product photography for a tech gadget launch.",
  },
];

export default function WorkPage() {
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

        <p className="text-xs font-sans uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">
          KIPSMTHN PORTFOLIO ARCHIVE
        </p>

        <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto">
          Selected Works Across <span className="font-normal text-purple-600 dark:text-purple-400">Four Creative Pillars</span>
        </h1>

        <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto">
          A curated collection of commercial production, brand films, and creative systems from KIPSMTHN Studio.
        </p>
      </section>

      {/* 2. FILTER TABS */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-wrap gap-3 justify-center">
          {['All', 'Branding', 'Photography', 'Videography'].map((pillar) => (
            <button
              key={pillar}
              onClick={() => setSelectedPillar(pillar)}
              className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-colors ${selectedPillar === pillar ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-300 dark:hover:bg-zinc-700'}`}
            >
              {pillar}
            </button>
          ))}
        </div>
      </section>

      {/* 3. PROJECT GRID */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Link href={`/work/${project.id}`} key={project.id} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 dark:bg-zinc-800">
                {project.image && (
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="mt-4">
                <p className="text-xs font-sans uppercase tracking-widest text-purple-600 dark:text-purple-400">{project.category}</p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{project.name}</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400">{project.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
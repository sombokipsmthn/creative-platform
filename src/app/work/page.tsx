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
          A curated collection of commercial production, brand films, and creative systems from KIPSMTHN Studio.
        </p>
      </section>

      {/* 2. FILTER TABS */}
      <section className="">
        <div className="">
          {['All', 'Branding', 'Photography', 'Videography'].map((pillar) => (
            <button
              key={pillar}
              onClick={() => setSelectedPillar(pillar)}
              className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-colors ${selectedPillar === pillar ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-300 dark:hover:bg-zinc-700'}`}
            >
              {pillar}
            </button>
          ))}
        </div>
      </section>

      {/* 3. PROJECT GRID */}
      <section className="">
        <div className="">
          {filteredProjects.map((project) => (
            <Link href={`/work/${project.id}`} key={project.id} className="block">
              <div className="">
                {project.image && (
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className=""
                  />
                )}
              </div>
              <div className="">
                <p className="">{project.category}</p>
                <h3 className="">{project.name}</h3>
                <p className="">{project.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

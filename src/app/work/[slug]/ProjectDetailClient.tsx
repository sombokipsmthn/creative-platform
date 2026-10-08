'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import Header from '@/components/header';
import ThemeToggle from '@/components/ThemeToggle';

type MediaItem = {
  id: string;
  filename: string;
  original_url: string;
  display_url: string;
  thumbnail_url: string;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
  is_cover: boolean;
};

type Project = {
  id: string;
  name: string;
  short_description: string | null;
  description: string | null;
  slug: string | null;
  category: string | null;
  year: string | null;
  location: string | null;
  services: string[] | null;
  disciplines: string[] | null;
  collaborators: string[] | null;
  role: string | null;
  story_overview: string | null;
  story_challenge: string | null;
  story_approach: string | null;
  story_outcome: string | null;
  story_credits: string | null;
  client_name: string | null;
  client_company: string | null;
  client_location: string | null;
  media: MediaItem[];
};

const resolveImage = (source?: string | null, fallbackUrl?: string) => {
  if (!source) return fallbackUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80';
  if (source.startsWith('http://') || source.startsWith('https://')) return source;
  return `https://lh3.googleusercontent.com/d/${source}`;
};

function StorySection({ title, body }: { title: string; body: string | null }) {
  if (!body) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-sans uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">
        {title}
      </h2>
      <div className="prose prose-slate dark:prose-invert max-w-none leading-8 whitespace-pre-wrap text-slate-700 dark:text-zinc-300 font-light">
        {body}
      </div>
    </section>
  );
}

export default function ProjectDetailClient({ project, slug }: { project: Project; slug: string }) {
  const clientName = project.client_company || project.client_name || 'Confidential Client';
  const coverImage = project.media.find((m) => m.is_cover) || project.media[0];

  const storySections = [
    { title: 'Overview', body: project.story_overview || project.description },
    { title: 'The Challenge', body: project.story_challenge },
    { title: 'Approach', body: project.story_approach },
    { title: 'Outcome & Impact', body: project.story_outcome },
    { title: 'Credits', body: project.story_credits },
  ].filter((s) => s.body);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <Header />

      {/* Back to portfolio */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <Link
          href="/work"
          className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-slate-500 dark:text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Work
        </Link>
      </div>

      {/* Hero */}
      <section className="relative pt-10 pb-8 px-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-4 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-xs font-sans uppercase tracking-widest">
              {project.category && (
                <span className="px-2.5 py-1 bg-purple-600/15 border border-purple-400/40 text-purple-600 dark:text-purple-300 rounded-sm font-semibold">
                  {project.category}
                </span>
              )}
              {project.year && <span className="text-slate-500 dark:text-zinc-500">{project.year}</span>}
            </div>

            <h1 className="text-4xl md:text-6xl font-light tracking-tight text-slate-900 dark:text-white leading-[1.05]">
              {project.name}
            </h1>

            {(project.short_description || project.description) && (
              <p className="text-base md:text-lg text-slate-600 dark:text-zinc-400 font-light leading-relaxed max-w-2xl">
                {project.short_description || project.description}
              </p>
            )}
          </div>

          {/* Metadata strip */}
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 border-t border-slate-200 dark:border-zinc-800 pt-6">
            {clientName !== 'Confidential Client' && (
              <div>
                <p className="text-[10px] font-sans uppercase tracking-widest text-slate-400 dark:text-zinc-600">Client</p>
                <p className="mt-1 text-sm font-medium text-slate-800 dark:text-zinc-200">{clientName}</p>
              </div>
            )}
            {project.location && (
              <div>
                <p className="text-[10px] font-sans uppercase tracking-widest text-slate-400 dark:text-zinc-600">Location</p>
                <p className="mt-1 text-sm font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {project.location}
                </p>
              </div>
            )}
            {project.role && (
              <div>
                <p className="text-[10px] font-sans uppercase tracking-widest text-slate-400 dark:text-zinc-600">Role</p>
                <p className="mt-1 text-sm font-medium text-slate-800 dark:text-zinc-200">{project.role}</p>
              </div>
            )}
            {project.year && (
              <div>
                <p className="text-[10px] font-sans uppercase tracking-widest text-slate-400 dark:text-zinc-600">Year</p>
                <p className="mt-1 text-sm font-medium text-slate-800 dark:text-zinc-200">{project.year}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Primary visual */}
      {coverImage && (
        <section className="px-6 max-w-7xl mx-auto">
          <div className="relative w-full aspect-16/9 md:aspect-21/9 overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800">
            <Image
              src={resolveImage(coverImage.display_url)}
              alt={coverImage.alt_text || project.name}
              fill
              priority
              className="object-cover"
              unoptimized
            />
          </div>
          {coverImage.caption && (
            <p className="mt-3 text-xs text-slate-500 dark:text-zinc-500 text-center font-sans">{coverImage.caption}</p>
          )}
        </section>
      )}

      {/* Story */}
      {storySections.length > 0 && (
        <section className="py-16 px-6 max-w-3xl mx-auto space-y-14">
          {storySections.map((section) => (
            <StorySection key={section.title} title={section.title} body={section.body} />
          ))}
        </section>
      )}

      {/* Services & disciplines */}
      {(project.services?.length || project.disciplines?.length || project.collaborators?.length) && (
        <section className="py-12 px-6 max-w-7xl mx-auto border-t border-slate-200 dark:border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {project.services && project.services.length > 0 && (
              <div>
                <p className="text-[10px] font-sans uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-3">Services</p>
                <ul className="space-y-2">
                  {project.services.map((service) => (
                    <li key={service} className="text-sm text-slate-700 dark:text-zinc-300">{service}</li>
                  ))}
                </ul>
              </div>
            )}
            {project.disciplines && project.disciplines.length > 0 && (
              <div>
                <p className="text-[10px] font-sans uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-3">Disciplines</p>
                <ul className="space-y-2">
                  {project.disciplines.map((discipline) => (
                    <li key={discipline} className="text-sm text-slate-700 dark:text-zinc-300">{discipline}</li>
                  ))}
                </ul>
              </div>
            )}
            {project.collaborators && project.collaborators.length > 0 && (
              <div>
                <p className="text-[10px] font-sans uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-3">Collaborators</p>
                <ul className="space-y-2">
                  {project.collaborators.map((collaborator) => (
                    <li key={collaborator} className="text-sm text-slate-700 dark:text-zinc-300">{collaborator}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Supporting media */}
      {project.media.length > 1 && (
        <section className="py-12 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.media.map((media) => {
              if (media.is_cover || media === coverImage) return null;
              return (
                <figure key={media.id} className="space-y-2">
                  <div className="relative w-full aspect-4/3 overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800">
                    <Image
                      src={resolveImage(media.display_url)}
                      alt={media.alt_text || project.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {media.caption && (
                    <figcaption className="text-xs text-slate-500 dark:text-zinc-500 text-center font-sans">{media.caption}</figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="rounded-[2rem] bg-purple-600 p-8 md:p-14 text-white">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-sans uppercase tracking-[0.25em] text-purple-200">Let&apos;s work together</p>
              <h2 className="mt-5 text-3xl md:text-5xl font-light tracking-tight">Have a project in mind?</h2>
              <p className="mt-5 max-w-xl text-sm md:text-base leading-7 text-purple-100">
                Tell us about your brief, timeline, and vision. We&apos;ll help you bring it to life.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
              >
                Start a conversation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Next work / footer */}
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
                href="/work"
                className="Button Button--primary"
              >
                View more work
              </Link>
              <Link
                href="https://www.linkedin.com/in/sombo09/"
                target="_blank"
                rel="noopener noreferrer"
                className="Button Button--secondary"
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
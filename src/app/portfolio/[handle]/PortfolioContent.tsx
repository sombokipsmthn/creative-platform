'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/Footer';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ProjectData {
  id: string;
  name: string;
  slug: string | null;
  shortDescription: string | null;
  description: string | null;
  category: string | null;
  year: string | null;
  location: string | null;
  role: string | null;
  services: string[];
  disciplines: string[];
  collaborators: string[];
  featured: boolean;
  publishedAt: Date | null;
  clientName: string | null;
  clientCompany: string | null;
  storyOverview: string | null;
  storyChallenge: string | null;
  storyApproach: string | null;
  storyOutcome: string | null;
  storyCredits: string | null;
  cover: {
    id: string;
    filename: string;
    displayUrl: string;
    thumbnailUrl: string;
    mimeType: string | null;
    width: number | null;
    height: number | null;
    altText: string | null;
    caption: string | null;
    sortOrder: number;
  } | null;
  media: Array<{
    id: string;
    filename: string;
    displayUrl: string;
    thumbnailUrl: string;
    mimeType: string | null;
    width: number | null;
    height: number | null;
    altText: string | null;
    caption: string | null;
    sortOrder: number;
  }>;
}

interface CreatorData {
  id: string;
  handle: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  headline: string | null;
  contactEmail: string | null;
  socialLinks: {
    website?: string;
    instagram?: string;
    linkedin?: string;
  };
}

interface PortfolioContentProps {
  user: CreatorData;
  profile: CreatorData;
  portfolio: CreatorData;
  projects: ProjectData[];
}

export function PortfolioContent({
  user,
  profile,
  portfolio,
  projects,
}: PortfolioContentProps) {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | string>('All');

  const headline = portfolio?.headline || `Portfolio of ${user.name || 'Creator'}`;
  const profileBio = profile?.bio || '';
  const avatarUrl = profile?.avatarUrl;
  const website = profile?.website;

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter((p) => p.category === activeFilter);

  const categories = ['Photography', 'Videography', 'Branding', 'Design'];

  return (
    <div className="ui-page selection:bg-[var(--color-accent)] selection:text-white transition-colors duration-300">
      <Header />

      {/* Hero Section */}
      <section className="ui-shell relative pt-36 pb-20 text-center space-y-8">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-[var(--color-accent)]/15 blur-3xl pointer-events-none rounded-full" />

        <p className="ui-eyebrow">
          PUBLIC PORTFOLIO
        </p>

        <h1 className="ui-page-title text-4xl max-w-4xl mx-auto">
          {headline}
        </h1>

        <p className="ui-body max-w-2xl mx-auto leading-relaxed">
          {profileBio || 'A curated collection of commercial photography, brand films, and creative projects.'}
        </p>

        {avatarUrl && (
          <Image
            src={avatarUrl}
            alt={user.name || 'Creator'}
            className="h-20 w-20 rounded-full object-cover mx-auto"
            width={800}
            height={800}
          />
        )}

        <div className="flex items-center justify-center gap-4">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] hover:underline text-sm font-medium"
            >
              {website}
            </a>
          )}
          <ThemeToggle />
        </div>
      </section>

      {/* About Section */}
      {profileBio && (
        <section className="ui-shell py-12 border-y">
          <h2 className="ui-section-title text-2xl mb-4 text-center">
            About
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="ui-body leading-relaxed text-zinc-600 dark:text-zinc-400">
              {profileBio}
            </p>
          </div>
        </section>
      )}

      {/* Selected Work Section */}
      <section className="ui-shell py-12">
        <h2 className="ui-section-title text-2xl mb-4 text-center">
          Selected Work
        </h2>
        <p className="ui-meta text-center mb-8">
          A curated selection of published projects, featuring photography, video, and mixed-media work.
        </p>

        {/* Category Filters */}
        {projects.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveFilter('All')}
              className={activeFilter === 'All' ? 'ring-2 ring-[var(--color-accent)]' : ''}
            >
              All ({projects.length})
            </Button>
            {categories.map((category) => {
              const categoryProjects = projects.filter(
                (p) => p.category === category
              );
              if (categoryProjects.length === 0) return null;
              return (
                <Button
                  key={category}
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveFilter(category)}
                  className={activeFilter === category ? 'ring-2 ring-[var(--color-accent)]' : ''}
                >
                  {category} ({categoryProjects.length})
                </Button>
              );
            })}
          </div>
        )}

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="group cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => setExpandedProject(project.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setExpandedProject(project.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <Image
                src={project.cover?.displayUrl || '/placeholder-hero-1.svg'}
                alt={project.cover?.altText || project.name}
                width={1200}
                height={800}
                className="aspect-[3/2] w-full object-cover"
              />
              <CardContent className="space-y-1 p-4">
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {project.category || 'Creative'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Expanded Project Detail */}
        {expandedProject && projects.some((p) => p.id === expandedProject) && (
          <div className="mt-12">
            {(() => {
              const project = projects.find((p) => p.id === expandedProject)!;
              return (
                <Card className="max-w-4xl mx-auto">
                  <Image
                    src={project.cover?.displayUrl || '/placeholder-hero-1.svg'}
                    alt={project.cover?.altText || project.name}
                    width={1200}
                    height={800}
                    className="aspect-[3/2] w-full object-cover"
                  />
                  <CardContent className="space-y-1 p-4">
                    <h3 className="text-xl font-medium">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.category || 'Creative'}
                    </p>
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        )}
      </section>

      {/* Contact Section */}
      {(website || profile?.location) && (
        <section className="ui-shell py-12 border-t">
          <h2 className="ui-section-title text-2xl mb-8 text-center">
            Contact
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] hover:underline"
              >
                {website}
              </a>
            )}
            {profile?.location && (
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 1L3 5v11c0 1 1 2 2 2h3l5-6 5 6h3c1 0 2-1 2-2V5l-9-4z" />
                </svg>
                <span>{profile.location}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer with Social Links */}
      <Footer />
    </div>
  );
}
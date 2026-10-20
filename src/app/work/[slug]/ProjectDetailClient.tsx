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
    <section className="">
      <h2 className="ui-eyebrow">
        {title}
      </h2>
      <div className="">
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
    <div className="">
      <Header />

      {/* Back to portfolio */}
      <div className="ui-shell">
        <Link
          href="/work"
          className=""
        >
          <ArrowLeft className="" />
          All Work
        </Link>
      </div>

      {/* Hero */}
      <section className="">
        <div className="">
          <div className="">
            <div className="">
              {project.category && (
                <span className="">
                  {project.category}
                </span>
              )}
              {project.year && <span className="">{project.year}</span>}
            </div>

            <h1 className="">
              {project.name}
            </h1>

            {(project.short_description || project.description) && (
              <p className="">
                {project.short_description || project.description}
              </p>
            )}
          </div>

          {/* Metadata strip */}
          <div className="">
            {clientName !== 'Confidential Client' && (
              <div>
                <p className="">Client</p>
                <p className="">{clientName}</p>
              </div>
            )}
            {project.location && (
              <div>
                <p className="">Location</p>
                <p className="">
                  <MapPin className="" />
                  {project.location}
                </p>
              </div>
            )}
            {project.role && (
              <div>
                <p className="">Role</p>
                <p className="">{project.role}</p>
              </div>
            )}
            {project.year && (
              <div>
                <p className="">Year</p>
                <p className="">{project.year}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Primary visual */}
      {coverImage && (
        <section className="">
          <div className="">
            <Image
              src={resolveImage(coverImage.display_url)}
              alt={coverImage.alt_text || project.name}
              fill
              priority
              className=""
              unoptimized
            />
          </div>
          {coverImage.caption && (
            <p className="">{coverImage.caption}</p>
          )}
        </section>
      )}

      {/* Story */}
      {storySections.length > 0 && (
        <section className="">
          {storySections.map((section) => (
            <StorySection key={section.title} title={section.title} body={section.body} />
          ))}
        </section>
      )}

      {/* Services & disciplines */}
      {(project.services?.length || project.disciplines?.length || project.collaborators?.length) && (
        <section className="">
          <div className="">
            {project.services && project.services.length > 0 && (
              <div>
                <p className="">Services</p>
                <ul className="">
                  {project.services.map((service) => (
                    <li key={service} className="">{service}</li>
                  ))}
                </ul>
              </div>
            )}
            {project.disciplines && project.disciplines.length > 0 && (
              <div>
                <p className="">Disciplines</p>
                <ul className="">
                  {project.disciplines.map((discipline) => (
                    <li key={discipline} className="">{discipline}</li>
                  ))}
                </ul>
              </div>
            )}
            {project.collaborators && project.collaborators.length > 0 && (
              <div>
                <p className="">Collaborators</p>
                <ul className="">
                  {project.collaborators.map((collaborator) => (
                    <li key={collaborator} className="">{collaborator}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Supporting media */}
      {project.media.length > 1 && (
        <section className="">
          <div className="">
            {project.media.map((media) => {
              if (media.is_cover || media === coverImage) return null;
              return (
                <figure key={media.id} className="">
                  <div className="">
                    <Image
                      src={resolveImage(media.display_url)}
                      alt={media.alt_text || project.name}
                      fill
                      className=""
                      unoptimized
                    />
                  </div>
                  {media.caption && (
                    <figcaption className="">{media.caption}</figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="">
        <div className="">
          <div className="">
            <div>
              <p className="">Let&apos;s work together</p>
              <h2 className="">Have a project in mind?</h2>
              <p className="">
                Tell us about your brief, timeline, and vision. We&apos;ll help you bring it to life.
              </p>
            </div>
            <div className="">
              <Link
                href="/contact"
                className=""
              >
                Start a conversation
                <ArrowRight className="" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Next work / footer */}
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

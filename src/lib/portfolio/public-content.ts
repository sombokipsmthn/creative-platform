/**
 * Public portfolio content access layer.
 *
 * Server-side only. Every query in this module is scoped to a single creator
 * and to records that are explicitly published for public display.
 *
 * Publication rules enforced here:
 *  - A project is public only when `visibility = 'public'` AND `published_at IS NOT NULL`.
 *  - Project media is public only when `is_hidden = false`.
 *  - A gallery is public only when it is `published`, has no `access_pin`, has not
 *    expired, and is linked to a public project owned by the same creator.
 *
 * Nothing in this module exposes financial, invoicing, licensing, contract or
 * CRM fields.
 */

import { and, asc, desc, eq, isNotNull, isNull, or, sql } from 'drizzle-orm';

import { db } from '@/db';
import {
  clients,
  creatorPortfolios,
  creatorProfiles,
  galleries,
  galleryPhotos,
  projectMedia,
  projects,
  users,
} from '@/db/schema';

/* ─── Public shapes ──────────────────────────────────── */

export interface PublicSocialLinks {
  website?: string;
  instagram?: string;
  linkedin?: string;
}

export interface PublicCreatorIdentity {
  id: string;
  handle: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  headline: string | null;
  contactEmail: string | null;
  socialLinks: PublicSocialLinks;
}

export interface PublicProjectMedia {
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
}

export interface PublicProject {
  id: string;
  name: string;
  slug: string;
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
  cover: PublicProjectMedia | null;
  media: PublicProjectMedia[];
}

export interface PublicGallery {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  clientName: string | null;
  clientCompany: string | null;
  coverThumbnailUrl: string | null;
  photoCount: number;
}

/* ─── Helpers ─────────────────────────────────────────── */

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];
}

function toSocialLinks(value: unknown): PublicSocialLinks {
  if (!value || typeof value !== 'object') {
    return {};
  }
  const record = value as Record<string, unknown>;
  const links: PublicSocialLinks = {};
  for (const key of ['website', 'instagram', 'linkedin'] as const) {
    const entry = record[key];
    if (typeof entry === 'string' && entry.trim()) {
      links[key] = entry.trim();
    }
  }
  return links;
}

function toDisplayUrl(url: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  // Only ever surface a public asset URL. Anything that looks like a private
  // storage path (a bare path rather than a URL) is rejected.
  if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('/')) {
    return null;
  }
  return trimmed;
}

/* ─── Identity ────────────────────────────────────────── */

/**
 * Resolves a public creator by handle. Returns null when the handle is unknown
 * so callers can produce a not-found response.
 */
export async function getPublicCreatorByHandle(
  handle: string,
): Promise<PublicCreatorIdentity | null> {
  const normalized = handle.trim().toLowerCase();
  if (!normalized) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.handle, normalized),
  });
  if (!user) return null;

  const [profile, portfolio] = await Promise.all([
    db.query.creatorProfiles.findFirst({
      where: eq(creatorProfiles.userId, user.id),
    }),
    db.query.creatorPortfolios.findFirst({
      where: eq(creatorPortfolios.userId, user.id),
    }),
  ]);

  return {
    id: user.id,
    handle: user.handle ?? normalized,
    name: user.name,
    avatarUrl: toDisplayUrl(profile?.avatarUrl ?? user.image ?? null),
    bio: profile?.bio ?? null,
    website: profile?.website ?? null,
    location: profile?.location ?? null,
    headline: portfolio?.headline ?? null,
    contactEmail: portfolio?.contactEmail ?? null,
    socialLinks: toSocialLinks(portfolio?.socialLinks),
  };
}

/* ─── Projects ────────────────────────────────────────── */

const projectSelection = {
  id: projects.id,
  name: projects.name,
  slug: projects.slug,
  shortDescription: projects.shortDescription,
  description: projects.description,
  category: projects.category,
  year: projects.year,
  location: projects.location,
  role: projects.role,
  services: projects.services,
  disciplines: projects.disciplines,
  collaborators: projects.collaborators,
  featured: projects.featured,
  publishedAt: projects.publishedAt,
  storyOverview: projects.storyOverview,
  storyChallenge: projects.storyChallenge,
  storyApproach: projects.storyApproach,
  storyOutcome: projects.storyOutcome,
  storyCredits: projects.storyCredits,
  clientName: clients.name,
  clientCompany: clients.company,
  coverId: projectMedia.id,
  coverFilename: projectMedia.filename,
  coverDisplayUrl: projectMedia.displayUrl,
  coverThumbnailUrl: projectMedia.thumbnailUrl,
  coverMimeType: projectMedia.mimeType,
  coverWidth: projectMedia.width,
  coverHeight: projectMedia.height,
  coverAltText: projectMedia.altText,
  coverCaption: projectMedia.caption,
} as const;

type ProjectRow = Awaited<ReturnType<typeof selectPublicProjectRows>>[number];

async function selectPublicProjectRows(creatorId: string) {
  return db
    .select(projectSelection)
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .leftJoin(projectMedia, eq(projects.coverMediaId, projectMedia.id))
    .where(
      and(
        eq(projects.creatorId, creatorId),
        eq(projects.visibility, 'public'),
        isNotNull(projects.publishedAt),
        isNotNull(projects.slug),
      ),
    )
    .orderBy(
      asc(sql`CASE WHEN ${projects.featured} THEN 0 ELSE 1 END`),
      desc(projects.publishedAt),
      desc(projects.createdAt),
    );
}

function rowToPublicProject(row: ProjectRow): PublicProject {
  const cover = row.coverId
    ? {
        id: row.coverId,
        filename: row.coverFilename ?? '',
        displayUrl: toDisplayUrl(row.coverDisplayUrl) ?? '',
        thumbnailUrl: toDisplayUrl(row.coverThumbnailUrl) ?? '',
        mimeType: row.coverMimeType ?? null,
        width: row.coverWidth ?? null,
        height: row.coverHeight ?? null,
        altText: row.coverAltText ?? null,
        caption: row.coverCaption ?? null,
        sortOrder: 0,
      }
    : null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug as string,
    shortDescription: row.shortDescription ?? null,
    description: row.description ?? null,
    category: row.category ?? null,
    year: row.year ?? null,
    location: row.location ?? null,
    role: row.role ?? null,
    services: toStringArray(row.services),
    disciplines: toStringArray(row.disciplines),
    collaborators: toStringArray(row.collaborators),
    featured: row.featured,
    publishedAt: row.publishedAt ?? null,
    clientName: row.clientName ?? null,
    clientCompany: row.clientCompany ?? null,
    storyOverview: row.storyOverview ?? null,
    storyChallenge: row.storyChallenge ?? null,
    storyApproach: row.storyApproach ?? null,
    storyOutcome: row.storyOutcome ?? null,
    storyCredits: row.storyCredits ?? null,
    cover,
    media: [],
  };
}

/**
 * All publicly visible projects for a creator, ordered featured-first then by
 * most recently published.
 */
export async function getPublicProjects(creatorId: string): Promise<PublicProject[]> {
  const rows = await selectPublicProjectRows(creatorId);
  return rows.map(rowToPublicProject);
}

/**
 * A single public project, scoped to a creator and a slug. Returns null for
 * unknown slugs, unpublished projects and projects owned by another creator.
 */
export async function getPublicProject(
  creatorId: string,
  slug: string,
): Promise<PublicProject | null> {
  const rows = await selectPublicProjectRows(creatorId);
  const row = rows.find((entry) => entry.slug === slug);
  if (!row) return null;

  const project = rowToPublicProject(row);
  const media = await db
    .select({
      id: projectMedia.id,
      filename: projectMedia.filename,
      displayUrl: projectMedia.displayUrl,
      thumbnailUrl: projectMedia.thumbnailUrl,
      mimeType: projectMedia.mimeType,
      width: projectMedia.width,
      height: projectMedia.height,
      altText: projectMedia.altText,
      caption: projectMedia.caption,
      sortOrder: projectMedia.sortOrder,
    })
    .from(projectMedia)
    .where(
      and(
        eq(projectMedia.projectId, project.id),
        eq(projectMedia.creatorId, creatorId),
        eq(projectMedia.isHidden, false),
      ),
    )
    .orderBy(asc(projectMedia.sortOrder), asc(projectMedia.createdAt));

  project.media = media
    .map((entry) => ({
      id: entry.id,
      filename: entry.filename,
      displayUrl: toDisplayUrl(entry.displayUrl) ?? '',
      thumbnailUrl: toDisplayUrl(entry.thumbnailUrl) ?? '',
      mimeType: entry.mimeType ?? null,
      width: entry.width ?? null,
      height: entry.height ?? null,
      altText: entry.altText ?? null,
      caption: entry.caption ?? null,
      sortOrder: entry.sortOrder,
    }))
    .filter((entry) => entry.displayUrl !== '');

  return project;
}

/**
 * Other public projects for the same creator, used for "related work".
 */
export async function getRelatedPublicProjects(
  creatorId: string,
  excludeProjectId: string,
  limit = 3,
): Promise<PublicProject[]> {
  const rows = await selectPublicProjectRows(creatorId);
  return rows
    .filter((row) => row.id !== excludeProjectId)
    .slice(0, limit)
    .map(rowToPublicProject);
}

/* ─── Galleries ───────────────────────────────────────── */

/**
 * Galleries that are eligible for public portfolio display.
 *
 * A gallery qualifies only when every one of these is true:
 *  - it belongs to the creator,
 *  - its status is `published`,
 *  - it has no access PIN (PIN-protected client deliveries are never public),
 *  - it has not expired,
 *  - it is linked to a project that is itself public and published.
 */
export async function getPublicGalleries(creatorId: string): Promise<PublicGallery[]> {
  const rows = await db
    .select({
      id: galleries.id,
      title: galleries.title,
      slug: galleries.slug,
      description: galleries.description,
      category: galleries.category,
      clientName: clients.name,
      clientCompany: clients.company,
      photoCount: sql<number>`(
        SELECT COUNT(*)::int FROM ${galleryPhotos}
        WHERE ${galleryPhotos.galleryId} = ${galleries.id}
          AND ${galleryPhotos.isHidden} = false
      )`,
      coverThumbnailUrl: sql<string | null>`(
        SELECT ${galleryPhotos.thumbnailUrl} FROM ${galleryPhotos}
        WHERE ${galleryPhotos.galleryId} = ${galleries.id}
          AND ${galleryPhotos.isHidden} = false
        ORDER BY ${galleryPhotos.sortOrder} ASC, ${galleryPhotos.createdAt} ASC
        LIMIT 1
      )`,
    })
    .from(galleries)
    .innerJoin(projects, eq(galleries.projectId, projects.id))
    .leftJoin(clients, eq(galleries.clientId, clients.id))
    .where(
      and(
        eq(galleries.creatorId, creatorId),
        eq(galleries.status, 'published'),
        isNull(galleries.accessPin),
        isNull(galleries.expiresAt),
        eq(projects.creatorId, creatorId),
        eq(projects.visibility, 'public'),
        isNotNull(projects.publishedAt),
      ),
    )
    .orderBy(asc(galleries.createdAt));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? null,
    category: row.category ?? null,
    clientName: row.clientName ?? null,
    clientCompany: row.clientCompany ?? null,
    coverThumbnailUrl: toDisplayUrl(row.coverThumbnailUrl),
    photoCount: Number(row.photoCount ?? 0),
  }));
}

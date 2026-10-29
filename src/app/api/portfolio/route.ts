import { NextResponse } from "next/server";
import { and, asc, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { creatorPortfolios, creatorProfiles, projectMedia, projects, users } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";
import { getCuratedGalleryMedia } from "@/lib/portfolio/gallery-curation";

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : null;

const ids = (value: unknown) =>
  Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id)))].slice(0, 24)
    : [];

async function readPortfolio(userId: string) {
  const [user, profile, portfolio, eligibleProjects] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, userId) }),
    db.query.creatorPortfolios.findFirst({ where: eq(creatorPortfolios.userId, userId) }),
    db.select().from(projects).where(and(
      eq(projects.creatorId, userId),
      eq(projects.visibility, "public"),
      eq(projects.status, "published"),
      isNotNull(projects.publishedAt),
    )),
  ]);

  const projectIds = eligibleProjects.map((project) => project.id);
  const media = projectIds.length
    ? await db.select().from(projectMedia)
        .where(and(
          eq(projectMedia.creatorId, userId),
          inArray(projectMedia.projectId, projectIds),
          eq(projectMedia.isHidden, false),
        ))
        .orderBy(asc(projectMedia.sortOrder), asc(projectMedia.createdAt))
    : [];
  const mediaByProject = new Map<string, typeof media>();
  for (const item of media) {
    mediaByProject.set(item.projectId, [...(mediaByProject.get(item.projectId) ?? []), item]);
  }
  const projectsWithMedia = eligibleProjects.map((project) => ({
    ...project,
    media: mediaByProject.get(project.id) ?? [],
  }));

  const galleryMedia = await getCuratedGalleryMedia(userId);
  const galleryGroups = galleryMedia.reduce((groups, entry) => {
    const current = groups.get(entry.gallery.id) ?? {
      id: `gallery-${entry.gallery.id}`,
      name: entry.gallery.title,
      description: entry.gallery.description,
      shortDescription: entry.gallery.description,
      category: entry.gallery.category,
      year: null,
      location: null,
      visibility: "public",
      publishedAt: new Date(),
      media: [] as Array<Record<string, unknown>>,
      galleryId: entry.gallery.id,
      mediaCount: 0,
    };
    current.mediaCount += 1;
    current.media.push({
      ...entry.photo,
      projectId: current.id,
      isHidden: false,
      isCover: false,
    });
    groups.set(entry.gallery.id, current);
    return groups;
  }, new Map<string, {
    id: string;
    name: string;
    description: string | null;
    shortDescription: string | null;
    category: string | null;
    year: null;
    location: null;
    visibility: string;
    publishedAt: Date;
    media: Array<Record<string, unknown>>;
    galleryId: string;
    mediaCount: number;
  }>());
  const galleryPreviewProjects = Array.from(galleryGroups.values()).map(({ mediaCount: _mediaCount, galleryId: _galleryId, ...project }) => project);
  const gallerySelections = Array.from(galleryGroups.values()).map((gallery) => ({
    id: gallery.galleryId,
    title: gallery.name,
    category: gallery.category,
    mediaCount: gallery.mediaCount,
  }));

  const selectedProjectIds = Array.isArray(portfolio?.selectedProjectIds)
    ? portfolio.selectedProjectIds.filter((id): id is string => typeof id === "string")
    : [];
  const hasSelectedPublishedProject = projectsWithMedia.some(
    (project) => selectedProjectIds.includes(project.id),
  );

  return {
    user,
    profile,
    portfolio,
    projects: projectsWithMedia,
    gallerySelections,
    galleryPreviewProjects,
    hasPublishedContent: galleryMedia.length > 0 || hasSelectedPublishedProject,
  };
}

export async function GET(request: Request) {
  return withCreatorApi(request, async (_request, user) =>
    NextResponse.json(await readPortfolio(user.id)),
  );
}

export async function PATCH(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    const body = await request.json().catch(() => null);
    const selectedProjectIds = ids(body?.selectedProjectIds);
    const eligible = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(
        eq(projects.creatorId, user.id),
        eq(projects.visibility, "public"),
        eq(projects.status, "published"),
        isNotNull(projects.publishedAt),
      ));
    const eligibleIds = new Set(eligible.map((project) => project.id));
    const invalid = selectedProjectIds.some((id) => !eligibleIds.has(id));

    if (invalid) {
      return NextResponse.json(
        { error: "Only your published public projects can be selected." },
        { status: 400 },
      );
    }

    const isPublished = body?.isPublished === true;
    const galleryMedia = await getCuratedGalleryMedia(user.id);

    if (isPublished && selectedProjectIds.length === 0 && galleryMedia.length === 0) {
      return NextResponse.json(
        { error: "Select gallery content or a published public project before publishing." },
        { status: 400 },
      );
    }

    const values = {
      userId: user.id,
      headline: clean(body?.headline, 160),
      contactEmail: clean(body?.contactEmail, 254),
      socialLinks: {
        website: clean(body?.socialLinks?.website, 300),
        instagram: clean(body?.socialLinks?.instagram, 300),
        linkedin: clean(body?.socialLinks?.linkedin, 300),
      },
      selectedProjectIds,
      layout: body?.layout === "grid" ? "grid" : "editorial",
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      updatedAt: new Date(),
    };

    const [portfolio] = await db
      .insert(creatorPortfolios)
      .values(values)
      .onConflictDoUpdate({ target: creatorPortfolios.userId, set: values })
      .returning();

    return NextResponse.json({ portfolio });
  });
}

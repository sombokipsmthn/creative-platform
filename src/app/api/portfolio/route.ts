import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { creatorPortfolios, creatorProfiles, projectMedia, projects, users } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : null;
const ids = (value: unknown) => Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id)))].slice(0, 24) : [];

async function readPortfolio(userId: string) {
  const [user, profile, portfolio, eligible] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.creatorProfiles.findFirst({ where: eq(creatorProfiles.userId, userId) }),
    db.query.creatorPortfolios.findFirst({ where: eq(creatorPortfolios.userId, userId) }),
    db.select({ id: projects.id, name: projects.name, slug: projects.slug, visibility: projects.visibility, publishedAt: projects.publishedAt, coverMediaId: projects.coverMediaId })
      .from(projects).where(eq(projects.creatorId, userId)),
  ]);
  return { user, profile, portfolio, projects: eligible };
}

export async function GET(request: Request) {
  return withCreatorApi(request, async (_request, user) => NextResponse.json(await readPortfolio(user.id)));
}

export async function PATCH(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    const body = await request.json().catch(() => null);
    const selectedProjectIds = ids(body?.selectedProjectIds);
    const eligible = await db.select({ id: projects.id }).from(projects).where(and(eq(projects.creatorId, user.id), eq(projects.visibility, "public")));
    const eligibleIds = new Set(eligible.map((project) => project.id));
    const invalid = selectedProjectIds.some((id) => !eligibleIds.has(id));
    if (invalid) return NextResponse.json({ error: "Only your public projects can be selected." }, { status: 400 });
    const isPublished = body?.isPublished === true;
    if (isPublished && selectedProjectIds.length === 0) return NextResponse.json({ error: "Select at least one public project before publishing." }, { status: 400 });
    const values = {
      userId: user.id,
      headline: clean(body?.headline, 160),
      contactEmail: clean(body?.contactEmail, 254),
      socialLinks: { website: clean(body?.socialLinks?.website, 300), instagram: clean(body?.socialLinks?.instagram, 300), linkedin: clean(body?.socialLinks?.linkedin, 300) },
      selectedProjectIds,
      layout: body?.layout === "grid" ? "grid" : "editorial",
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      updatedAt: new Date(),
    };
    const [portfolio] = await db.insert(creatorPortfolios).values(values).onConflictDoUpdate({ target: creatorPortfolios.userId, set: values }).returning();
    return NextResponse.json({ portfolio });
  });
}

import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";

export async function GET() {
  try {
    const result = await db
      .select({
        id: projects.id,
        name: projects.name,
        shortDescription: projects.shortDescription,
        slug: projects.slug,
        category: projects.category,
        year: projects.year,
        location: projects.location,
        featured: projects.featured,
        publishedAt: projects.publishedAt,
        visibility: projects.visibility,
        clientName: clients.name,
        clientCompany: clients.company,
        mediaId: projectMedia.id,
        coverDisplayUrl: projectMedia.displayUrl,
        coverThumbnailUrl: projectMedia.thumbnailUrl,
        coverAltText: projectMedia.altText,
        coverCaption: projectMedia.caption,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .leftJoin(projectMedia, eq(projects.coverMediaId, projectMedia.id))
      .where(
        and(
          eq(projects.visibility, 'public'),
          notNull(projects.publishedAt)
        )
      )
      .orderBy(
        asc(sql`CASE WHEN ${projects.featured} THEN 0 ELSE 1 END`),
        desc(projects.publishedAt),
        desc(projects.createdAt)
      );

    return NextResponse.json({ projects: result });
  } catch (error) {
    console.error("GET /api/public/projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects." }, { status: 500 });
  }
}
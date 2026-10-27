import { NextResponse } from "next/server";
import { sql, eq, desc } from "drizzle-orm";

import { db } from "@/db";
import { withCreatorApi } from "@/lib/api/route-boundaries";
import { galleries, clients } from "@/db/schema";

function createSlug(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${base || "gallery"}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET(request: Request) {
  return withCreatorApi(request, async (_request, creator) => {
    console.log('GET /api/galleries: Fetching galleries for creator:', creator.id);

    const result = await db
      .select({
        id: galleries.id,
        creatorId: galleries.creatorId,
        clientId: galleries.clientId,
        projectId: galleries.projectId,
        title: galleries.title,
        description: galleries.description,
        category: galleries.category,
        slug: galleries.slug,
        accessPin: galleries.accessPin,
        status: galleries.status,
        coverPhotoId: galleries.coverPhotoId,
        publishedAt: galleries.publishedAt,
        createdAt: galleries.createdAt,
        updatedAt: galleries.updatedAt,
        clientName: clients.name,
        clientCompany: clients.company,
        coverUrl: sql<string>`(SELECT p.display_url FROM gallery_photos p WHERE p.gallery_id = ${galleries.id} AND p.is_hidden = false ORDER BY p.sort_order ASC, p.created_at ASC LIMIT 1)`,
        photoCount: sql<number>`(SELECT COUNT(*) FROM gallery_photos p WHERE p.gallery_id = ${galleries.id} AND p.is_hidden = false)`,
        collectionsCount: sql<number>`(SELECT COUNT(*) FROM gallery_collections col WHERE col.gallery_id = ${galleries.id})`,
        favoritesCount: sql<number>`(SELECT COUNT(*) FROM gallery_photo_actions a WHERE a.gallery_id = ${galleries.id} AND a.is_favorite = true)`,
        selectionsCount: sql<number>`(SELECT COUNT(*) FROM gallery_photo_actions a WHERE a.gallery_id = ${galleries.id} AND a.is_selected = true)`,
        commentsCount: sql<number>`(SELECT COUNT(*) FROM gallery_comments comm WHERE comm.gallery_id = ${galleries.id})`,
        downloadsCount: sql<number>`(SELECT COUNT(*) FROM gallery_downloads d WHERE d.gallery_id = ${galleries.id})`,
        viewsCount: sql<number>`(SELECT COUNT(*) FROM gallery_access_sessions s WHERE s.gallery_id = ${galleries.id})`,
      })
      .from(galleries)
      .leftJoin(clients, eq(galleries.clientId, clients.id))
      .where(eq(galleries.creatorId, creator.id))
      .orderBy(desc(galleries.createdAt));

    console.log('GET /api/galleries: Query returned', result.length, 'galleries');
    return { galleries: result };
  });
}

export async function POST(request: Request) {
  return withCreatorApi(request, async (request, creator) => {
    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    if (!title) return NextResponse.json({ error: "Gallery title is required." }, { status: 400 });

    const slug = createSlug(title);
    const clientId = typeof body?.clientId === "string" && body.clientId.trim() ? body.clientId.trim() : null;
    const projectId = typeof body?.projectId === "string" && body.projectId.trim() ? body.projectId.trim() : null;
    const description = typeof body?.description === "string" && body.description.trim() ? body.description.trim() : null;
    const category = typeof body?.category === "string" && body.category.trim() ? body.category.trim() : null;
    const accessPin = typeof body?.accessPin === "string" && body.accessPin.trim() ? body.accessPin.trim() : null;
    const allowDownloads = body?.allowDownloads !== false;
    const allowFavorites = body?.allowFavorites !== false;
    const allowSelections = body?.allowSelections !== false;

    const galleryResult = await db
      .insert(galleries)
      .values({
        creatorId: creator.id,
        clientId: clientId ?? null,
        projectId: projectId ?? null,
        title: title,
        description: description ?? null,
        category: category ?? null,
        slug: slug,
        accessPin: accessPin ?? null,
        status: 'draft',
        allowDownloads: allowDownloads,
        allowFavorites: allowFavorites,
        allowSelections: allowSelections,
      })
      .returning();

    const gallery = galleryResult[0];
    if (!gallery) return NextResponse.json({ error: "Gallery could not be created." }, { status: 500 });

    await db.execute(sql`
      INSERT INTO gallery_collections (gallery_id, title, sort_order)
      VALUES (${gallery.id}, 'All Photos', 0)
    `);

    const defaultPreset = await db.execute(sql`
      SELECT enabled, text, position, opacity, font_size
      FROM gallery_watermark_presets
      WHERE creator_id = ${creator.id}
      ORDER BY updated_at DESC, created_at ASC
      LIMIT 1
    `);
    const watermark = defaultPreset.rows[0];
    await db.execute(sql`
      INSERT INTO gallery_watermarks (gallery_id, enabled, text, position, opacity, font_size)
      VALUES (${gallery.id}, ${watermark?.enabled !== false}, ${String(watermark?.text || "KIPSMTHN")}, ${String(watermark?.position || "bottom-right")}, ${Number(watermark?.opacity ?? 55)}, ${Number(watermark?.font_size ?? 42)})
      ON CONFLICT (gallery_id) DO NOTHING
    `);

    await db.execute(sql`
      INSERT INTO gallery_download_presets (
        gallery_id,
        name,
        variant,
        max_width,
        quality,
        format,
        include_watermark
      )
      VALUES (${gallery.id}, 'Web Delivery', 'display', 2400, 88, 'jpg', false)
    `);

    return NextResponse.json({ gallery }, { status: 201 });
  });
}

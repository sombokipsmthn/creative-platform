import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getOrCreateLocalUser } from "@/lib/auth/get-or-create-local-user";

type Context = { params: Promise<{ id: string }> };

async function getCreator() {
  const { userId } = await auth();
  if (!userId) return null;
  return getOrCreateLocalUser(userId);
}

export async function GET(_request: Request, context: Context) {
  try {
    const creator = await getCreator();
    if (!creator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const galleryResult = await db.execute(sql`
      SELECT
        g.*,
        c.name AS client_name,
        c.email AS client_email,
        c.company AS client_company,
        p.name AS project_name,
        COALESCE(
          cp.display_url,
          (
            SELECT photo.display_url
            FROM gallery_photos photo
            WHERE photo.gallery_id = g.id
              AND photo.is_hidden = false
            ORDER BY photo.sort_order ASC, photo.created_at ASC
            LIMIT 1
          )
        ) AS cover_url
      FROM galleries g
      LEFT JOIN clients c ON c.id = g.client_id
      LEFT JOIN projects p ON p.id = g.project_id
      LEFT JOIN gallery_photos cp ON cp.id = g.cover_photo_id
      WHERE g.id = ${id}
        AND g.creator_id = ${creator.id}
      LIMIT 1
    `);

    const gallery = galleryResult.rows[0];
    if (!gallery) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });

    const collections = await db.execute(sql`
      SELECT c.*,
        (
          SELECT COUNT(*)::int FROM gallery_photos p WHERE p.collection_id = c.id
        ) AS photo_count
      FROM gallery_collections c
      WHERE c.gallery_id = ${id}
      ORDER BY c.sort_order ASC, c.created_at ASC
    `);

    const photos = await db.execute(sql`
      SELECT p.*, c.title AS collection_title
      FROM gallery_photos p
      LEFT JOIN gallery_collections c ON c.id = p.collection_id
      WHERE p.gallery_id = ${id}
      ORDER BY p.sort_order ASC, p.created_at ASC
    `);

    const approval = await db.execute(sql`
      SELECT * FROM gallery_approvals WHERE gallery_id = ${id} LIMIT 1
    `);

    const presets = await db.execute(sql`
      SELECT * FROM gallery_download_presets
      WHERE gallery_id = ${id}
      ORDER BY created_at ASC
    `);

    const watermark = await db.execute(sql`
      SELECT * FROM gallery_watermarks WHERE gallery_id = ${id} LIMIT 1
    `);

    return NextResponse.json({
      gallery,
      collections: collections.rows,
      photos: photos.rows,
      approval: approval.rows[0] || null,
      presets: presets.rows,
      watermark: watermark.rows[0] || null,
    });
  } catch (error) {
    console.error("GET /api/galleries/[id]", error);
    return NextResponse.json({ error: "Unable to load gallery." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const creator = await getCreator();
    if (!creator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const body = await request.json();

    const currentGallery = await db.execute(sql`
      SELECT * FROM galleries
      WHERE id = ${id} AND creator_id = ${creator.id}
      LIMIT 1
    `);

    if (!currentGallery.rows[0]) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });

    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : undefined;
    const description = body.description !== undefined ? body.description : undefined;
    const category = body.category !== undefined ? body.category : undefined;
    const clientId = body.clientId !== undefined ? body.clientId || null : undefined;
    const projectId = body.projectId !== undefined ? body.projectId || null : undefined;
    const slug = typeof body.slug === "string" && body.slug.trim()
      ? body.slug.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, "-")
      : undefined;
    const accessPin = body.accessPin !== undefined ? body.accessPin : undefined;
    const status = body.status === "published" || body.status === "draft" ? body.status : undefined;
    const coverPhotoId = body.coverPhotoId !== undefined ? body.coverPhotoId || null : undefined;
    const allowDownloads = body.allowDownloads !== undefined ? Boolean(body.allowDownloads) : undefined;
    const allowFavorites = body.allowFavorites !== undefined ? Boolean(body.allowFavorites) : undefined;
    const allowSelections = body.allowSelections !== undefined ? Boolean(body.allowSelections) : undefined;
    const expiresAt = body.expiresAt === undefined
      ? undefined
      : body.expiresAt
        ? new Date(body.expiresAt)
        : null;
    const expiryBehavior = body.expiryBehavior === "delete" || body.expiryBehavior === "hide"
      ? body.expiryBehavior
      : undefined;

    if (expiresAt instanceof Date && Number.isNaN(expiresAt.getTime())) {
      return NextResponse.json({ error: "Invalid expiry date." }, { status: 400 });
    }

    const publishedAt = status === "published"
      ? sql`COALESCE(published_at, now())`
      : status === "draft"
        ? sql`NULL`
        : sql`published_at`;

    const result = await db.execute(sql`
      UPDATE galleries
      SET
        title = COALESCE(${title ?? null}, title),
        description = ${description !== undefined ? description : sql`description`},
        category = ${category !== undefined ? category : sql`category`},
        client_id = ${clientId !== undefined ? clientId : sql`client_id`},
        project_id = ${projectId !== undefined ? projectId : sql`project_id`},
        slug = COALESCE(${slug ?? null}, slug),
        access_pin = ${accessPin !== undefined ? accessPin : sql`access_pin`},
        status = COALESCE(${status ?? null}, status),
        cover_photo_id = ${coverPhotoId !== undefined ? coverPhotoId : sql`cover_photo_id`},
        allow_downloads = COALESCE(${allowDownloads ?? null}, allow_downloads),
        allow_favorites = COALESCE(${allowFavorites ?? null}, allow_favorites),
        allow_selections = COALESCE(${allowSelections ?? null}, allow_selections),
        expires_at = ${expiresAt !== undefined ? expiresAt : sql`expires_at`},
        expiry_behavior = ${expiryBehavior !== undefined ? expiryBehavior : sql`expiry_behavior`},
        published_at = ${publishedAt},
        updated_at = now()
      WHERE id = ${id}
        AND creator_id = ${creator.id}
      RETURNING *
    `);

    return NextResponse.json({ gallery: result.rows[0] });
  } catch (error) {
    console.error("PATCH /api/galleries/[id]", error);
    return NextResponse.json({ error: "Unable to update gallery." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const creator = await getCreator();
    if (!creator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const result = await db.execute(sql`
      DELETE FROM galleries
      WHERE id = ${id} AND creator_id = ${creator.id}
      RETURNING id
    `);

    if (!result.rows[0]) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("DELETE /api/galleries/[id]", error);
    return NextResponse.json({ error: "Unable to delete gallery." }, { status: 500 });
  }
}

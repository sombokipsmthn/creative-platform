// src/app/api/public/galleries/[slug]/route.ts
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  _request: Request,
  context: Context
) {
  try {
    const { slug } = await context.params;

    // Check by slug or by id
    const galleryResult = await db.execute(sql`
      SELECT
        g.*,
        c.name AS client_name,
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
      LEFT JOIN clients c
        ON c.id = g.client_id
      LEFT JOIN projects p
        ON p.id = g.project_id
      LEFT JOIN gallery_photos cp
        ON cp.id = g.cover_photo_id
      WHERE (g.slug = ${slug} OR g.id::text = ${slug})
      LIMIT 1
    `);

    const gallery = galleryResult.rows[0];

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 }
      );
    }

    const galleryId = gallery.id;

    const collections = await db.execute(sql`
      SELECT
        c.*,
        (
          SELECT COUNT(*)::int
          FROM gallery_photos p
          WHERE p.collection_id = c.id
            AND p.is_hidden = false
        ) AS photo_count
      FROM gallery_collections c
      WHERE c.gallery_id = ${galleryId}
      ORDER BY c.sort_order ASC, c.created_at ASC
    `);

    const photos = await db.execute(sql`
      SELECT
        p.id,
        p.filename,
        p.original_url,
        p.display_url,
        p.thumbnail_url,
        p.sort_order,
        p.is_hidden,
        p.is_favorite,
        p.is_selected,
        p.collection_id,
        c.title AS collection_title
      FROM gallery_photos p
      LEFT JOIN gallery_collections c
        ON c.id = p.collection_id
      WHERE p.gallery_id = ${galleryId}
        AND p.is_hidden = false
      ORDER BY p.sort_order ASC,
               p.created_at ASC
    `);

    return NextResponse.json({
      gallery,
      collections: collections.rows,
      photos: photos.rows,
    });
  } catch (error) {
    console.error("GET /api/public/galleries/[slug]", error);

    return NextResponse.json(
      { error: "Unable to load public gallery." },
      { status: 500 }
    );
  }
}

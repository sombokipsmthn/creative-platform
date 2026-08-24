// src/app/api/public/galleries/[slug]/photos/route.ts
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: Context
) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const photoId = body.photoId;

    if (!photoId) {
      return NextResponse.json(
        { error: "photoId is required." },
        { status: 400 }
      );
    }

    const gallery = await db.execute(sql`
      SELECT id
      FROM galleries
      WHERE (slug = ${slug} OR id::text = ${slug})
      LIMIT 1
    `);

    if (!gallery.rows[0]) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 }
      );
    }

    const galleryId = gallery.rows[0].id;

    if (body.isFavorite !== undefined) {
      await db.execute(sql`
        UPDATE gallery_photos
        SET
          is_favorite = ${Boolean(body.isFavorite)},
          updated_at = now()
        WHERE id = ${photoId}
          AND gallery_id = ${galleryId}
      `);
    }

    if (body.isSelected !== undefined) {
      await db.execute(sql`
        UPDATE gallery_photos
        SET
          is_selected = ${Boolean(body.isSelected)},
          updated_at = now()
        WHERE id = ${photoId}
          AND gallery_id = ${galleryId}
      `);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("PATCH public gallery photo", error);

    return NextResponse.json(
      { error: "Unable to update photo." },
      { status: 500 }
    );
  }
}

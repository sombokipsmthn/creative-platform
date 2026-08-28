import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getGallerySession } from "@/lib/gallery/session";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: Context,
) {
  try {
    const { slug } =
      await context.params;

    const body =
      await request.json();

    const photoId =
      typeof body.photoId ===
      "string"
        ? body.photoId
        : "";

    if (!photoId) {
      return NextResponse.json(
        {
          error:
            "photoId is required.",
        },
        {
          status: 400,
        },
      );
    }

    const gallery =
      await db.execute(sql`
        SELECT
          id,
          client_id,
          allow_favorites,
          allow_selections,
          expires_at
        FROM galleries
        WHERE (
          slug = ${slug}
          OR id::text = ${slug}
        )
        LIMIT 1
      `);

    if (!gallery.rows[0]) {
      return NextResponse.json(
        {
          error:
            "Gallery not found.",
        },
        {
          status: 404,
        },
      );
    }

    const galleryRow =
      gallery.rows[0];

    if (
      galleryRow.expires_at &&
      new Date(
        String(
          galleryRow.expires_at,
        ),
      ).getTime() <=
        Date.now()
    ) {
      return NextResponse.json(
        {
          error:
            "Gallery expired.",
        },
        {
          status: 410,
        },
      );
    }

    if (
      body.isFavorite !==
        undefined &&
      galleryRow.allow_favorites ===
        false
    ) {
      return NextResponse.json(
        {
          error:
            "Favorites are disabled for this gallery.",
        },
        {
          status: 403,
        },
      );
    }

    if (
      body.isSelected !==
        undefined &&
      galleryRow.allow_selections ===
        false
    ) {
      return NextResponse.json(
        {
          error:
            "Selections are disabled for this gallery.",
        },
        {
          status: 403,
        },
      );
    }

    const photo =
      await db.execute(sql`
        SELECT id
        FROM gallery_photos
        WHERE id = ${photoId}
          AND gallery_id = ${galleryRow.id}
          AND is_hidden = false
        LIMIT 1
      `);

    if (!photo.rows[0]) {
      return NextResponse.json(
        {
          error:
            "Photo not found.",
        },
        {
          status: 404,
        },
      );
    }

    const clientId =
      galleryRow.client_id
        ? String(
            galleryRow.client_id,
          )
        : null;

    const session =
      await getGallerySession(
        String(
          galleryRow.id,
        ),
        true,
        clientId,
      );

    if (!session) {
      return NextResponse.json(
        {
          error:
            "Gallery access required.",
        },
        {
          status: 401,
        },
      );
    }

    const current =
      await db.execute(sql`
        SELECT
          is_favorite,
          is_selected
        FROM gallery_photo_actions
        WHERE session_id = ${session.id}
          AND photo_id = ${photoId}
        LIMIT 1
      `);

    const existing =
      current.rows[0];

    const isFavorite =
      body.isFavorite !==
      undefined
        ? Boolean(
            body.isFavorite,
          )
        : Boolean(
            existing?.is_favorite ??
              false,
          );

    const isSelected =
      body.isSelected !==
      undefined
        ? Boolean(
            body.isSelected,
          )
        : Boolean(
            existing?.is_selected ??
              false,
          );

    await db.execute(sql`
      INSERT INTO gallery_photo_actions (
        session_id,
        gallery_id,
        photo_id,
        is_favorite,
        is_selected,
        updated_at
      )
      VALUES (
        ${session.id},
        ${galleryRow.id},
        ${photoId},
        ${isFavorite},
        ${isSelected},
        now()
      )
      ON CONFLICT (
        session_id,
        photo_id
      )
      DO UPDATE SET
        is_favorite =
          EXCLUDED.is_favorite,
        is_selected =
          EXCLUDED.is_selected,
        updated_at = now()
    `);

    return NextResponse.json({
      success: true,
      isFavorite,
      isSelected,
    });
  } catch (error) {
    console.error(
      "PATCH public gallery photo",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to update photo.",
      },
      {
        status: 500,
      },
    );
  }
}
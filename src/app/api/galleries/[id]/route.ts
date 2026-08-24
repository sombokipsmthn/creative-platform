import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getOrCreateLocalUser } from "@/lib/auth/get-or-create-local-user";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

async function getCreator() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return getOrCreateLocalUser(userId);
}

async function ownsGallery(
  galleryId: string,
  creatorId: string
) {
  const result = await db.execute(sql`
    SELECT *
    FROM galleries
    WHERE id = ${galleryId}
      AND creator_id = ${creatorId}
    LIMIT 1
  `);

  return result.rows[0] ?? null;
}

export async function GET(
  _request: Request,
  context: Context
) {
  try {
    const creator = await getCreator();

    if (!creator) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const gallery = await ownsGallery(
      id,
      creator.id
    );

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 }
      );
    }

    const collections = await db.execute(sql`
      SELECT *
      FROM gallery_collections
      WHERE gallery_id = ${id}
      ORDER BY sort_order ASC, created_at ASC
    `);

    const photos = await db.execute(sql`
      SELECT *
      FROM gallery_photos
      WHERE gallery_id = ${id}
      ORDER BY collection_id NULLS FIRST,
               sort_order ASC,
               created_at ASC
    `);

    return NextResponse.json({
      gallery,
      collections: collections.rows,
      photos: photos.rows,
    });
  } catch (error) {
    console.error("GET /api/galleries/[id]", error);

    return NextResponse.json(
      { error: "Unable to load gallery." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: Context
) {
  try {
    const creator = await getCreator();

    if (!creator) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const gallery = await ownsGallery(
      id,
      creator.id
    );

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const fields = {
      title:
        typeof body.title === "string"
          ? body.title.trim()
          : undefined,

      description:
        body.description !== undefined
          ? body.description
          : undefined,

      category:
        body.category !== undefined
          ? body.category
          : undefined,

      accessPin:
        body.accessPin !== undefined
          ? body.accessPin
          : undefined,

      allowDownloads:
        body.allowDownloads !== undefined
          ? Boolean(body.allowDownloads)
          : undefined,

      allowFavorites:
        body.allowFavorites !== undefined
          ? Boolean(body.allowFavorites)
          : undefined,

      allowSelections:
        body.allowSelections !== undefined
          ? Boolean(body.allowSelections)
          : undefined,
    };

    const result = await db.execute(sql`
      UPDATE galleries
      SET
        title = COALESCE(
          ${fields.title ?? null},
          title
        ),

        description = COALESCE(
          ${fields.description ?? null},
          description
        ),

        category = COALESCE(
          ${fields.category ?? null},
          category
        ),

        access_pin = COALESCE(
          ${fields.accessPin ?? null},
          access_pin
        ),

        allow_downloads = COALESCE(
          ${fields.allowDownloads ?? null},
          allow_downloads
        ),

        allow_favorites = COALESCE(
          ${fields.allowFavorites ?? null},
          allow_favorites
        ),

        allow_selections = COALESCE(
          ${fields.allowSelections ?? null},
          allow_selections
        ),

        updated_at = now()
      WHERE id = ${id}
        AND creator_id = ${creator.id}
      RETURNING *
    `);

    return NextResponse.json({
      gallery: result.rows[0],
    });
  } catch (error) {
    console.error("PATCH /api/galleries/[id]", error);

    return NextResponse.json(
      { error: "Unable to update gallery." },
      { status: 500 }
    );
  }
}
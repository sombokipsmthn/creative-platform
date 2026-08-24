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
    SELECT id
    FROM galleries
    WHERE id = ${galleryId}
      AND creator_id = ${creatorId}
    LIMIT 1
  `);

  return Boolean(result.rows[0]);
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

    const { id: galleryId } =
      await context.params;

    if (
      !(await ownsGallery(
        galleryId,
        creator.id
      ))
    ) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const photoId = body.photoId;

    if (!photoId) {
      return NextResponse.json(
        { error: "photoId is required." },
        { status: 400 }
      );
    }

    if (body.collectionId !== undefined) {
      await db.execute(sql`
        UPDATE gallery_photos
        SET
          collection_id =
            ${body.collectionId || null},

          updated_at = now()

        WHERE id = ${photoId}
          AND gallery_id = ${galleryId}
      `);
    }

    if (body.isHidden !== undefined) {
      await db.execute(sql`
        UPDATE gallery_photos
        SET
          is_hidden =
            ${Boolean(body.isHidden)},

          updated_at = now()

        WHERE id = ${photoId}
          AND gallery_id = ${galleryId}
      `);
    }

    if (body.isFavorite !== undefined) {
      await db.execute(sql`
        UPDATE gallery_photos
        SET
          is_favorite =
            ${Boolean(body.isFavorite)},

          updated_at = now()

        WHERE id = ${photoId}
          AND gallery_id = ${galleryId}
      `);
    }

    if (body.isSelected !== undefined) {
      await db.execute(sql`
        UPDATE gallery_photos
        SET
          is_selected =
            ${Boolean(body.isSelected)},

          updated_at = now()

        WHERE id = ${photoId}
          AND gallery_id = ${galleryId}
      `);
    }

    if (body.isCover) {
      await db.execute(sql`
        UPDATE galleries
        SET
          cover_photo_id =
            ${photoId},

          updated_at = now()

        WHERE id = ${galleryId}
          AND creator_id = ${creator.id}
      `);
    }

    const result = await db.execute(sql`
      SELECT *
      FROM gallery_photos
      WHERE id = ${photoId}
        AND gallery_id = ${galleryId}
      LIMIT 1
    `);

    return NextResponse.json({
      photo: result.rows[0],
    });
  } catch (error) {
    console.error(
      "PATCH gallery photo",
      error
    );

    return NextResponse.json(
      { error: "Unable to update photo." },
      { status: 500 }
    );
  }
}


export async function DELETE(
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

    const { id: galleryId } =
      await context.params;

    if (
      !(await ownsGallery(
        galleryId,
        creator.id
      ))
    ) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const ids: string[] =
      Array.isArray(body.photoIds)
        ? body.photoIds
        : [];

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "No photos selected." },
        { status: 400 }
      );
    }

    for (const photoId of ids) {
      await db.execute(sql`
        DELETE FROM gallery_photos
        WHERE id = ${photoId}
          AND gallery_id = ${galleryId}
      `);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE gallery photos",
      error
    );

    return NextResponse.json(
      { error: "Unable to delete photos." },
      { status: 500 }
    );
  }
}
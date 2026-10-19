import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getLocalUser } from "@/lib/auth/get-local-user";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

type ReorderPhoto = {
  id: string;
  collectionId?: string | null;
};

export async function POST(
  request: Request,
  context: Context
) {
  try {
    const session = await getCurrentSession();
    const userId = session?.user?.id ?? null;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let creator;
    try {
      creator = await getLocalUser(userId);
    } catch (e) {
      console.error("Creator not found for reorder route:", e);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: galleryId } =
      await context.params;

    const gallery = await db.execute(sql`
      SELECT id
      FROM galleries
      WHERE id = ${galleryId}
        AND creator_id = ${creator.id}
      LIMIT 1
    `);

    if (!gallery.rows[0]) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const photos: ReorderPhoto[] =
      Array.isArray(body.photos)
        ? body.photos
        : [];

    const updatesByPhotoId = new Map<
      string,
      { photo: ReorderPhoto; index: number }
    >();
    photos.forEach((photo, index) => {
      updatesByPhotoId.set(String(photo.id), { photo, index });
    });
    const updates = [...updatesByPhotoId.values()];

    for (let offset = 0; offset < updates.length; offset += 1000) {
      const values = updates
        .slice(offset, offset + 1000)
        .map(
          ({ photo, index }) =>
            sql`(${photo.id}::uuid, ${index}::integer, ${photo.collectionId || null}::uuid)`
        );

      await db.execute(sql`
        UPDATE gallery_photos AS photo
        SET
          sort_order = changes.sort_order,
          collection_id = changes.collection_id,
          updated_at = now()
        FROM (VALUES ${sql.join(values, sql`, `)}) AS changes(photo_id, sort_order, collection_id)
        WHERE photo.id = changes.photo_id
          AND photo.gallery_id = ${galleryId}
      `);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "POST reorder",
      error
    );

    return NextResponse.json(
      { error: "Unable to reorder photos." },
      { status: 500 }
    );
  }
}

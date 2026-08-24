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

export async function POST(
  request: Request,
  context: Context
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const creator =
      await getOrCreateLocalUser(userId);

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

    const photos =
      Array.isArray(body.photos)
        ? body.photos
        : [];

    for (
      let index = 0;
      index < photos.length;
      index++
    ) {
      const photo = photos[index];

      await db.execute(sql`
        UPDATE gallery_photos
        SET
          sort_order = ${index},
          collection_id =
            ${photo.collectionId || null},
          updated_at = now()

        WHERE id = ${photo.id}
          AND gallery_id = ${galleryId}
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
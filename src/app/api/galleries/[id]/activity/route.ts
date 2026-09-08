import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getLocalUser } from "@/lib/auth/get-local-user";

type Context = {
  params: Promise<{ id: string }>;
};

async function getCreator() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    return await getLocalUser(userId);
  } catch (e) {
    console.error("Creator not found for this route:", e);
    return null;
  }
}

export async function GET(_request: Request, context: Context) {
  try {
    const creator = await getCreator();

    if (!creator) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: galleryId } = await context.params;

    if (!galleryId) {
      return NextResponse.json(
        { error: "Gallery ID is required." },
        { status: 400 }
      );
    }

    // Verify gallery ownership
    const gallery = await db.execute(sql`
      SELECT id FROM galleries
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

    // Fetch gallery activity
    const activityResult = await db.execute(sql`
      SELECT
        a.id,
        a.event_type as event_type,
        a.client_name,
        a.metadata,
        p.filename as photo_filename,
        c.title as collection_title,
        a.created_at
      FROM gallery_activity a
      LEFT JOIN gallery_photos p ON p.id = a.photo_id
      LEFT JOIN gallery_collections c ON c.id = a.collection_id
      WHERE a.gallery_id = ${galleryId}
      ORDER BY a.created_at DESC
      LIMIT 100
    `);

    return NextResponse.json({
      activity: activityResult.rows,
    });
  } catch (error) {
    console.error(
      "GET /api/galleries/[id]/activity failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load activity.",
      },
      { status: 500 }
    );
  }
}

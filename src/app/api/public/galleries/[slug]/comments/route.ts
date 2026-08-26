import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { requireGallerySession } from "@/lib/gallery/session";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

async function getGallery(slug: string) {
  const result = await db.execute(sql`
    SELECT
      id,
      client_id,
      access_pin,
      expires_at
    FROM galleries
    WHERE (slug = ${slug} OR id::text = ${slug})
    LIMIT 1
  `);

  return result.rows[0] || null;
}

async function requireAccess(gallery: Record<string, unknown>) {
  return requireGallerySession(
    String(gallery.id),
    gallery.client_id
      ? String(gallery.client_id)
      : null,
  );
}

export async function GET(
  request: Request,
  context: Context,
) {
  try {
    const { slug } = await context.params;

    const gallery = await getGallery(slug);

    if (!gallery) {
      return NextResponse.json(
        {
          error: "Gallery not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      gallery.expires_at &&
      new Date(String(gallery.expires_at)).getTime() <= Date.now()
    ) {
      return NextResponse.json(
        {
          error: "Gallery expired.",
        },
        {
          status: 410,
        },
      );
    }

    const session = await requireAccess(gallery);

    if (!session) {
      return NextResponse.json(
        {
          error: "Gallery access required.",
          requiresPin: Boolean(
            typeof gallery.access_pin === "string" &&
            gallery.access_pin.trim(),
          ),
        },
        {
          status: 401,
        },
      );
    }

    const photoId = new URL(request.url)
      .searchParams
      .get("photoId");

    const comments = await db.execute(sql`
      SELECT
        id,
        photo_id,
        author_type,
        author_name,
        body,
        resolved_at,
        created_at
      FROM gallery_comments
      WHERE gallery_id = ${gallery.id}
        AND (
          ${photoId || null}::uuid IS NULL
          OR photo_id = ${photoId || null}
        )
      ORDER BY created_at ASC
    `);

    return NextResponse.json({
      comments: comments.rows,
      sessionId: session.id,
    });
  } catch (error) {
    console.error(
      "GET public gallery comments",
      error,
    );

    return NextResponse.json(
      {
        error: "Unable to load comments.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: Request,
  context: Context,
) {
  try {
    const { slug } = await context.params;

    const gallery = await getGallery(slug);

    if (!gallery) {
      return NextResponse.json(
        {
          error: "Gallery not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      gallery.expires_at &&
      new Date(String(gallery.expires_at)).getTime() <= Date.now()
    ) {
      return NextResponse.json(
        {
          error: "Gallery expired.",
        },
        {
          status: 410,
        },
      );
    }

    const session = await requireAccess(gallery);

    if (!session) {
      return NextResponse.json(
        {
          error: "Gallery access required.",
          requiresPin: Boolean(
            typeof gallery.access_pin === "string" &&
            gallery.access_pin.trim(),
          ),
        },
        {
          status: 401,
        },
      );
    }

    const body = await request.json();

    const photoId =
      typeof body.photoId === "string"
        ? body.photoId
        : "";

    const text =
      typeof body.body === "string"
        ? body.body.trim()
        : "";

    const authorName =
      typeof body.authorName === "string" &&
      body.authorName.trim()
        ? body.authorName
            .trim()
            .slice(0, 120)
        : "Client";

    if (!photoId || !text) {
      return NextResponse.json(
        {
          error: "photoId and body are required.",
        },
        {
          status: 400,
        },
      );
    }

    if (text.length > 2000) {
      return NextResponse.json(
        {
          error: "Comment is too long.",
        },
        {
          status: 400,
        },
      );
    }

    const photo = await db.execute(sql`
      SELECT id
      FROM gallery_photos
      WHERE id = ${photoId}
        AND gallery_id = ${gallery.id}
        AND is_hidden = false
      LIMIT 1
    `);

    if (!photo.rows[0]) {
      return NextResponse.json(
        {
          error: "Photo not found.",
        },
        {
          status: 404,
        },
      );
    }

    const result = await db.execute(sql`
      INSERT INTO gallery_comments (
        gallery_id,
        photo_id,
        session_id,
        author_type,
        author_name,
        body
      )
      VALUES (
        ${gallery.id},
        ${photoId},
        ${session.id},
        'client',
        ${authorName},
        ${text}
      )
      RETURNING
        id,
        photo_id,
        author_type,
        author_name,
        body,
        resolved_at,
        created_at
    `);

    return NextResponse.json(
      {
        comment: result.rows[0],
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST public gallery comment",
      error,
    );

    return NextResponse.json(
      {
        error: "Unable to add comment.",
      },
      {
        status: 500,
      },
    );
  }
}
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getOrCreateLocalUser } from "@/lib/auth/get-or-create-local-user";

async function getCreator() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return getOrCreateLocalUser(userId);
}

function createSlug(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${base || "gallery"}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export async function GET() {
  try {
    const creator = await getCreator();

    if (!creator) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await db.execute(sql`
      SELECT
        g.*,
        c.name AS client_name,
        COALESCE(
          cp.display_url,
          (
            SELECT p.display_url
            FROM gallery_photos p
            WHERE p.gallery_id = g.id
              AND p.is_hidden = false
            ORDER BY p.sort_order ASC, p.created_at ASC
            LIMIT 1
          )
        ) AS cover_url,
        (
          SELECT COUNT(*)
          FROM gallery_photos p
          WHERE p.gallery_id = g.id
            AND p.is_hidden = false
        )::int AS photo_count,
        (
          SELECT COUNT(*)
          FROM gallery_collections col
          WHERE col.gallery_id = g.id
        )::int AS collections_count
      FROM galleries g
      LEFT JOIN clients c
        ON c.id = g.client_id
      LEFT JOIN gallery_photos cp
        ON cp.id = g.cover_photo_id
      WHERE g.creator_id = ${creator.id}
      ORDER BY g.created_at DESC
    `);

    return NextResponse.json({
      galleries: result.rows,
    });
  } catch (error) {
    console.error("GET /api/galleries", error);

    return NextResponse.json(
      { error: "Unable to load galleries." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const creator = await getCreator();

    if (!creator) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        { error: "Gallery title is required." },
        { status: 400 }
      );
    }

    const slug = createSlug(title);

    const galleryResult = await db.execute(sql`
      INSERT INTO galleries (
        creator_id,
        client_id,
        project_id,
        title,
        description,
        category,
        slug,
        access_pin,
        status,
        allow_downloads,
        allow_favorites,
        allow_selections
      )
      VALUES (
        ${creator.id},
        ${body.clientId || null},
        ${body.projectId || null},
        ${title},
        ${body.description || null},
        ${body.category || null},
        ${slug},
        ${body.accessPin || null},
        'draft',
        ${body.allowDownloads !== false},
        ${body.allowFavorites !== false},
        ${body.allowSelections !== false}
      )
      RETURNING *
    `);

    const gallery = galleryResult.rows[0];

    await db.execute(sql`
      INSERT INTO gallery_collections (
        gallery_id,
        title,
        sort_order
      )
      VALUES (
        ${gallery.id},
        'All Photos',
        0
      )
    `);

    return NextResponse.json(
      {
        gallery,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/galleries", error);

    return NextResponse.json(
      { error: "Unable to create gallery." },
      { status: 500 }
    );
  }
}
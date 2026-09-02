import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getLocalUser } from "@/lib/auth/get-local-user";

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

  try {
    return await getLocalUser(userId);
  } catch (e) {
    console.error("Creator not found for collections route:", e);
    return null;
  }
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

    const collections = await db.execute(sql`
      SELECT
        c.*,
        (
          SELECT COUNT(*)::int
          FROM gallery_photos p
          WHERE p.collection_id = c.id
        ) AS photo_count
      FROM gallery_collections c
      INNER JOIN galleries g
        ON g.id = c.gallery_id
      WHERE c.gallery_id = ${id}
        AND g.creator_id = ${creator.id}
      ORDER BY c.sort_order ASC, c.created_at ASC
    `);

    return NextResponse.json({
      collections: collections.rows,
    });
  } catch (error) {
    console.error("GET collections", error);

    return NextResponse.json(
      { error: "Unable to load collections." },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const gallery = await db.execute(sql`
      SELECT id
      FROM galleries
      WHERE id = ${id}
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

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        { error: "Collection title is required." },
        { status: 400 }
      );
    }

    const maxOrder = await db.execute(sql`
      SELECT COALESCE(MAX(sort_order), -1)::int AS max_order
      FROM gallery_collections
      WHERE gallery_id = ${id}
    `);

    const nextOrder =
      Number(
        maxOrder.rows[0]?.max_order ?? -1
      ) + 1;

    const result = await db.execute(sql`
      INSERT INTO gallery_collections (
        gallery_id,
        title,
        description,
        sort_order
      )
      VALUES (
        ${id},
        ${title},
        ${body.description || null},
        ${nextOrder}
      )
      RETURNING *
    `);

    return NextResponse.json(
      {
        collection: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST collections",
      error
    );

    return NextResponse.json(
      { error: "Unable to create collection." },
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

    const gallery = await db.execute(sql`
      SELECT id
      FROM galleries
      WHERE id = ${id}
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
    const collectionId = body.collectionId;

    if (!collectionId) {
      return NextResponse.json(
        { error: "collectionId is required." },
        { status: 400 }
      );
    }

    const title =
      typeof body.title === "string" && body.title.trim().length > 0
        ? body.title.trim()
        : undefined;

    const description =
      body.description !== undefined ? body.description : undefined;

    const sortOrder =
      typeof body.sortOrder === "number" ? body.sortOrder : undefined;

    const result = await db.execute(sql`
      UPDATE gallery_collections
      SET
        title = COALESCE(${title ?? null}, title),
        description = ${description !== undefined ? description : sql`description`},
        sort_order = COALESCE(${sortOrder ?? null}, sort_order),
        updated_at = now()
      WHERE id = ${collectionId}
        AND gallery_id = ${id}
      RETURNING *
    `);

    if (!result.rows[0]) {
      return NextResponse.json(
        { error: "Collection not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      collection: result.rows[0],
    });
  } catch (error) {
    console.error("PATCH collections", error);

    return NextResponse.json(
      { error: "Unable to update collection." },
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

    const { id } = await context.params;

    const gallery = await db.execute(sql`
      SELECT id
      FROM galleries
      WHERE id = ${id}
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
    const collectionId = body.collectionId;

    if (!collectionId) {
      return NextResponse.json(
        { error: "collectionId is required." },
        { status: 400 }
      );
    }

    // Set collection_id to null on any photos belonging to this collection
    await db.execute(sql`
      UPDATE gallery_photos
      SET collection_id = NULL,
          updated_at = now()
      WHERE gallery_id = ${id}
        AND collection_id = ${collectionId}
    `);

    // Delete the collection
    const result = await db.execute(sql`
      DELETE FROM gallery_collections
      WHERE id = ${collectionId}
        AND gallery_id = ${id}
      RETURNING id
    `);

    if (!result.rows[0]) {
      return NextResponse.json(
        { error: "Collection not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      id: collectionId,
    });
  } catch (error) {
    console.error("DELETE collections", error);

    return NextResponse.json(
      { error: "Unable to delete collection." },
      { status: 500 }
    );
  }
}

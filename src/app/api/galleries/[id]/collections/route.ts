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
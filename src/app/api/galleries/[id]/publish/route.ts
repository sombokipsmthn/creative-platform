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

    let creator;
    try {
      creator = await getLocalUser(userId);
    } catch (e) {
      console.error("Creator not found for publish route:", e);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const body = await request.json();

    const publish = Boolean(body.publish);

    const result = await db.execute(sql`
      UPDATE galleries
      SET
        status = ${
          publish ? "published" : "draft"
        },

        published_at = ${
          publish ? sql`now()` : sql`NULL`
        },

        updated_at = now()

      WHERE id = ${id}
        AND creator_id = ${creator.id}

      RETURNING *
    `);

    if (!result.rows[0]) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      gallery: result.rows[0],
    });
  } catch (error) {
    console.error(
      "POST /api/galleries/[id]/publish",
      error
    );

    return NextResponse.json(
      { error: "Unable to change gallery status." },
      { status: 500 }
    );
  }
}

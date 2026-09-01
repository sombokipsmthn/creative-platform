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
    // If the local user does not exist yet, treat as unauthenticated for this route.
    console.error("Creator not found for approval route:", e);
    return null;
  }
}

async function ownsGallery(
  id: string,
  creatorId: string,
) {
  const result = await db.execute(sql`
    SELECT id
    FROM galleries
    WHERE id = ${id}
      AND creator_id = ${creatorId}
    LIMIT 1
  `);

  return Boolean(result.rows[0]);
}

export async function GET(
  _request: Request,
  context: Context,
) {
  try {
    const creator = await getCreator();

    if (!creator) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const { id } = await context.params;

    if (
      !(await ownsGallery(
        id,
        creator.id,
      ))
    ) {
      return NextResponse.json(
        {
          error: "Gallery not found.",
        },
        {
          status: 404,
        },
      );
    }

    const result = await db.execute(sql`
      SELECT *
      FROM gallery_approvals
      WHERE gallery_id = ${id}
      LIMIT 1
    `);

    return NextResponse.json({
      approval: result.rows[0] || null,
    });
  } catch (error) {
    console.error(
      "GET gallery approval",
      error,
    );

    return NextResponse.json(
      {
        error: "Unable to load approval.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  request: Request,
  context: Context,
) {
  try {
    const creator = await getCreator();

    if (!creator) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const { id } = await context.params;

    if (
      !(await ownsGallery(
        id,
        creator.id,
      ))
    ) {
      return NextResponse.json(
        {
          error: "Gallery not found.",
        },
        {
          status: 404,
        },
      );
    }

    const body = await request.json();

    const status = [
      "pending",
      "approved",
      "changes_requested",
    ].includes(body.status)
      ? body.status
      : "pending";

    const note =
      typeof body.note === "string"
        ? body.note.trim().slice(0, 2000)
        : null;

    const result = await db.execute(sql`
      INSERT INTO gallery_approvals (
        gallery_id,
        client_id,
        status,
        requested_at,
        responded_at,
        response_note,
        updated_at
      )
      SELECT
        g.id,
        g.client_id,
        ${status},
        CASE
          WHEN ${status} = 'pending'
          THEN now()
          ELSE NULL
        END,
        CASE
          WHEN ${status} = 'pending'
          THEN NULL
          ELSE now()
        END,
        ${note},
        now()
      FROM galleries g
      WHERE g.id = ${id}
      ON CONFLICT (gallery_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        requested_at = CASE
          WHEN EXCLUDED.status = 'pending'
          THEN now()
          ELSE gallery_approvals.requested_at
        END,
        responded_at = CASE
          WHEN EXCLUDED.status = 'pending'
          THEN NULL
          ELSE now()
        END,
        response_note = EXCLUDED.response_note,
        updated_at = now()
      RETURNING *
    `);

    return NextResponse.json({
      approval: result.rows[0],
    });
  } catch (error) {
    console.error(
      "PATCH gallery approval",
      error,
    );

    return NextResponse.json(
      {
        error: "Unable to update approval.",
      },
      {
        status: 500,
      },
    );
  }
}

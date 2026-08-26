import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getGallerySession } from "@/lib/gallery/session";

type Context = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const gallery = await db.execute(sql`
      SELECT id, client_id, expires_at
      FROM galleries
      WHERE (slug = ${slug} OR id::text = ${slug})
      LIMIT 1
    `);

    if (!gallery.rows[0]) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
    const row = gallery.rows[0];

    if (row.expires_at && new Date(String(row.expires_at)).getTime() <= Date.now()) {
      return NextResponse.json({ error: "Gallery expired." }, { status: 410 });
    }

    const approval = await db.execute(sql`
      SELECT *
      FROM gallery_approvals
      WHERE gallery_id = ${row.id}
      LIMIT 1
    `);

    return NextResponse.json({ approval: approval.rows[0] || null });
  } catch (error) {
    console.error("GET public gallery approval", error);
    return NextResponse.json({ error: "Unable to load approval state." }, { status: 500 });
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const gallery = await db.execute(sql`
      SELECT id, client_id, expires_at
      FROM galleries
      WHERE (slug = ${slug} OR id::text = ${slug})
      LIMIT 1
    `);

    if (!gallery.rows[0]) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
    const row = gallery.rows[0];

    if (row.expires_at && new Date(String(row.expires_at)).getTime() <= Date.now()) {
      return NextResponse.json({ error: "Gallery expired." }, { status: 410 });
    }

    const body = await request.json();
    const status = body.status === "approved" || body.status === "changes_requested"
      ? body.status
      : "approved";
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 2000) : null;
    const session = await getGallerySession(String(row.id), true, row.client_id);

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
      VALUES (
        ${row.id},
        ${row.client_id || null},
        ${status},
        now(),
        now(),
        ${note},
        now()
      )
      ON CONFLICT (gallery_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        responded_at = now(),
        response_note = EXCLUDED.response_note,
        updated_at = now()
      RETURNING *
    `);

    await db.execute(sql`
      UPDATE gallery_access_sessions
      SET last_seen_at = now()
      WHERE id = ${session.id}
    `);

    return NextResponse.json({ approval: result.rows[0] });
  } catch (error) {
    console.error("POST public gallery approval", error);
    return NextResponse.json({ error: "Unable to save approval." }, { status: 500 });
  }
}

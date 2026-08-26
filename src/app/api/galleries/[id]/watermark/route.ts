import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getOrCreateLocalUser } from "@/lib/auth/get-or-create-local-user";

type Context = { params: Promise<{ id: string }> };

async function getCreator() {
  const { userId } = await auth();
  if (!userId) return null;
  return getOrCreateLocalUser(userId);
}

async function ownsGallery(id: string, creatorId: string) {
  const result = await db.execute(sql`
    SELECT id FROM galleries WHERE id = ${id} AND creator_id = ${creatorId} LIMIT 1
  `);
  return Boolean(result.rows[0]);
}

export async function GET(_request: Request, context: Context) {
  try {
    const creator = await getCreator();
    if (!creator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;
    if (!(await ownsGallery(id, creator.id))) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });

    const result = await db.execute(sql`
      SELECT * FROM gallery_watermarks WHERE gallery_id = ${id} LIMIT 1
    `);
    return NextResponse.json({ watermark: result.rows[0] || null });
  } catch (error) {
    console.error("GET gallery watermark", error);
    return NextResponse.json({ error: "Unable to load watermark settings." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const creator = await getCreator();
    if (!creator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;
    if (!(await ownsGallery(id, creator.id))) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });

    const body = await request.json();
    const position = ["top-left", "top-right", "bottom-left", "bottom-right", "center"].includes(body.position)
      ? body.position
      : "bottom-right";
    const opacity = Math.max(0, Math.min(Number(body.opacity ?? 55), 100));
    const fontSize = Math.max(12, Math.min(Number(body.fontSize ?? 42), 160));
    const text = typeof body.text === "string" ? body.text.trim().slice(0, 120) : "KIPSMTHN";

    const result = await db.execute(sql`
      INSERT INTO gallery_watermarks (
        gallery_id,
        enabled,
        text,
        position,
        opacity,
        font_size,
        updated_at
      )
      VALUES (
        ${id},
        ${body.enabled !== false},
        ${text || "KIPSMTHN"},
        ${position},
        ${opacity},
        ${fontSize},
        now()
      )
      ON CONFLICT (gallery_id)
      DO UPDATE SET
        enabled = EXCLUDED.enabled,
        text = EXCLUDED.text,
        position = EXCLUDED.position,
        opacity = EXCLUDED.opacity,
        font_size = EXCLUDED.font_size,
        updated_at = now()
      RETURNING *
    `);

    return NextResponse.json({ watermark: result.rows[0] });
  } catch (error) {
    console.error("PATCH gallery watermark", error);
    return NextResponse.json({ error: "Unable to update watermark settings." }, { status: 500 });
  }
}

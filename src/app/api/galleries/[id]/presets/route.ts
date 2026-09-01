import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getLocalUser } from "@/lib/auth/get-local-user";

type Context = { params: Promise<{ id: string }> };

async function getCreator() {
  const { userId } = await auth();
  if (!userId) return null;
  try {
    return await getLocalUser(userId);
  } catch (e) {
    console.error("Creator not found for this route:", e);
    return null;
  }
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
      SELECT *
      FROM gallery_download_presets
      WHERE gallery_id = ${id}
      ORDER BY created_at ASC
    `);
    return NextResponse.json({ presets: result.rows });
  } catch (error) {
    console.error("GET gallery presets", error);
    return NextResponse.json({ error: "Unable to load download presets." }, { status: 500 });
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const creator = await getCreator();
    if (!creator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;
    if (!(await ownsGallery(id, creator.id))) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "Web Delivery";
    const variant = ["original", "display", "thumbnail", "watermark"].includes(body.variant) ? body.variant : "display";
    const format = ["jpg", "webp", "png"].includes(body.format) ? body.format : "jpg";
    const maxWidth = body.maxWidth == null || body.maxWidth === "" ? null : Math.max(320, Math.min(Number(body.maxWidth), 8000));
    const quality = Math.max(40, Math.min(Number(body.quality || 88), 100));

    const result = await db.execute(sql`
      INSERT INTO gallery_download_presets (
        gallery_id,
        name,
        variant,
        max_width,
        quality,
        format,
        include_watermark
      )
      VALUES (
        ${id},
        ${name || "Web Delivery"},
        ${variant},
        ${maxWidth},
        ${quality},
        ${format},
        ${Boolean(body.includeWatermark)}
      )
      RETURNING *
    `);

    return NextResponse.json({ preset: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("POST gallery preset", error);
    return NextResponse.json({ error: "Unable to create download preset." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const creator = await getCreator();
    if (!creator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;
    if (!(await ownsGallery(id, creator.id))) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });

    const body = await request.json();
    if (!body.presetId) return NextResponse.json({ error: "presetId is required." }, { status: 400 });

    const result = await db.execute(sql`
      UPDATE gallery_download_presets
      SET
        name = COALESCE(${typeof body.name === "string" ? body.name.trim().slice(0, 120) : null}, name),
        variant = COALESCE(${body.variant || null}, variant),
        max_width = ${body.maxWidth === undefined ? sql`max_width` : body.maxWidth === null || body.maxWidth === "" ? null : Number(body.maxWidth)},
        quality = COALESCE(${body.quality === undefined ? null : Math.max(40, Math.min(Number(body.quality), 100))}, quality),
        format = COALESCE(${body.format || null}, format),
        include_watermark = COALESCE(${body.includeWatermark === undefined ? null : Boolean(body.includeWatermark)}, include_watermark),
        updated_at = now()
      WHERE id = ${body.presetId}
        AND gallery_id = ${id}
      RETURNING *
    `);

    if (!result.rows[0]) return NextResponse.json({ error: "Preset not found." }, { status: 404 });
    return NextResponse.json({ preset: result.rows[0] });
  } catch (error) {
    console.error("PATCH gallery preset", error);
    return NextResponse.json({ error: "Unable to update download preset." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const creator = await getCreator();
    if (!creator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;
    if (!(await ownsGallery(id, creator.id))) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });

    const body = await request.json();
    if (!body.presetId) return NextResponse.json({ error: "presetId is required." }, { status: 400 });

    await db.execute(sql`
      DELETE FROM gallery_download_presets
      WHERE id = ${body.presetId}
        AND gallery_id = ${id}
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE gallery preset", error);
    return NextResponse.json({ error: "Unable to delete download preset." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";

export async function GET() {
  try {
    const result = await db.execute(sql`
      SELECT
        p.id,
        p.name,
        p.short_description,
        p.slug,
        p.category,
        p.year,
        p.location,
        p.featured,
        p.published_at,
        p.visibility,
        c.name AS client_name,
        c.company AS client_company,
        pm.id AS media_id,
        pm.display_url AS cover_display_url,
        pm.thumbnail_url AS cover_thumbnail_url,
        pm.alt_text AS cover_alt_text,
        pm.caption AS cover_caption
      FROM projects p
      LEFT JOIN clients c ON c.id = p.client_id
      LEFT JOIN project_media pm ON pm.id = p.cover_media_id
      WHERE p.visibility = 'public'
        AND p.published_at IS NOT NULL
      ORDER BY
        CASE WHEN p.featured THEN 0 ELSE 1 END,
        p.published_at DESC NULLS LAST,
        p.created_at DESC
    `);

    return NextResponse.json({ projects: result.rows });
  } catch (error) {
    console.error("GET /api/public/projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects." }, { status: 500 });
  }
}
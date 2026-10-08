import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";

type Context = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ error: "Project slug is required." }, { status: 400 });
    }

    const projectResult = await db.execute(sql`
      SELECT
        p.*,
        c.name AS client_name,
        c.company AS client_company,
        c.email AS client_email,
        c.location AS client_location,
        c.website AS client_website
      FROM projects p
      LEFT JOIN clients c ON c.id = p.client_id
      WHERE p.slug = ${slug}
        AND p.visibility = 'public'
        AND p.published_at IS NOT NULL
      LIMIT 1
    `);

    const project = projectResult.rows[0];

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    // Fetch project media
    const mediaResult = await db.execute(sql`
      SELECT
        id,
        filename,
        original_url,
        display_url,
        thumbnail_url,
        mime_type,
        file_size,
        width,
        height,
        alt_text,
        caption,
        sort_order,
        is_hidden,
        is_cover,
        created_at,
        updated_at
      FROM project_media
      WHERE project_id = ${project.id}
        AND is_hidden = false
      ORDER BY sort_order ASC, created_at ASC
    `);

    return NextResponse.json({
      project: {
        ...project,
        media: mediaResult.rows,
      },
    });
  } catch (error) {
    console.error("GET /api/public/projects/[slug] error:", error);
    return NextResponse.json({ error: "Failed to fetch project." }, { status: 500 });
  }
}
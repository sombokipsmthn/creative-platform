import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { withCreatorApi } from "@/lib/api/route-boundaries";
import { getGalleryStorage } from "@/lib/gallery/storage";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Context) {
  return withCreatorApi(_request, async (_req, user) => {
    try {
      const { id } = await context.params;

      if (!id) {
        return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
      }

      // Verify project ownership
      const projectCheck = await db.execute(sql`
        SELECT id FROM projects WHERE id = ${id} AND creator_id = ${user.id}
      `);

      if (!projectCheck.rows[0]) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }

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
        WHERE project_id = ${id}
        ORDER BY sort_order ASC, created_at ASC
      `);

      return NextResponse.json({ media: mediaResult.rows });
    } catch (error) {
      console.error("GET /api/projects/[id]/media error:", error);
      return NextResponse.json({ error: "Failed to fetch project media." }, { status: 500 });
    }
  });
}

export async function POST(request: Request, context: Context) {
  return withCreatorApi(request, async (_req, user) => {
    try {
      const { id } = await context.params;

      if (!id) {
        return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
      }

      // Verify project ownership
      const projectCheck = await db.execute(sql`
        SELECT id FROM projects WHERE id = ${id} AND creator_id = ${user.id}
      `);

      if (!projectCheck.rows[0]) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }

      const body = await request.json();
      const { filename, originalUrl, displayUrl, thumbnailUrl, mimeType, fileSize, width, height, altText, caption, storagePath } = body;

      if (!filename || !originalUrl || !displayUrl || !thumbnailUrl) {
        return NextResponse.json({ error: "Missing required media fields." }, { status: 400 });
      }

      // Get max sort order
      const maxOrderResult = await db.execute(sql`
        SELECT COALESCE(MAX(sort_order), -1)::int AS max_order
        FROM project_media
        WHERE project_id = ${id}
      `);

      const sortOrder = Number(maxOrderResult.rows[0]?.max_order ?? -1) + 1;

      const result = await db.execute(sql`
        INSERT INTO project_media (
          project_id,
          creator_id,
          filename,
          original_url,
          display_url,
          thumbnail_url,
          storage_path,
          mime_type,
          file_size,
          width,
          height,
          alt_text,
          caption,
          sort_order
        ) VALUES (
          ${id},
          ${user.id},
          ${filename},
          ${originalUrl},
          ${displayUrl},
          ${thumbnailUrl},
          ${storagePath || null},
          ${mimeType || null},
          ${fileSize || null},
          ${width || null},
          ${height || null},
          ${altText || null},
          ${caption || null},
          ${sortOrder}
        )
        RETURNING *
      `);

      return NextResponse.json({ media: result.rows[0] }, { status: 201 });
    } catch (error) {
      console.error("POST /api/projects/[id]/media error:", error);
      return NextResponse.json({ error: "Failed to add project media." }, { status: 500 });
    }
  });
}
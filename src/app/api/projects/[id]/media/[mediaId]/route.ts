import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { withCreatorApi } from "@/lib/api/route-boundaries";
import { getGalleryStorage } from "@/lib/gallery/storage";

type Context = {
  params: Promise<{ id: string; mediaId: string }>;
};

export async function PATCH(request: Request, context: Context) {
  return withCreatorApi(request, async (_req, user) => {
    try {
      const { id, mediaId } = await context.params;

      if (!id || !mediaId) {
        return NextResponse.json({ error: "Project ID and Media ID are required." }, { status: 400 });
      }

      // Verify project ownership
      const projectCheck = await db.execute(sql`
        SELECT id FROM projects WHERE id = ${id} AND creator_id = ${user.id}
      `);

      if (!projectCheck.rows[0]) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }

      // Verify media ownership
      const mediaCheck = await db.execute(sql`
        SELECT id FROM project_media WHERE id = ${mediaId} AND project_id = ${id} AND creator_id = ${user.id}
      `);

      if (!mediaCheck.rows[0]) {
        return NextResponse.json({ error: "Media not found." }, { status: 404 });
      }

      const body = await request.json();
      const allowedFields = ["altText", "caption", "sortOrder", "isHidden", "isCover"];
      const updates: string[] = [];
      const values: unknown[] = [];

      for (const field of allowedFields) {
        if (field in body) {
          const snakeField = field.replace(/([A-Z])/g, "_$1").toLowerCase();
          updates.push(`${snakeField} = ${values.length + 1}`);
          values.push(body[field]);
        }
      }

      updates.push(`updated_at = now()`);

      if (updates.length === 1) {
        return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
      }

      const query = sql`
        UPDATE project_media
        SET ${sql.raw(updates.join(", "))}
        WHERE id = ${mediaId}
          AND project_id = ${id}
          AND creator_id = ${user.id}
        RETURNING *
      `;

      const result = await db.execute(query);

      if (!result.rows[0]) {
        return NextResponse.json({ error: "Media not found." }, { status: 404 });
      }

      // If this is being set as cover, update project's cover_media_id
      if (body.isCover === true) {
        await db.execute(sql`
          UPDATE projects
          SET cover_media_id = ${mediaId}, updated_at = now()
          WHERE id = ${id} AND creator_id = ${user.id}
        `);

        // Unset other covers for this project
        await db.execute(sql`
          UPDATE project_media
          SET is_cover = false, updated_at = now()
          WHERE project_id = ${id} AND id != ${mediaId} AND creator_id = ${user.id}
        `);
      }

      return NextResponse.json({ media: result.rows[0] });
    } catch (error) {
      console.error("PATCH /api/projects/[id]/media/[mediaId] error:", error);
      return NextResponse.json({ error: "Failed to update project media." }, { status: 500 });
    }
  });
}

export async function DELETE(_request: Request, context: Context) {
  return withCreatorApi(_request, async (_req, user) => {
    try {
      const { id, mediaId } = await context.params;

      if (!id || !mediaId) {
        return NextResponse.json({ error: "Project ID and Media ID are required." }, { status: 400 });
      }

      // Verify project ownership
      const projectCheck = await db.execute(sql`
        SELECT id, cover_media_id FROM projects WHERE id = ${id} AND creator_id = ${user.id}
      `);

      const project = projectCheck.rows[0];

      if (!project) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }

      // Verify media ownership and get media info for storage cleanup
      const mediaCheck = await db.execute(sql`
        SELECT id, storage_path, original_path, display_path, thumbnail_path, watermark_path
        FROM project_media
        WHERE id = ${mediaId} AND project_id = ${id} AND creator_id = ${user.id}
      `);

      const media = mediaCheck.rows[0];

      if (!media) {
        return NextResponse.json({ error: "Media not found." }, { status: 404 });
      }

      // Delete from database
      await db.execute(sql`
        DELETE FROM project_media
        WHERE id = ${mediaId}
          AND project_id = ${id}
          AND creator_id = ${user.id}
      `);

      // If this was the cover, clear project's cover_media_id
      if (project.cover_media_id === mediaId) {
        await db.execute(sql`
          UPDATE projects
          SET cover_media_id = NULL, updated_at = now()
          WHERE id = ${id} AND creator_id = ${user.id}
        `);
      }

      // Attempt to delete from storage (non-blocking)
      try {
        const storage = getGalleryStorage();
        const paths = [
          media.storage_path,
          media.original_path,
          media.display_path,
          media.thumbnail_path,
          media.watermark_path,
        ].filter((path): path is string => typeof path === 'string' && path.length > 0);

        for (const path of paths) {
          await storage.deleteObject(path).catch((e) => console.warn("Storage delete failed:", e));
        }
      } catch (storageError) {
        console.warn("Storage cleanup failed:", storageError);
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("DELETE /api/projects/[id]/media/[mediaId] error:", error);
      return NextResponse.json({ error: "Failed to delete project media." }, { status: 500 });
    }
  });
}
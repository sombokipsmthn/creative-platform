import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { withCreatorApi } from "@/lib/api/route-boundaries";

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

      const projectResult = await db.execute(sql`
        SELECT
          p.*,
          c.name AS client_name,
          c.company AS client_company,
          c.email AS client_email,
          c.location AS client_location,
          c.website AS client_website,
          pm.id AS media_id,
          pm.display_url AS cover_display_url,
          pm.thumbnail_url AS cover_thumbnail_url,
          pm.alt_text AS cover_alt_text,
          pm.caption AS cover_caption
        FROM projects p
        LEFT JOIN clients c ON c.id = p.client_id
        LEFT JOIN project_media pm ON pm.id = p.cover_media_id
        WHERE p.id = ${id}
          AND p.creator_id = ${user.id}
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
        WHERE project_id = ${id}
        ORDER BY sort_order ASC, created_at ASC
      `);

      return NextResponse.json({
        project: {
          ...project,
          media: mediaResult.rows,
        },
      });
    } catch (error) {
      console.error("GET /api/projects/[id] error:", error);
      return NextResponse.json({ error: "Failed to fetch project." }, { status: 500 });
    }
  });
}

export async function PATCH(request: Request, context: Context) {
  return withCreatorApi(request, async (_req, user) => {
    try {
      const { id } = await context.params;

      if (!id) {
        return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
      }

      const body = await request.json();

      // Build dynamic update query
      const allowedFields = [
        "name",
        "description",
        "shortDescription",
        "slug",
        "category",
        "year",
        "location",
        "services",
        "disciplines",
        "collaborators",
        "role",
        "scopeOfWork",
        "deliverables",
        "totalAmount",
        "currency",
        "paymentTerms",
        "revisionsPolicy",
        "licensingTerms",
        "noticePeriod",
        "storyOverview",
        "storyChallenge",
        "storyApproach",
        "storyOutcome",
        "storyCredits",
        "status",
        "visibility",
        "featured",
        "coverMediaId",
        "startDate",
        "endDate",
        "clientId",
      ];

      const updates: string[] = [];
      const values: unknown[] = [];

      for (const field of allowedFields) {
        if (field in body) {
          const snakeField = field.replace(/([A-Z])/g, "_$1").toLowerCase();
          updates.push(`${snakeField} = ${values.length + 1}`);
          values.push(body[field]);
        }
      }

      // Always update updatedAt
      updates.push(`updated_at = now()`);

      if (updates.length === 1) {
        return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
      }

      // Handle slug uniqueness
      if (body.slug !== undefined) {
        const slug = String(body.slug).trim().toLowerCase();
        if (slug) {
          // Check if slug is already taken by another project
          const existing = await db.execute(sql`
            SELECT id FROM projects WHERE slug = ${slug} AND id != ${id} AND creator_id = ${user.id}
          `);
          if (existing.rows.length > 0) {
            return NextResponse.json({ error: "Slug already in use." }, { status: 409 });
          }
        }
      }

      // Build query with parameterized values
      const query = sql`
        UPDATE projects
        SET ${sql.raw(updates.join(", "))}
        WHERE id = ${id}
          AND creator_id = ${user.id}
        RETURNING *
      `;

      const result = await db.execute(query);

      if (!result.rows[0]) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }

      return NextResponse.json({ project: result.rows[0] });
    } catch (error) {
      console.error("PATCH /api/projects/[id] error:", error);
      return NextResponse.json({ error: "Failed to update project." }, { status: 500 });
    }
  });
}

export async function DELETE(_request: Request, context: Context) {
  return withCreatorApi(_request, async (_req, user) => {
    try {
      const { id } = await context.params;

      if (!id) {
        return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
      }

      const result = await db.execute(sql`
        DELETE FROM projects
        WHERE id = ${id}
          AND creator_id = ${user.id}
        RETURNING id
      `);

      if (!result.rows[0]) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("DELETE /api/projects/[id] error:", error);
      return NextResponse.json({ error: "Failed to delete project." }, { status: 500 });
    }
  });
}
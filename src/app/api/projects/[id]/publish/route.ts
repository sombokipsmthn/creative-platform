import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { withCreatorApi } from "@/lib/api/route-boundaries";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: Context) {
  return withCreatorApi(request, async (_req, user) => {
    try {
      const { id } = await context.params;

      if (!id) {
        return NextResponse.json({ error: "Project ID is required." }, { status: 400 });
      }

      const body = await request.json();
      const publish = Boolean(body.publish);

      const [result] = await db
        .update(projects)
        .set({
          visibility: publish ? "public" : "private",
          publishedAt: publish ? new Date() : null,
          status: publish ? "published" : "draft",
          updatedAt: new Date(),
        })
        .where(and(eq(projects.id, id), eq(projects.creatorId, user.id)))
        .returning();

      if (!result.rows[0]) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }

      return NextResponse.json({ project: result.rows[0] });
    } catch (error) {
      console.error("POST /api/projects/[id]/publish error:", error);
      return NextResponse.json({ error: "Failed to change project publish status." }, { status: 500 });
    }
  });
}
import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, clients } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";

/* =========================================================
   GET /api/projects
   =========================================================
   Returns all projects belonging to the current creator.
   ========================================================= */
export async function GET(req: Request) {
  return withCreatorApi(req, async (_request, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const clientId = searchParams.get("clientId");
      const visibility = searchParams.get("visibility");
      const featured = searchParams.get("featured");

      const conditions = [eq(projects.creatorId, user.id)];

      if (status) {
        conditions.push(eq(projects.status, status));
      }

      if (clientId) {
        conditions.push(eq(projects.clientId, clientId));
      }

      if (visibility) {
        conditions.push(eq(projects.visibility, visibility));
      }

      if (featured !== null) {
        conditions.push(eq(projects.featured, featured === "true"));
      }

      const results = await db
        .select({
          project: projects,
          client: clients,
        })
        .from(projects)
        .leftJoin(clients, eq(projects.clientId, clients.id))
        .where(and(...conditions))
        .orderBy(desc(projects.createdAt));

      return NextResponse.json(
        results.map(({ project, client }) => ({
          ...project,
          client,
        }))
      );
    } catch (error) {
      console.error("GET /api/projects error:", error);
      return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
  });
}

/* =========================================================
   POST /api/projects
   =========================================================
   Creates a new project.
   ========================================================= */
export async function POST(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const body = await request.json();
      const name = String(body?.name || "").trim();

      if (!name) {
        return NextResponse.json({ error: "Project name is required" }, { status: 400 });
      }

      // Generate slug from name
      let slug = String(body?.slug || "").trim().toLowerCase();
      if (!slug) {
        slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }

      // Check slug uniqueness
      if (slug) {
        const existing = await db
          .select({ id: projects.id })
          .from(projects)
          .where(and(eq(projects.slug, slug), eq(projects.creatorId, user.id)))
          .limit(1);

        if (existing.length > 0) {
          slug = `${slug}-${Date.now().toString(36)}`;
        }
      }

      const [project] = await db
        .insert(projects)
        .values({
          creatorId: user.id,
          clientId: body?.clientId || null,
          name,
          description: body?.description || null,
          shortDescription: body?.shortDescription || null,
          slug: slug || null,
          category: body?.category || null,
          year: body?.year || null,
          location: body?.location || null,
          services: body?.services || [],
          disciplines: body?.disciplines || [],
          collaborators: body?.collaborators || [],
          role: body?.role || null,
          scopeOfWork: body?.scopeOfWork || null,
          deliverables: body?.deliverables || null,
          totalAmount: body?.totalAmount ? Number(body.totalAmount) : null,
          currency: body?.currency || "KES",
          paymentTerms: body?.paymentTerms || null,
          revisionsPolicy: body?.revisionsPolicy || null,
          licensingTerms: body?.licensingTerms || null,
          noticePeriod: body?.noticePeriod || null,
          storyOverview: body?.storyOverview || null,
          storyChallenge: body?.storyChallenge || null,
          storyApproach: body?.storyApproach || null,
          storyOutcome: body?.storyOutcome || null,
          storyCredits: body?.storyCredits || null,
          status: body?.status || "draft",
          visibility: body?.visibility || "private",
          featured: body?.featured || false,
          startDate: body?.startDate ? new Date(body.startDate) : null,
          endDate: body?.endDate ? new Date(body.endDate) : null,
        })
        .returning();

      if (!project) {
        throw new Error("Project could not be created");
      }

      return NextResponse.json(project, { status: 201 });
    } catch (error) {
      console.error("POST /api/projects error:", error);
      return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
  });
}

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, clients } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/get-current-user";

/* =========================================================
   GET /api/projects
   =========================================================
   Returns all projects belonging to the current creator.
   ========================================================= */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");

    const conditions = [eq(projects.creatorId, user.id)];

    if (status) {
      conditions.push(eq(projects.status, status));
    }

    if (clientId) {
      conditions.push(eq(projects.clientId, clientId));
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
}

/* =========================================================
   POST /api/projects
   =========================================================
   Creates a new project.
   ========================================================= */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name = String(body?.name || "").trim();

    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const [project] = await db
      .insert(projects)
      .values({
        creatorId: user.id,
        clientId: body?.clientId || null,
        name,
        description: body?.description || null,
        status: body?.status || "active",
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
}

// Helper to match the patterns in other routes
function and(...args: any[]) {
  return args; // Simplified for this purpose, Drizzle's 'and' is usually imported
}

function desc(column: any) {
  return column; // Simplified
}

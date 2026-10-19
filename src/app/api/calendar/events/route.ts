import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { clients, projects, studioEvents } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";

function parseDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

async function validateRelations(userId: string, clientId: string | null, projectId: string | null) {
  if (clientId) {
    const client = await db.query.clients.findFirst({ where: and(eq(clients.id, clientId), eq(clients.creatorId, userId)) });
    if (!client) return "Client not found";
  }
  if (projectId) {
    const project = await db.query.projects.findFirst({ where: and(eq(projects.id, projectId), eq(projects.creatorId, userId)) });
    if (!project) return "Project not found";
  }
  return null;
}

export async function GET(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    const events = await db.query.studioEvents.findMany({
      where: eq(studioEvents.creatorId, user.id),
      orderBy: (table, { asc }) => [asc(table.startsAt)],
    });
    return events;
  });
}

export async function POST(request: Request) {
  return withCreatorApi(request, async (request, user) => {
    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const startsAt = parseDate(body?.startsAt);
    const endsAt = body?.endsAt ? parseDate(body.endsAt) : null;
    const clientId = typeof body?.clientId === "string" && body.clientId ? body.clientId : null;
    const projectId = typeof body?.projectId === "string" && body.projectId ? body.projectId : null;

    if (!title || !startsAt) return NextResponse.json({ error: "Title and a valid start date are required" }, { status: 400 });
    if (body?.endsAt && !endsAt) return NextResponse.json({ error: "End date must be valid" }, { status: 400 });
    if (endsAt && endsAt < startsAt) return NextResponse.json({ error: "End date cannot precede start date" }, { status: 400 });

    const relationError = await validateRelations(user.id, clientId, projectId);
    if (relationError) return NextResponse.json({ error: relationError }, { status: 400 });

    const [event] = await db.insert(studioEvents).values({
      creatorId: user.id,
      clientId,
      projectId,
      title,
      description: typeof body?.description === "string" ? body.description.trim() || null : null,
      eventType: typeof body?.eventType === "string" ? body.eventType.trim() || "client_event" : "client_event",
      status: typeof body?.status === "string" ? body.status.trim() || "planned" : "planned",
      startsAt,
      endsAt,
      allDay: Boolean(body?.allDay),
      location: typeof body?.location === "string" ? body.location.trim() || null : null,
    }).returning();

    return NextResponse.json(event, { status: 201 });
  }, { status: 201 });
}

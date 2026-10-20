import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { clients, projects, studioEvents } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";

function parseDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

async function validateRelations(userId: string, clientId: string | null, projectId: string | null) {
  if (clientId && !(await db.query.clients.findFirst({ where: and(eq(clients.id, clientId), eq(clients.creatorId, userId)) }))) return "Client not found";
  if (projectId && !(await db.query.projects.findFirst({ where: and(eq(projects.id, projectId), eq(projects.creatorId, userId)) }))) return "Project not found";
  return null;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return withCreatorApi(request, async (request, user) => {
    const { id } = await context.params;
    const existing = await db.query.studioEvents.findFirst({ where: and(eq(studioEvents.id, id), eq(studioEvents.creatorId, user.id)) });
    if (!existing) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const body = await request.json();
    const startsAt = body?.startsAt === undefined ? existing.startsAt : parseDate(body.startsAt);
    const endsAt = body?.endsAt === undefined ? existing.endsAt : (body.endsAt ? parseDate(body.endsAt) : null);
    const clientId = body?.clientId === undefined ? existing.clientId : (body.clientId || null);
    const projectId = body?.projectId === undefined ? existing.projectId : (body.projectId || null);
    if (!startsAt || (body?.endsAt && !endsAt) || (endsAt && endsAt < startsAt)) return NextResponse.json({ error: "Invalid event dates" }, { status: 400 });

    const relationError = await validateRelations(user.id, clientId, projectId);
    if (relationError) return NextResponse.json({ error: relationError }, { status: 400 });

    const [event] = await db.update(studioEvents).set({
      clientId,
      projectId,
      title: typeof body?.title === "string" ? body.title.trim() || existing.title : existing.title,
      description: body?.description === undefined ? existing.description : (body.description || null),
      eventType: body?.eventType === undefined ? existing.eventType : body.eventType,
      status: body?.status === undefined ? existing.status : body.status,
      startsAt,
      endsAt,
      allDay: body?.allDay === undefined ? existing.allDay : Boolean(body.allDay),
      location: body?.location === undefined ? existing.location : (body.location || null),
      updatedAt: new Date(),
    }).where(and(eq(studioEvents.id, id), eq(studioEvents.creatorId, user.id))).returning();
    return NextResponse.json(event);
  });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  return withCreatorApi(request, async (_request, user) => {
    const { id } = await context.params;
    const [event] = await db.delete(studioEvents).where(and(eq(studioEvents.id, id), eq(studioEvents.creatorId, user.id))).returning();
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    return NextResponse.json({ deleted: true, id: event.id });
  });
}

import { NextResponse } from "next/server";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { calendarEvents, clients, projects } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";
import crypto from "node:crypto";

function clean(value: unknown) { const text = typeof value === "string" ? value.trim() : ""; return text || null; }
function dateValue(value: unknown) { const date = new Date(String(value ?? "")); return Number.isNaN(date.getTime()) ? null : date; }

export async function GET(request: Request) {
  return withCreatorApi(request, async (req, user) => {
    const params = new URL(req.url).searchParams;
    const start = dateValue(params.get("start"));
    const end = dateValue(params.get("end"));
    if (!start || !end) return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 });
    const rows = await db.select({ event: calendarEvents, client: clients, project: projects }).from(calendarEvents).leftJoin(clients, eq(calendarEvents.clientId, clients.id)).leftJoin(projects, eq(calendarEvents.projectId, projects.id)).where(and(eq(calendarEvents.creatorId, user.id), lte(calendarEvents.startDate, end), gte(calendarEvents.endDate, start))).orderBy(calendarEvents.startDate);
    return rows.map(({ event, client, project }) => ({ ...event, client, project, sourceType: "calendar", sourceId: event.id, allDay: false, category: event.eventType, status: "scheduled", startDate: event.startDate, endDate: event.endDate, isTentative: false }));
  });
}

export async function POST(request: Request) {
  return withCreatorApi(request, async (_req, user) => {
    const body = await request.json(); const title = clean(body?.title); const startDate = dateValue(body?.startDate); const endDate = dateValue(body?.endDate || body?.startDate);
    if (!title) return NextResponse.json({ error: "Event title is required" }, { status: 400 });
    if (!startDate || !endDate) return NextResponse.json({ error: "Valid start and end dates are required" }, { status: 400 });
    if (endDate < startDate) return NextResponse.json({ error: "End date must be after the start date" }, { status: 400 });
    const clientId = clean(body?.clientId); const projectId = clean(body?.projectId);
    if (clientId && !(await db.query.clients.findFirst({ where: and(eq(clients.id, clientId), eq(clients.creatorId, user.id)) }))) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    if (projectId && !(await db.query.projects.findFirst({ where: and(eq(projects.id, projectId), eq(projects.creatorId, user.id)) }))) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    const [event] = await db.insert(calendarEvents).values({ id: crypto.randomUUID(), creatorId: user.id, clientId, projectId, title, description: clean(body?.description), startDate, endDate, location: clean(body?.location), eventType: clean(body?.eventType) || "appointment" }).returning();
    if (!event) return NextResponse.json({ error: "Event could not be created" }, { status: 500 });
    return NextResponse.json(event, { status: 201 });
  }, { status: 201 });
}

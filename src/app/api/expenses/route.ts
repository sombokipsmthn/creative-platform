import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { expenses, projects } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";
import crypto from "node:crypto";

function clean(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function parseAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount) : null;
}

export async function GET(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    const rows = await db
      .select({ expense: expenses, project: projects })
      .from(expenses)
      .leftJoin(projects, eq(expenses.projectId, projects.id))
      .where(eq(expenses.creatorId, user.id))
      .orderBy(desc(expenses.expenseDate), desc(expenses.createdAt));

    return rows.map(({ expense, project }) => ({ ...expense, project }));
  });
}

export async function POST(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    const body = await request.json();
    const description = clean(body?.description);
    const category = clean(body?.category);
    const amount = parseAmount(body?.amount);
    const taxAmount = parseAmount(body?.taxAmount ?? 0);
    const expenseDate = body?.expenseDate ? new Date(String(body.expenseDate)) : new Date();

    if (!description) return NextResponse.json({ error: "Description is required" }, { status: 400 });
    if (!category) return NextResponse.json({ error: "Category is required" }, { status: 400 });
    if (amount === null || amount <= 0) return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
    if (taxAmount === null || taxAmount < 0) return NextResponse.json({ error: "Tax amount cannot be negative" }, { status: 400 });
    if (Number.isNaN(expenseDate.getTime())) return NextResponse.json({ error: "Expense date is invalid" }, { status: 400 });

    const projectId = clean(body?.projectId);
    if (projectId) {
      const project = await db.query.projects.findFirst({ where: and(eq(projects.id, projectId), eq(projects.creatorId, user.id)) });
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const [expense] = await db.insert(expenses).values({
      id: crypto.randomUUID(),
      creatorId: user.id,
      projectId,
      description,
      supplier: clean(body?.supplier),
      category,
      amount,
      currency: clean(body?.currency)?.toUpperCase() || "KES",
      expenseDate,
      paymentMethod: clean(body?.paymentMethod),
      taxAmount,
      notes: clean(body?.notes),
    }).returning();

    if (!expense) return NextResponse.json({ error: "Expense could not be created" }, { status: 500 });
    return NextResponse.json(expense, { status: 201 });
  }, { status: 201 });
}

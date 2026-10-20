import { NextResponse } from "next/server";
import { withCreatorApi } from "@/lib/api/route-boundaries";
import { createTermAmendment, getInvoicePaymentSummary, listPaymentAudit, listSchedules, listTermAmendments, saveSchedule } from "@/lib/services/payments";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  return withCreatorApi(request, async (_request, user) => {
    const { id } = await context.params;
    const mode = new URL(request.url).searchParams.get("view");
    if (mode === "audit") return listPaymentAudit(user.id, id);
    if (mode === "schedules") return listSchedules(user.id, id);
    if (mode === "terms") return listTermAmendments(user.id, id);
    return getInvoicePaymentSummary(user.id, id);
  });
}

export async function POST(request: Request, context: RouteContext) {
  return withCreatorApi(request, async (request, user) => {
    const { id } = await context.params;
    const body = await request.json();
    if (body?.type === "term_amendment") return createTermAmendment(user.id, id, body);
    if (body?.type === "schedule") return saveSchedule(user.id, id, body);
    return NextResponse.json({ error: "Unsupported invoice payment operation" }, { status: 400 });
  }, { status: 201 });
}

import { NextResponse } from "next/server";
import { withCreatorApi } from "@/lib/api/route-boundaries";
import { refundPayment, reversePayment, updatePaymentMetadata, verifyPayment } from "@/lib/services/payments";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  return withCreatorApi(request, async (request, user) => updatePaymentMetadata(user.id, (await context.params).id, await request.json()));
}

export async function POST(request: Request, context: RouteContext) {
  return withCreatorApi(request, async (request, user) => {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const action = body?.action;
    if (action === "verify") return verifyPayment(user.id, id);
    if (action === "reverse") return reversePayment(user.id, id, body?.reason);
    if (action === "refund") return refundPayment(user.id, id, body?.reason);
    return NextResponse.json({ error: "Unsupported payment action" }, { status: 400 });
  });
}

import { NextResponse } from "next/server";
import { withCreatorApi } from "@/lib/api/route-boundaries";
import { listPaymentsForCreator, recordPayment } from "@/lib/services/payments";

export async function GET(request: Request) {
  return withCreatorApi(request, async (request, user) => {
    const search = new URL(request.url).searchParams;
    return listPaymentsForCreator(user.id, { status: search.get("status"), invoiceId: search.get("invoiceId"), clientId: search.get("clientId") });
  });
}

export async function POST(request: Request) {
  return withCreatorApi(request, async (request, user) => {
    return recordPayment(user.id, await request.json());
  }, { status: 201 });
}

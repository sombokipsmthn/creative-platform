import { withCreatorApi } from "@/lib/api/route-boundaries";
import { getPaymentSummary, listPaymentsForCreator, recordPayment } from "@/lib/services/payments";

export async function GET(request: Request) {
  return withCreatorApi(request, async (request, user) => {
    const search = new URL(request.url).searchParams;
    if (search.get("view") === "summary") return getPaymentSummary(user.id);
    return listPaymentsForCreator(user.id, { status: search.get("status"), invoiceId: search.get("invoiceId"), clientId: search.get("clientId"), method: search.get("method"), search: search.get("search"), from: search.get("from"), to: search.get("to") });
  });
}

export async function POST(request: Request) {
  return withCreatorApi(request, async (request, user) => {
    return recordPayment(user.id, await request.json());
  }, { status: 201 });
}

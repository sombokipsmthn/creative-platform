import { withCreatorApi } from "@/lib/api/route-boundaries";
import { getInvoicePaymentSummary } from "@/lib/services/payments";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  return withCreatorApi(request, async (_request, user) => {
    const { id } = await context.params;
    return getInvoicePaymentSummary(user.id, id);
  });
}

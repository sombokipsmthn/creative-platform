import { withCreatorApi } from "@/lib/api/route-boundaries";
import {
  createInvoiceForCreator,
  listInvoicesForCreator,
  updateInvoiceStatusForCreator,
} from "@/lib/services/invoices";

/*
|--------------------------------------------------------------------------
| GET /api/invoices
|--------------------------------------------------------------------------
|
| Returns invoices belonging to the current creator.
|
*/

export async function GET(req: Request) {
  return withCreatorApi(req, async (request, user) => {
    const { searchParams } = new URL(request.url);

    return listInvoicesForCreator({
      userId: user.id,
      status: searchParams.get("status"),
      clientId: searchParams.get("clientId"),
      currency: searchParams.get("currency"),
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 20),
    });
  });
}

/*
|--------------------------------------------------------------------------
| PATCH /api/invoices
|--------------------------------------------------------------------------
|
| Updates invoice status.
|
*/

export async function PATCH(req: Request) {
  return withCreatorApi(req, async (_request, user) => {
    const body = await req.json();

    return updateInvoiceStatusForCreator({
      userId: user.id,
      invoiceId: body.invoiceId,
      status: body.status,
    });
  });
}

/*
|--------------------------------------------------------------------------
| POST /api/invoices
|--------------------------------------------------------------------------
|
| Supports manual invoice creation and quote-to-invoice conversion.
|
*/

export async function POST(req: Request) {
  return withCreatorApi(
    req,
    async (request, user) => {
      const body = await request.json();

      return createInvoiceForCreator({
        userId: user.id,
        payload: body,
      });
    },
    { status: 201 }
  );
}

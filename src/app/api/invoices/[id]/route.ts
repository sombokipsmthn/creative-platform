import { withCreatorApi } from "@/lib/api/route-boundaries";
import {
  getInvoiceForCreator,
  updateInvoiceStatusForCreator,
} from "@/lib/services/invoices";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/*
|--------------------------------------------------------------------------
| GET /api/invoices/[id]
|--------------------------------------------------------------------------
|
| Returns invoice data for the current creator.
|
*/

export async function GET(
  req: Request,
  context: RouteContext
) {
  return withCreatorApi(req, async (_request, user) => {
    const { id } = await context.params;

    return getInvoiceForCreator({
      userId: user.id,
      id,
    });
  });
}

/*
|--------------------------------------------------------------------------
| PATCH /api/invoices/[id]
|--------------------------------------------------------------------------
|
| Supports invoice lifecycle updates via the shared service layer.
|
*/

export async function PATCH(
  req: Request,
  context: RouteContext
) {
  return withCreatorApi(req, async (request, user) => {
    const { id } = await context.params;
    const body = await request.json();

    return updateInvoiceStatusForCreator({
      userId: user.id,
      invoiceId: id,
      status: body?.status,
    });
  });
}

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
|
| Treat PUT the same as PATCH so clients using either convention
| can update the invoice lifecycle.
|
*/

export async function PUT(
  req: Request,
  context: RouteContext
) {
  return PATCH(req, context);
}
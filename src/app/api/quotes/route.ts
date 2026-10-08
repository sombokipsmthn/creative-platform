import { withCreatorApi } from "@/lib/api/route-boundaries";
import { calculateTotals, normalizeCurrency, normalizeItems, normalizeStatus } from "@/lib/services/quotes";

import {
  createQuoteForCreator,
  listQuotesForCreator,
} from "@/lib/services/quotes";
/*
|--------------------------------------------------------------------------
| GET /api/quotes
|--------------------------------------------------------------------------
| Fetch quotes belonging directly to the authenticated creator.
|
| clientId is optional. A quote does NOT need a client to exist.
|--------------------------------------------------------------------------
*/

export async function GET(req: Request) {
  return withCreatorApi(req, async (request, user) => {
    const { searchParams } = new URL(request.url);

    return listQuotesForCreator({
      userId: user.id,
      status: searchParams.get("status"),
      clientId: searchParams.get("clientId"),
    });
  });
}

/*
|--------------------------------------------------------------------------
| POST /api/quotes
|--------------------------------------------------------------------------
| Create a quote owned directly by the authenticated creator.
|
| clientId remains optional.
|--------------------------------------------------------------------------
*/

export async function POST(req: Request) {
  return withCreatorApi(
    req,
    async (request, user) => {
      const body = await request.json();
      return createQuoteForCreator({
        userId: user.id,
        payload: body,
      });
    },
    { status: 201 }
  );
}
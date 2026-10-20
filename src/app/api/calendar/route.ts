import { NextResponse } from "next/server";

import { withCreatorApi } from "@/lib/api/route-boundaries";
import {
  listCalendarEventsForCreator,
  normalizeCalendarCategory,
  parseCalendarRange,
} from "@/lib/services/calendar";

export async function GET(req: Request) {
  return withCreatorApi(req, async (request, user) => {
    const { searchParams } = new URL(request.url);
    const range = parseCalendarRange(searchParams.get("start"), searchParams.get("end"));

    if (!range) {
      return NextResponse.json(
        { error: "Valid start and end dates are required" },
        { status: 400 },
      );
    }

    const rawCategory = searchParams.get("category");
    const category = normalizeCalendarCategory(rawCategory);

    if (rawCategory && !category) {
      return NextResponse.json(
        { error: "Invalid calendar category" },
        { status: 400 },
      );
    }

    try {
      const events = await listCalendarEventsForCreator(user.id, {
        range,
        category,
        clientId: searchParams.get("clientId") || undefined,
        projectId: searchParams.get("projectId") || undefined,
      });

      return NextResponse.json(events);
    } catch (error) {
      console.error("GET /api/calendar error:", error);
      return NextResponse.json(
        { error: "Failed to fetch calendar data" },
        { status: 500 },
      );
    }
  });
}

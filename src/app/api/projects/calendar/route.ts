import { NextResponse } from "next/server";
import { and, eq, gte, lte, or } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import getCurrentUser from "@/lib/auth/get-current-user";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // Format: YYYY-MM
    const year = searchParams.get("year");

    if (!month || !year) {
      return NextResponse.json({ error: "Month and year are required" }, { status: 400 });
    }

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const results = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.creatorId, user.id),
          or(
            and(
              gte(projects.startDate, startDate),
              lte(projects.startDate, endDate)
            ),
            and(
              gte(projects.endDate, startDate),
              lte(projects.endDate, endDate)
            ),
            and(
              lte(projects.startDate, startDate),
              gte(projects.endDate, endDate)
            )
          )
        )
      );

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/projects/calendar error:", error);
    return NextResponse.json({ error: "Failed to fetch calendar projects" }, { status: 500 });
  }
}

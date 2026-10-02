import { NextResponse } from "next/server";
import { and, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { invoices } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";

export async function GET(req: Request) {
  return withCreatorApi(req, async (_request, user) => {
    const start = new Date();
    start.setMonth(start.getMonth() - 11);
    start.setDate(1);
    start.setHours(0,0,0,0);


    const rows = await db
      .select({
        month: sql<string>`
          to_char(${invoices.issueDate}, 'Mon')
        `,
        revenue: sql<number>`
          COALESCE(SUM(${invoices.total}),0)
        `,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.creatorId, user.id),
          eq(invoices.status, "paid"),
          gte(invoices.issueDate, start),
          lt(invoices.issueDate, new Date())
        )
      )
      .groupBy(
        sql`to_char(${invoices.issueDate}, 'Mon')`
      );


    return NextResponse.json({
      months: rows.map((row)=>({
        month: row.month,
        revenue: Number(row.revenue)
      }))
    });


  });
}

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { invoices, users } from "@/db/schema";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.authUserId, userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Creator account not found" },
        { status: 404 }
      );
    }


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


  } catch(error){

    console.error(
      "Revenue API error:",
      error
    );


    return NextResponse.json(
      {
        error:"Failed to load revenue data"
      },
      {
        status:500
      }
    );
  }
}
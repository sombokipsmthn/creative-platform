import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(
  request: Request,
  context: Context
) {
  try {
    const { slug } =
      await context.params;

    const body =
      await request.json();

    const pin =
      typeof body.pin === "string"
        ? body.pin.trim()
        : "";

    const result =
      await db.execute(sql`
        SELECT id
        FROM galleries
        WHERE slug = ${slug}
          AND status = 'published'
          AND access_pin = ${pin}
        LIMIT 1
      `);

    if (!result.rows[0]) {
      return NextResponse.json(
        {
          error:
            "Incorrect PIN.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * V1 access verification.
     *
     * For production we should replace
     * this with a signed, HttpOnly session
     * cookie so the PIN isn't repeatedly
     * sent by the client.
     */

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "POST public gallery access",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to verify PIN.",
      },
      {
        status: 500,
      }
    );
  }
}
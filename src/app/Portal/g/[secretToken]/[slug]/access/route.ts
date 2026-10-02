import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { comparePin } from "@/lib/gallery/pin";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(
  request: Request,
  context: Context
) {
  try {
    const { slug } = await context.params;

    const body = await request.json();

    const pin =
      typeof body.pin === "string"
        ? body.pin.trim()
        : "";

    if (!slug || !pin) {
      return NextResponse.json(
        { error: "Gallery slug and PIN are required." },
        { status: 400 },
      );
    }

    const ip = clientKey(request);

    /*
     * -------------------------------------------------------
     * Rate limiting
     * -------------------------------------------------------
     *
     * Track failed attempts per IP per gallery. After
     * MAX_ATTEMPTS failures the IP is locked out for
     * LOCKOUT_MINUTES to slow brute-force attacks.
     */

    const attemptRow = (
      await db.execute(sql`
        SELECT id, attempt_count, lockout_until
        FROM gallery_access_attempts
        WHERE gallery_id = (
          SELECT id FROM galleries
          WHERE slug = ${slug} AND status = 'published'
          LIMIT 1
        )
          AND ip_address = ${ip}
        LIMIT 1
      `)
    ).rows[0];

    if (
      attemptRow &&
      attemptRow.lockout_until &&
      new Date(String(attemptRow.lockout_until)).getTime() > Date.now()
    ) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 },
      );
    }

    const result = await db.execute(sql`
      SELECT id, access_pin
      FROM galleries
      WHERE slug = ${slug}
        AND status = 'published'
      LIMIT 1
    `);

    const gallery = result.rows[0];

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 },
      );
    }

    const configuredPin =
      typeof gallery.access_pin === "string"
        ? gallery.access_pin.trim()
        : "";

    /*
     * Galleries without a PIN are automatically accessible.
     */

    if (!configuredPin) {
      return NextResponse.json({
        success: true,
        requiresPin: false,
      });
    }

    /*
     * Verify the submitted PIN against the stored bcrypt hash.
     *
     * The access_pin column stores a bcrypt hash (see hashPin in
     * src/lib/gallery/pin.ts). Direct string comparison is no longer
     * used, which prevents a fail-open if the column ever contains
     * plaintext.
     */

    const isPinValid = await comparePin(pin, configuredPin);

    if (!isPinValid) {
      const nextCount = Number(attemptRow?.attempt_count ?? 0) + 1;
      const lockout =
        nextCount >= MAX_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
          : null;

      if (attemptRow) {
        await db.execute(sql`
          UPDATE gallery_access_attempts
          SET
            attempt_count = ${nextCount},
            last_attempt_at = now(),
            lockout_until = ${lockout}
          WHERE id = ${attemptRow.id}
        `);
      } else {
        await db.execute(sql`
          INSERT INTO gallery_access_attempts (
            gallery_id,
            ip_address,
            attempt_count,
            last_attempt_at,
            lockout_until
          )
          VALUES (
            ${String(gallery.id)},
            ${ip},
            ${nextCount},
            now(),
            ${lockout}
          )
        `);
      }

      return NextResponse.json(
        { error: "Incorrect PIN." },
        { status: 401 },
      );
    }

    /*
     * Successful verification clears any prior failed
     * attempt counter for this IP.
     */

    if (attemptRow) {
      await db.execute(sql`
        UPDATE gallery_access_attempts
        SET
          attempt_count = 0,
          lockout_until = NULL
        WHERE id = ${attemptRow.id}
      `);
    }

    return NextResponse.json({
      success: true,
      requiresPin: true,
    });
  } catch (error) {
    console.error("POST public gallery access", error);

    return NextResponse.json(
      {
        error: "Unable to verify gallery access.",
      },
      {
        status: 500,
      },
    );
  }
}
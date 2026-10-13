import { NextResponse } from "next/server";
import { sql, eq, and } from "drizzle-orm";

import { db } from "@/db";
import { comparePin } from "@/lib/gallery/pin";
import { galleries, galleryAccessAttempts } from "@/db/schema";

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

    const [attemptRowResult] = await db
      .select({
        id: galleryAccessAttempts.id,
        attemptCount: galleryAccessAttempts.attemptCount,
        lockoutUntil: galleryAccessAttempts.lockoutUntil,
      })
      .from(galleryAccessAttempts)
      .innerJoin(
        galleries,
        and(eq(galleryAccessAttempts.galleryId, galleries.id), eq(galleries.status, 'published'))
      )
      .where(
        and(
          eq(galleries.slug, slug),
          eq(galleryAccessAttempts.ipAddress, ip)
        )
      )
      .limit(1);

    const attemptRow = attemptRowResult ? { ...attemptRowResult } : null;

    if (
      attemptRow &&
      attemptRow.lockoutUntil &&
      new Date(attemptRow.lockoutUntil).getTime() > Date.now()
    ) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 },
      );
    }

    const [galleryResult] = await db
      .select({
        id: galleries.id,
        accessPin: galleries.accessPin,
      })
      .from(galleries)
      .where(and(eq(galleries.slug, slug), eq(galleries.status, 'published')))
      .limit(1);

    if (!galleryResult) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 },
      );
    }

    const gallery = galleryResult;

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 },
      );
    }

    const configuredPin =
      typeof gallery.accessPin === "string"
        ? gallery.accessPin.trim()
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
      const nextCount = Number(attemptRow?.attemptCount ?? 0) + 1;
      const lockout =
        nextCount >= MAX_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
          : null;

      if (attemptRow) {
        await db
          .update(galleryAccessAttempts)
          .set({
            attemptCount: nextCount,
            lastAttemptAt: new Date(),
            lockoutUntil: lockout,
          })
          .where(eq(galleryAccessAttempts.id, attemptRow.id));
      } else {
        await db
          .insert(galleryAccessAttempts)
          .values({
            galleryId: gallery.id,
            ipAddress: ip,
            attemptCount: nextCount,
            lastAttemptAt: new Date(),
            lockoutUntil: lockout,
          });
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
      await db
        .update(galleryAccessAttempts)
        .set({
          attemptCount: 0,
          lockoutUntil: null,
        })
        .where(eq(galleryAccessAttempts.id, attemptRow.id));
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
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { createGallerySession } from "@/lib/gallery/session";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(
  request: Request,
  context: Context,
) {
  try {
    const { slug } = await context.params;

    const body = await request.json();

    const pin =
      typeof body.pin === "string"
        ? body.pin.trim()
        : "";

    const result = await db.execute(sql`
      SELECT
        id,
        client_id,
        access_pin,
        expires_at
      FROM galleries
      WHERE (slug = ${slug} OR id::text = ${slug})
      LIMIT 1
    `);

    const gallery = result.rows[0];

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 },
      );
    }

    if (
      gallery.expires_at &&
      new Date(String(gallery.expires_at)).getTime() <= Date.now()
    ) {
      return NextResponse.json(
        {
          error: "Gallery expired.",
          expired: true,
        },
        { status: 410 },
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
      const session = await createGallerySession(
        String(gallery.id),
        gallery.client_id ? String(gallery.client_id) : null,
      );

      return NextResponse.json({
        success: true,
        sessionId: session.id,
        requiresPin: false,
      });
    }

    if (!pin || pin !== configuredPin) {
      return NextResponse.json(
        {
          error: "Incorrect PIN.",
        },
        {
          status: 401,
        },
      );
    }

    /*
     * PIN verified.
     *
     * Only now do we create the authenticated gallery session.
     */
    const session = await createGallerySession(
      String(gallery.id),
      gallery.client_id ? String(gallery.client_id) : null,
    );

    return NextResponse.json({
      success: true,
      sessionId: session.id,
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
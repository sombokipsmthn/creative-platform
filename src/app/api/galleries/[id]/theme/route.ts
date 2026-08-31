import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getOrCreateLocalUser } from "@/lib/auth/get-or-create-local-user";

type Context = {
  params: Promise<{ id: string }>;
};

async function getCreator() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return getOrCreateLocalUser(userId);
}

/**
 * Get theme for a gallery
 */
export async function GET(
  _request: Request,
  context: Context
) {
  try {
    const creator = await getCreator();

    if (!creator) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: galleryId } = await context.params;

    if (!galleryId) {
      return NextResponse.json(
        { error: "Gallery ID is required." },
        { status: 400 }
      );
    }

    // Verify gallery ownership
    const gallery = await db.execute(sql`
      SELECT id FROM galleries
      WHERE id = ${galleryId}
        AND creator_id = ${creator.id}
      LIMIT 1
    `);

    if (!gallery.rows[0]) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 }
      );
    }

    // Get or create default theme
    const result = await db.execute(sql`
      SELECT * FROM gallery_themes
      WHERE gallery_id = ${galleryId}
      LIMIT 1
    `);

    if (result.rows[0]) {
      return NextResponse.json({
        theme: result.rows[0],
      });
    }

    // Create default theme if none exists
    const defaultTheme = await db.execute(sql`
      INSERT INTO gallery_themes (
        gallery_id,
        name,
        type,
        layout,
        accentColor,
        backgroundColor,
        textColor,
        borderRadius,
        showTitle,
        showDescription,
        showCollections,
        masonryColumns,
        aspectRatio
      ) VALUES (
        ${galleryId},
        'Default',
        'preset',
        'masonry',
        '#000000',
        '#ffffff',
        '#000000',
        0,
        true,
        true,
        true,
        4,
        'auto'
      )
      RETURNING *
    `);

    return NextResponse.json({
      theme: defaultTheme.rows[0],
    });
  } catch (error) {
    console.error(
      "GET /api/galleries/[id]/theme failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load theme.",
      },
      { status: 500 }
    );
  }
}

/**
 * Update theme for a gallery
 */
export async function PATCH(
  request: Request,
  context: Context
) {
  try {
    const creator = await getCreator();

    if (!creator) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: galleryId } = await context.params;

    if (!galleryId) {
      return NextResponse.json(
        { error: "Gallery ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Verify gallery ownership
    const gallery = await db.execute(sql`
      SELECT id FROM galleries
      WHERE id = ${galleryId}
        AND creator_id = ${creator.id}
      LIMIT 1
    `);

    if (!gallery.rows[0]) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 }
      );
    }

    // Ensure theme exists
    const existing = await db.execute(sql`
      SELECT id FROM gallery_themes
      WHERE gallery_id = ${galleryId}
      LIMIT 1
    `);

    if (!existing.rows[0]) {
      await db.execute(sql`
        INSERT INTO gallery_themes (
          gallery_id,
          name,
          type,
          layout,
          accentColor,
          backgroundColor,
          textColor,
          borderRadius,
          showTitle,
          showDescription,
          showCollections,
          masonryColumns,
          aspectRatio
        ) VALUES (
          ${galleryId},
          'Default',
          'preset',
          'masonry',
          '#000000',
          '#ffffff',
          '#000000',
          0,
          true,
          true,
          true,
          4,
          'auto'
        )
      `);
    }

    // Update theme
    const result = await db.execute(sql`
      UPDATE gallery_themes
      SET
        name = COALESCE(${body.name ?? null}, name),
        layout = COALESCE(${body.layout ?? null}, layout),
        accentColor = COALESCE(${body.accentColor ?? null}, accent_color),
        backgroundColor = COALESCE(${body.backgroundColor ?? null}, background_color),
        textColor = COALESCE(${body.textColor ?? null}, text_color),
        borderRadius = COALESCE(${body.borderRadius ?? null}, border_radius),
        showTitle = COALESCE(${body.showTitle ?? null}, show_title),
        showDescription = COALESCE(${body.showDescription ?? null}, show_description),
        showCollections = COALESCE(${body.showCollections ?? null}, show_collections),
        masonryColumns = COALESCE(${body.masonryColumns ?? null}, masonry_columns),
        aspectRatio = COALESCE(${body.aspectRatio ?? null}, aspect_ratio),
        customCSS = COALESCE(${body.customCSS ?? null}, custom_css),
        updated_at = now()
      WHERE gallery_id = ${galleryId}
      RETURNING *
    `);

    return NextResponse.json({
      theme: result.rows[0],
    });
  } catch (error) {
    console.error(
      "PATCH /api/galleries/[id]/theme failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update theme.",
      },
      { status: 500 }
    );
  }
}

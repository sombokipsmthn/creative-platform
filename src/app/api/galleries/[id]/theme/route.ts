import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getLocalUser } from "@/lib/auth/get-local-user";
import { getGalleryTheme, isValidThemeId } from "@/lib/gallery/themes";

type Context = {
  params: Promise<{ id: string }>;
};

type ThemeRow = Record<string, unknown>;

async function getCreator() {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    return await getLocalUser(userId);
  } catch (error) {
    console.error("Creator not found for gallery theme route:", error);
    return null;
  }
}

function normalizeTheme(row: ThemeRow | undefined) {
  if (!row) return null;

  return {
    id: String(row.id),
    galleryId: String(row.gallery_id),
    name: String(row.name || "Minimal"),
    type: String(row.type || "preset"),
    layout: String(row.layout || "masonry"),
    accentColor: String(row.accent_color || "#111111"),
    backgroundColor: String(row.background_color || "#ffffff"),
    textColor: String(row.text_color || "#111111"),
    borderRadius: Number(row.border_radius ?? 0),
    showTitle: Boolean(row.show_title),
    showDescription: Boolean(row.show_description),
    showCollections: Boolean(row.show_collections),
    showLogo: Boolean(row.show_logo ?? true),
    masonryColumns: Number(row.masonry_columns ?? 4),
    aspectRatio: String(row.aspect_ratio || "auto"),
    customCSS: row.custom_css ? String(row.custom_css) : null,
    fontFamily: String(row.font_family || "sans"),
    coverStyle: String(row.cover_style || "image"),
    coverFocalX: Number(row.cover_focal_x ?? 50),
    coverFocalY: Number(row.cover_focal_y ?? 50),
    coverOverlayOpacity: Number(row.cover_overlay_opacity ?? 25),
    gridStyle: String(row.grid_style || "masonry"),
    thumbnailSize: String(row.thumbnail_size || "regular"),
    gridSpacing: String(row.grid_spacing || "regular"),
    navigationStyle: String(row.navigation_style || "icons-and-text"),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function verifyGalleryOwnership(galleryId: string, creatorId: string) {
  const result = await db.execute(sql`
    SELECT id, title, description, cover_photo_id, slug
    FROM galleries
    WHERE id = ${galleryId}
      AND creator_id = ${creatorId}
    LIMIT 1
  `);

  return result.rows[0] as ThemeRow | undefined;
}

async function ensureTheme(galleryId: string) {
  const existing = await db.execute(sql`
    SELECT *
    FROM gallery_themes
    WHERE gallery_id = ${galleryId}
    LIMIT 1
  `);

  if (existing.rows[0]) return existing.rows[0] as ThemeRow;

  const preset = getGalleryTheme("minimal").preset;
  const created = await db.execute(sql`
    INSERT INTO gallery_themes (
      gallery_id,
      name,
      type,
      layout,
      accent_color,
      background_color,
      text_color,
      border_radius,
      show_title,
      show_description,
      show_collections,
      show_logo,
      masonry_columns,
      aspect_ratio,
      font_family,
      cover_style,
      cover_focal_x,
      cover_focal_y,
      cover_overlay_opacity,
      grid_style,
      thumbnail_size,
      grid_spacing,
      navigation_style
    ) VALUES (
      ${galleryId},
      ${'Minimal'},
      ${'preset'},
      ${preset.layout},
      ${preset.accentColor},
      ${preset.backgroundColor},
      ${preset.textColor},
      ${preset.borderRadius},
      ${preset.showTitle},
      ${preset.showDescription},
      ${preset.showCollections},
      ${preset.showLogo},
      ${preset.masonryColumns},
      ${preset.aspectRatio},
      ${preset.fontFamily},
      ${preset.coverStyle},
      ${preset.coverFocalX},
      ${preset.coverFocalY},
      ${preset.coverOverlayOpacity},
      ${preset.gridStyle},
      ${preset.thumbnailSize},
      ${preset.gridSpacing},
      ${preset.navigationStyle}
    )
    RETURNING *
  `);

  return created.rows[0] as ThemeRow;
}

export async function GET(_request: Request, context: Context) {
  try {
    const creator = await getCreator();
    if (!creator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: galleryId } = await context.params;
    if (!galleryId) {
      return NextResponse.json({ error: "Gallery ID is required." }, { status: 400 });
    }

    const gallery = await verifyGalleryOwnership(galleryId, creator.id);
    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
    }

    const theme = await ensureTheme(galleryId);
    return NextResponse.json({
      theme: normalizeTheme(theme),
      gallery: {
        id: gallery.id,
        title: gallery.title,
        description: gallery.description,
        coverPhotoId: gallery.cover_photo_id,
        slug: gallery.slug,
      },
    });
  } catch (error) {
    console.error("GET /api/galleries/[id]/theme failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load theme." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const creator = await getCreator();
    if (!creator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: galleryId } = await context.params;
    if (!galleryId) {
      return NextResponse.json({ error: "Gallery ID is required." }, { status: 400 });
    }

    const gallery = await verifyGalleryOwnership(galleryId, creator.id);
    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const current = await ensureTheme(galleryId);
    const requestedPresetId = typeof body.presetId === "string" ? body.presetId : null;
    const preset = requestedPresetId && isValidThemeId(requestedPresetId)
      ? getGalleryTheme(requestedPresetId).preset
      : null;

    const value = <T>(key: string, fallback: T): T => {
      if (Object.prototype.hasOwnProperty.call(body, key)) return body[key] as T;
      return fallback;
    };

    const next = {
      name: value("name", preset ? getGalleryTheme(requestedPresetId!).label : String(current.name || "Custom")),
      type: preset ? "preset" : value("type", "custom"),
      layout: value("layout", preset?.layout ?? String(current.layout || "masonry")),
      accentColor: value("accentColor", preset?.accentColor ?? String(current.accent_color || "#111111")),
      backgroundColor: value("backgroundColor", preset?.backgroundColor ?? String(current.background_color || "#ffffff")),
      textColor: value("textColor", preset?.textColor ?? String(current.text_color || "#111111")),
      borderRadius: value("borderRadius", preset?.borderRadius ?? Number(current.border_radius ?? 0)),
      showTitle: value("showTitle", preset?.showTitle ?? Boolean(current.show_title)),
      showDescription: value("showDescription", preset?.showDescription ?? Boolean(current.show_description)),
      showCollections: value("showCollections", preset?.showCollections ?? Boolean(current.show_collections)),
      showLogo: value("showLogo", preset?.showLogo ?? Boolean(current.show_logo ?? true)),
      masonryColumns: value("masonryColumns", preset?.masonryColumns ?? Number(current.masonry_columns ?? 4)),
      aspectRatio: value("aspectRatio", preset?.aspectRatio ?? String(current.aspect_ratio || "auto")),
      customCSS: value("customCSS", current.custom_css ? String(current.custom_css) : null),
      fontFamily: value("fontFamily", preset?.fontFamily ?? String(current.font_family || "sans")),
      coverStyle: value("coverStyle", preset?.coverStyle ?? String(current.cover_style || "image")),
      coverFocalX: value("coverFocalX", preset?.coverFocalX ?? Number(current.cover_focal_x ?? 50)),
      coverFocalY: value("coverFocalY", preset?.coverFocalY ?? Number(current.cover_focal_y ?? 50)),
      coverOverlayOpacity: value("coverOverlayOpacity", preset?.coverOverlayOpacity ?? Number(current.cover_overlay_opacity ?? 25)),
      gridStyle: value("gridStyle", preset?.gridStyle ?? String(current.grid_style || "masonry")),
      thumbnailSize: value("thumbnailSize", preset?.thumbnailSize ?? String(current.thumbnail_size || "regular")),
      gridSpacing: value("gridSpacing", preset?.gridSpacing ?? String(current.grid_spacing || "regular")),
      navigationStyle: value("navigationStyle", preset?.navigationStyle ?? String(current.navigation_style || "icons-and-text")),
    };

    const result = await db.execute(sql`
      UPDATE gallery_themes
      SET
        name = ${next.name},
        type = ${next.type},
        layout = ${next.layout},
        accent_color = ${next.accentColor},
        background_color = ${next.backgroundColor},
        text_color = ${next.textColor},
        border_radius = ${Number(next.borderRadius)},
        show_title = ${Boolean(next.showTitle)},
        show_description = ${Boolean(next.showDescription)},
        show_collections = ${Boolean(next.showCollections)},
        masonry_columns = ${Math.min(6, Math.max(1, Number(next.masonryColumns)))},
        aspect_ratio = ${next.aspectRatio},
        custom_css = ${next.customCSS},
        font_family = ${next.fontFamily},
        cover_style = ${next.coverStyle},
        cover_focal_x = ${Math.min(100, Math.max(0, Number(next.coverFocalX)))},
        cover_focal_y = ${Math.min(100, Math.max(0, Number(next.coverFocalY)))},
        cover_overlay_opacity = ${Math.min(100, Math.max(0, Number(next.coverOverlayOpacity)))},
        grid_style = ${next.gridStyle},
        thumbnail_size = ${next.thumbnailSize},
        grid_spacing = ${next.gridSpacing},
        navigation_style = ${next.navigationStyle},
        show_logo = ${Boolean(next.showLogo)},
        updated_at = now()
      WHERE gallery_id = ${galleryId}
      RETURNING *
    `);

    return NextResponse.json({ theme: normalizeTheme(result.rows[0] as ThemeRow) });
  } catch (error) {
    console.error("PATCH /api/galleries/[id]/theme failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update theme." },
      { status: 500 },
    );
  }
}

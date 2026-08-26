import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getGalleryStorage, getGalleryStorageProvider } from "@/lib/gallery/storage";
import { getGallerySession } from "@/lib/gallery/session";
import { renderDownloadVariant } from "@/lib/gallery/image-processing";
import { createZip } from "@/lib/gallery/zip";

type Context = { params: Promise<{ slug: string }> };

type Preset = {
  id: string;
  name: string;
  variant: "original" | "display" | "thumbnail" | "watermark";
  max_width: number | null;
  quality: number;
  format: "jpg" | "webp" | "png";
  include_watermark: boolean;
};

function hashIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return crypto
    .createHash("sha256")
    .update(`${process.env.DOWNLOAD_TRACKING_SALT || "gallery"}:${ip}`)
    .digest("hex");
}

function safeName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 160) || "photo.jpg";
}

async function getGallery(slug: string) {
  const result = await db.execute(sql`
    SELECT id, title, allow_downloads, client_id, expires_at
    FROM galleries
    WHERE (slug = ${slug} OR id::text = ${slug})
    LIMIT 1
  `);
  return result.rows[0] || null;
}

async function getPreset(galleryId: string, presetId?: string | null): Promise<Preset> {
  const result = await db.execute(sql`
    SELECT id, name, variant, max_width, quality, format, include_watermark
    FROM gallery_download_presets
    WHERE gallery_id = ${galleryId}
      AND (${presetId || null}::uuid IS NULL OR id = ${presetId || null})
    ORDER BY created_at ASC
    LIMIT 1
  `);

  const row = result.rows[0];
  return {
    id: String(row?.id || ""),
    name: String(row?.name || "Web Delivery"),
    variant: (row?.variant || "display") as Preset["variant"],
    max_width: row?.max_width == null ? 2400 : Number(row.max_width),
    quality: Number(row?.quality || 88),
    format: (row?.format || "jpg") as Preset["format"],
    include_watermark: Boolean(row?.include_watermark),
  };
}

async function getWatermark(galleryId: string) {
  const result = await db.execute(sql`
    SELECT enabled, text, position, opacity, font_size
    FROM gallery_watermarks
    WHERE gallery_id = ${galleryId}
    LIMIT 1
  `);
  const row = result.rows[0];
  return {
    enabled: row?.enabled !== false,
    text: String(row?.text || "KIPSMTHN"),
    position: (row?.position || "bottom-right") as "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center",
    opacity: Number(row?.opacity ?? 55),
    fontSize: Number(row?.font_size ?? 42),
  };
}

async function getSource(
  photo: Record<string, unknown>,
  variant: Preset["variant"],
) {
  const isR2 = getGalleryStorageProvider() === "r2";
  const keyMap: Record<Preset["variant"], string> = {
    original: "original_path",
    display: "display_path",
    thumbnail: "thumbnail_path",
    watermark: "watermark_path",
  };
  const urlMap: Record<Preset["variant"], string> = {
    original: "original_url",
    display: "display_url",
    thumbnail: "thumbnail_url",
    watermark: "watermark_url",
  };

  const path = photo[keyMap[variant]] as string | null;
  const url = photo[urlMap[variant]] as string | null;
  if (!path && !url) return null;

  const storage = getGalleryStorage();
  return storage.getObject(isR2 ? String(path) : String(url));
}

export async function POST(request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const gallery = await getGallery(slug);

    if (!gallery) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
    if (gallery.allow_downloads === false) return NextResponse.json({ error: "Downloads are disabled." }, { status: 403 });
    if (gallery.expires_at && new Date(String(gallery.expires_at)).getTime() <= Date.now()) {
      return NextResponse.json({ error: "Gallery expired." }, { status: 410 });
    }

    const body = await request.json();
    const session = await getGallerySession(String(gallery.id), true, gallery.client_id);
    const preset = await getPreset(String(gallery.id), body.presetId || null);
    const watermark = await getWatermark(String(gallery.id));

    let photoIds: string[] = Array.isArray(body.photoIds) ? body.photoIds : [];

    if (!photoIds.length && body.scope === "selected") {
      const selected = await db.execute(sql`
        SELECT photo_id
        FROM gallery_photo_actions
        WHERE session_id = ${session.id}
          AND gallery_id = ${gallery.id}
          AND is_selected = true
      `);
      photoIds = selected.rows.map((row) => String(row.photo_id));
    }

    if (!photoIds.length && body.scope === "favorites") {
      const favorites = await db.execute(sql`
        SELECT photo_id
        FROM gallery_photo_actions
        WHERE session_id = ${session.id}
          AND gallery_id = ${gallery.id}
          AND is_favorite = true
      `);
      photoIds = favorites.rows.map((row) => String(row.photo_id));
    }

    if (!photoIds.length) {
      return NextResponse.json({ error: "No photos selected for download." }, { status: 400 });
    }

    const photos = await db.execute(sql`
      SELECT *
      FROM gallery_photos
      WHERE gallery_id = ${gallery.id}
        AND is_hidden = false
        AND id = ANY(${photoIds}::uuid[])
      ORDER BY sort_order ASC
    `);

    if (!photos.rows.length) return NextResponse.json({ error: "No downloadable photos found." }, { status: 404 });

    const entries: Array<{ name: string; data: Buffer }> = [];
    const downloadedPhotos: Array<{ id: string; filename: string; bytes: number }> = [];

    for (const photo of photos.rows) {
      const source = await getSource(photo, preset.variant);
      if (!source) continue;

      let output = source.body;
      let extension = "jpg";

      const needsTransform =
        preset.variant !== "original" ||
        Boolean(preset.max_width) ||
        preset.format !== "jpg" ||
        preset.include_watermark;

      if (needsTransform) {
        output = await renderDownloadVariant(source.body, {
          maxWidth: preset.max_width,
          quality: preset.quality,
          format: preset.format,
          watermark: preset.include_watermark ? watermark : undefined,
        });
        extension = preset.format;
      }

      const baseName = safeName(String(photo.filename || "photo")).replace(/\.[^.]+$/, "");
      const filename = `${baseName}.${extension}`;
      entries.push({ name: filename, data: output });
      downloadedPhotos.push({ id: String(photo.id), filename, bytes: output.byteLength });
    }

    if (!entries.length) return NextResponse.json({ error: "Unable to prepare downloads." }, { status: 500 });

    const userAgent = request.headers.get("user-agent") || null;
    const ipHash = hashIp(request);
    const downloadType = entries.length === 1 && body.type !== "zip" ? "single" : "zip";

    for (const photo of downloadedPhotos) {
      await db.execute(sql`
        INSERT INTO gallery_downloads (
          gallery_id,
          photo_id,
          preset_id,
          session_id,
          download_type,
          filename,
          bytes,
          ip_hash,
          user_agent
        )
        VALUES (
          ${gallery.id},
          ${photo.id},
          ${preset.id || null},
          ${session.id},
          ${downloadType},
          ${photo.filename},
          ${photo.bytes},
          ${ipHash},
          ${userAgent}
        )
      `);

      await db.execute(sql`
        UPDATE gallery_photos
        SET download_count = download_count + 1,
            updated_at = now()
        WHERE id = ${photo.id}
      `);
    }

    if (downloadType === "single") {
      const item = entries[0];
      return new NextResponse(item.data, {
        status: 200,
        headers: {
          "Content-Type": preset.format === "png" ? "image/png" : preset.format === "webp" ? "image/webp" : "image/jpeg",
          "Content-Disposition": `attachment; filename="${item.name}"`,
          "Content-Length": String(item.data.byteLength),
          "Cache-Control": "private, no-store",
        },
      });
    }

    const zip = createZip(entries);
    const archiveName = `${safeName(String(gallery.title || "gallery"))}-${new Date().toISOString().slice(0, 10)}.zip`;

    await db.execute(sql`
      INSERT INTO gallery_downloads (
        gallery_id,
        preset_id,
        session_id,
        download_type,
        filename,
        bytes,
        ip_hash,
        user_agent
      )
      VALUES (
        ${gallery.id},
        ${preset.id || null},
        ${session.id},
        'zip',
        ${archiveName},
        ${zip.byteLength},
        ${ipHash},
        ${userAgent}
      )
    `);

    return new NextResponse(zip, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${archiveName}"`,
        "Content-Length": String(zip.byteLength),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("POST public gallery download", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to prepare download." },
      { status: 500 },
    );
  }
}

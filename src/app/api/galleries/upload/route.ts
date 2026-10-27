import crypto from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { galleries } from "@/db/schema";
import { getCurrentUserFromRequest } from "@/lib/auth/get-current-user";
import { getGalleryStorage } from "@/lib/gallery/storage";
import { processImage } from "@/lib/gallery/image-processing";
import { validateMimeTypeByExtension } from "./security";

const MAX_BYTES = 100 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const form = await request.formData();
    const galleryId = String(form.get("galleryId") || "");
    const file = form.get("file");
    if (!galleryId || !(file instanceof File)) return NextResponse.json({ error: "galleryId and file are required." }, { status: 400 });
    const gallery = await db.select({ id: galleries.id }).from(galleries).where(and(eq(galleries.id, galleryId), eq(galleries.creatorId, user.id))).limit(1);
    if (!gallery.length) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });
    if (file.size <= 0 || file.size > MAX_BYTES) return NextResponse.json({ error: "Each file must be between 1 byte and 100MB." }, { status: 413 });
    if (!IMAGE_TYPES.has(file.type) || !validateMimeTypeByExtension(file.name, file.type)) return NextResponse.json({ error: "Unsupported image type. Use JPEG, PNG, WebP, HEIC, or HEIF." }, { status: 415 });

    const input = Buffer.from(await file.arrayBuffer());
    const watermark = await db.execute(sql`SELECT enabled, text, position, opacity, font_size FROM gallery_watermarks WHERE gallery_id = ${galleryId} LIMIT 1`);
    const row = watermark.rows[0];
    const processed = await processImage(input, {
      enabled: row?.enabled !== false,
      text: String(row?.text || "KIPSMTHN"),
      position: (row?.position || "bottom-right") as "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center",
      opacity: Number(row?.opacity ?? 55),
      fontSize: Number(row?.font_size ?? 42),
    });
    const photoId = crypto.randomUUID();
    const basePath = `galleries/${galleryId}/${photoId}`;
    const storage = getGalleryStorage();
    const [original, display, thumbnail, watermarkObject] = await Promise.all([
      storage.putObject({ path: `${basePath}/original.jpg`, body: processed.original, contentType: "image/jpeg" }),
      storage.putObject({ path: `${basePath}/display.jpg`, body: processed.display, contentType: "image/jpeg" }),
      storage.putObject({ path: `${basePath}/thumbnail.jpg`, body: processed.thumbnail, contentType: "image/jpeg" }),
      storage.putObject({ path: `${basePath}/watermark.jpg`, body: processed.watermark, contentType: "image/jpeg" }),
    ]);
    const maxOrder = await db.execute(sql`SELECT COALESCE(MAX(sort_order), -1)::int AS max_order FROM gallery_photos WHERE gallery_id = ${galleryId}`);
    const sortOrder = Number(maxOrder.rows[0]?.max_order ?? -1) + 1;
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 180) || "photo";
    const inserted = await db.execute(sql`
      INSERT INTO gallery_photos (id, gallery_id, filename, original_url, display_url, thumbnail_url, storage_path, original_path, display_path, thumbnail_path, watermark_path, mime_type, file_size, width, height, processing_status, sort_order)
      VALUES (${photoId}, ${galleryId}, ${safeFilename}, ${original.url}, ${display.url}, ${thumbnail.url}, ${original.path}, ${original.path}, ${display.path}, ${thumbnail.path}, ${watermarkObject.path}, ${processed.mimeType}, ${file.size}, ${processed.width}, ${processed.height}, 'ready', ${sortOrder})
      RETURNING id, filename, display_url, thumbnail_url, mime_type, file_size, width, height, sort_order
    `);
    return NextResponse.json({ photo: inserted.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/galleries/upload", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 });
  }
}

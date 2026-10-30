import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import Sharp from "sharp";

import { db } from "@/db";
import { galleries, galleryPhotos } from "@/db/schema";
import { getCurrentUserFromRequest } from "@/lib/auth/get-current-user";
import { getGalleryStorage } from "@/lib/gallery/storage";
import { IMAGE_MIME_TYPES, validateGalleryMedia } from "../security";

const sharp = Sharp as any;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

export async function POST(request: Request) {
  let storedPath: string | null = null;

  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const form = await request.formData();
    const galleryId = String(form.get("galleryId") || "");
    const photoId = String(form.get("photoId") || "");
    const file = form.get("file");

    if (!galleryId || !photoId || !(file instanceof File)) {
      return NextResponse.json({ error: "galleryId, photoId and file are required." }, { status: 400 });
    }

    const mimeType = file.type.toLowerCase();
    if (!IMAGE_MIME_TYPES.has(mimeType)) {
      return NextResponse.json({ error: "Only original image files can be uploaded to this endpoint." }, { status: 415 });
    }

    const validation = validateGalleryMedia(file.name, mimeType, file.size);
    if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: validation.status });

    const [gallery] = await db.select({ id: galleries.id })
      .from(galleries)
      .where(and(eq(galleries.id, galleryId), eq(galleries.creatorId, user.id)))
      .limit(1);
    if (!gallery) return NextResponse.json({ error: "Gallery not found." }, { status: 404 });

    const [photo] = await db.select({
      id: galleryPhotos.id,
      originalPath: galleryPhotos.originalPath,
    })
      .from(galleryPhotos)
      .where(and(eq(galleryPhotos.id, photoId), eq(galleryPhotos.galleryId, galleryId)))
      .limit(1);
    if (!photo) return NextResponse.json({ error: "Gallery image not found." }, { status: 404 });

    const input = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(input, { failOn: "none" }).metadata();
    if (!metadata.width || !metadata.height || !metadata.format) {
      return NextResponse.json({ error: "The original image could not be decoded." }, { status: 415 });
    }

    const extension = EXTENSIONS[mimeType];
    const objectPath = `galleries/${galleryId}/${photoId}/original.${extension}`;
    const storage = getGalleryStorage();
    const stored = await storage.putObject({ path: objectPath, body: input, contentType: mimeType });
    storedPath = stored.path;

    const updated = await db.execute(sql`
      UPDATE gallery_photos
      SET
        original_path = ${stored.path},
        original_url = ${stored.url},
        storage_path = ${stored.path},
        mime_type = ${mimeType},
        file_size = ${file.size},
        width = ${metadata.width},
        height = ${metadata.height},
        updated_at = now()
      WHERE id = ${photoId}
        AND gallery_id = ${galleryId}
      RETURNING id
    `);

    if (!updated.rows[0]) throw new Error("Original image could not be attached to the gallery record.");

    if (photo.originalPath && photo.originalPath !== stored.path) {
      await storage.deleteObject(photo.originalPath).catch((error) => {
        console.warn("Unable to remove temporary preview source", error);
      });
    }

    storedPath = null;
    return NextResponse.json({ success: true, photoId, originalSize: file.size });
  } catch (error) {
    if (storedPath) {
      await getGalleryStorage().deleteObject(storedPath).catch(() => undefined);
    }
    console.error("POST /api/galleries/upload/original", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Original upload failed.",
    }, { status: 500 });
  }
}

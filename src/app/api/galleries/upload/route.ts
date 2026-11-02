import crypto from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { galleries } from "@/db/schema";
import { getCurrentUserFromRequest } from "@/lib/auth/get-current-user";
import { getGalleryStorage } from "@/lib/gallery/storage";
import { processImage } from "@/lib/gallery/image-processing";
import { processVideo } from "@/lib/gallery/video-processing";
import { IMAGE_MIME_TYPES, VIDEO_MIME_TYPES, validateGalleryMedia } from "./security";

const VIDEO_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4", "video/quicktime": "mov", "video/x-msvideo": "avi",
  "video/x-matroska": "mkv", "video/webm": "webm", "video/x-flv": "flv", "video/x-ms-wmv": "wmv",
};
const POSITION = ["top-left", "top-right", "bottom-left", "bottom-right", "center"] as const;

type UploadStage =
  | "auth"
  | "gallery-ownership"
  | "validation"
  | "watermark-lookup"
  | "watermark-image-fetch"
  | "image-processing"
  | "video-processing"
  | "object-storage"
  | "database-insert";

function extractPgErrorDetails(error: unknown): Record<string, unknown> {
  let current = error;

  for (let depth = 0; depth < 8 && current && typeof current === "object"; depth++) {
    const candidate = current as {
      code?: unknown;
      detail?: unknown;
      hint?: unknown;
      schema?: unknown;
      table?: unknown;
      column?: unknown;
      constraint?: unknown;
      cause?: unknown;
    };

    if (typeof candidate.code === "string") {
      const details: Record<string, unknown> = { code: candidate.code };
      if (typeof candidate.detail === "string") details.detail = candidate.detail;
      if (typeof candidate.hint === "string") details.hint = candidate.hint;
      if (typeof candidate.schema === "string") details.schema = candidate.schema;
      if (typeof candidate.table === "string") details.table = candidate.table;
      if (typeof candidate.column === "string") details.column = candidate.column;
      if (typeof candidate.constraint === "string") details.constraint = candidate.constraint;
      return details;
    }

    current = candidate.cause;
  }

  return {};
}

function buildErrorResponse(
  stage: UploadStage,
  message: string,
  status: number,
  pgDetails: Record<string, unknown> = {}
) {
  const isDevelopment = process.env.NODE_ENV !== "production";
  const body: Record<string, unknown> = { error: message };

  if (isDevelopment) {
    body.failureStage = stage;
    if (Object.keys(pgDetails).length > 0) {
      body.pgError = pgDetails;
    }
  }

  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  let storedPaths: string[] = [];
  let stage: UploadStage = "auth";

  try {
    // Stage: authentication
    const user = await getCurrentUserFromRequest(request);
    if (!user) return buildErrorResponse("auth", "Unauthorized.", 401);

    stage = "gallery-ownership";

    const form = await request.formData();
    const galleryId = String(form.get("galleryId") || "");
    const file = form.get("file");
    if (!galleryId || !(file instanceof File)) {
      return buildErrorResponse("validation", "galleryId and file are required.", 400);
    }

    const gallery = await db.select({ id: galleries.id }).from(galleries)
      .where(and(eq(galleries.id, galleryId), eq(galleries.creatorId, user.id))).limit(1);
    if (!gallery.length) {
      return buildErrorResponse("gallery-ownership", "Gallery not found.", 404);
    }

    const mimeType = file.type.toLowerCase();
    const validation = validateGalleryMedia(file.name, mimeType, file.size);
    if (!validation.valid) {
      return buildErrorResponse("validation", validation.error, validation.status);
    }

    const isImage = IMAGE_MIME_TYPES.has(mimeType);
    const isVideo = VIDEO_MIME_TYPES.has(mimeType);

    const input = Buffer.from(await file.arrayBuffer());

    // Stage: watermark lookup
    stage = "watermark-lookup";
    const watermarkResult = await db.execute(sql`
      SELECT enabled, text, position, opacity, font_size, image_path
      FROM gallery_watermarks
      WHERE gallery_id = ${galleryId}
      LIMIT 1
    `);
    const row = watermarkResult.rows[0];

    // Stage: watermark image fetch (if custom image watermark)
    stage = "watermark-image-fetch";
    let watermarkImageBuffer: Buffer | null = null;
    if (row?.image_path) {
      const storage = getGalleryStorage();
      const retrieved = await storage.getObject(String(row.image_path));
      if (retrieved) watermarkImageBuffer = retrieved.body;
    }

    const watermarkOptions = {
      enabled: row?.enabled !== false,
      text: String(row?.text || "KIPSMTHN"),
      position: (POSITION.includes(row?.position as typeof POSITION[number]) ? row?.position : "bottom-right") as typeof POSITION[number],
      opacity: Number(row?.opacity ?? 55),
      fontSize: Number(row?.font_size ?? 42),
      imageBuffer: watermarkImageBuffer,
    };

    // Stage: image/video processing
    stage = isVideo ? "video-processing" : "image-processing";
    const processed = isVideo
      ? await processVideo(input, watermarkOptions)
      : await processImage(input, watermarkOptions);

    const photoId = crypto.randomUUID();
    const basePath = `galleries/${galleryId}/${photoId}`;
    const storage = getGalleryStorage();
    const originalExtension = isVideo ? VIDEO_EXTENSIONS[mimeType] : "jpg";
    const originalMimeType = mimeType;

    const objects = isVideo
      ? [
          { suffix: `original.${originalExtension}`, body: processed.original, contentType: originalMimeType },
          { suffix: "display.mp4", body: processed.display, contentType: "video/mp4" },
          { suffix: "thumbnail.jpg", body: processed.thumbnail, contentType: "image/jpeg" },
          { suffix: "watermark.jpg", body: processed.watermark, contentType: "image/jpeg" },
        ]
      : [
          { suffix: `original.${originalExtension}`, body: processed.original, contentType: originalMimeType },
          { suffix: "display.jpg", body: processed.display, contentType: "image/jpeg" },
          { suffix: "thumbnail.jpg", body: processed.thumbnail, contentType: "image/jpeg" },
          { suffix: "watermark.jpg", body: processed.watermark, contentType: "image/jpeg" },
        ];

    // Stage: object storage
    stage = "object-storage";
    const results = await Promise.allSettled(objects.map((object) =>
      storage.putObject({ path: `${basePath}/${object.suffix}`, body: object.body, contentType: object.contentType })
    ));
    storedPaths = results.flatMap((result) => result.status === "fulfilled" ? [result.value.path] : []);
    const failedStorage = results.find((result) => result.status === "rejected");
    if (failedStorage?.status === "rejected") throw failedStorage.reason;

    const [original, display, thumbnail, watermarked] = results.map((result) =>
      (result as PromiseFulfilledResult<Awaited<ReturnType<typeof storage.putObject>>>).value
    );

    // Stage: database insert
    stage = "database-insert";
    const maxOrder = await db.execute(sql`
      SELECT COALESCE(MAX(sort_order), -1)::int AS max_order
      FROM gallery_photos
      WHERE gallery_id = ${galleryId}
    `);
    const sortOrder = Number(maxOrder.rows[0]?.max_order ?? -1) + 1;
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 180) || (isVideo ? "video" : "photo");

    const inserted = await db.execute(sql`
      INSERT INTO gallery_photos (
        id, gallery_id, filename, original_url, display_url, thumbnail_url,
        storage_path, original_path, display_path, thumbnail_path, watermark_path,
        mime_type, file_size, width, height, processing_status, sort_order
      )
      VALUES (
        ${photoId}, ${galleryId}, ${safeFilename}, ${original.url}, ${display.url}, ${thumbnail.url},
        ${original.path}, ${original.path}, ${display.path}, ${thumbnail.path}, ${watermarked.path},
        ${isVideo ? mimeType : processed.mimeType}, ${file.size}, ${processed.width}, ${processed.height}, 'ready', ${sortOrder}
      )
      RETURNING id, filename, original_url, display_url, thumbnail_url, mime_type, file_size, width, height, sort_order
    `);

    if (!inserted.rows[0]) throw new Error("Media record could not be created.");
    storedPaths = [];
    return NextResponse.json({ photo: inserted.rows[0] }, { status: 201 });
  } catch (error) {
    if (storedPaths.length) {
      try {
        const storage = getGalleryStorage();
        await Promise.allSettled([...new Set(storedPaths)].map((objectPath) => storage.deleteObject(objectPath)));
      } catch (cleanupError) {
        console.error("Unable to clean up failed gallery upload", cleanupError);
      }
    }

    const pgDetails = extractPgErrorDetails(error);
    console.error("POST /api/galleries/upload", { stage, error: error instanceof Error ? error.message : error, ...pgDetails });

    const message = error instanceof Error ? error.message : "Upload failed.";
    const status = /ffmpeg|transcod|video stream|thumbnail extraction/i.test(message) ? 415 : 500;

    return buildErrorResponse(stage, message, status, pgDetails);
  }
}
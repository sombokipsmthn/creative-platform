import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export { isPathSafe, sanitizeFilename, validateMimeTypeByExtension } from "./security";

import { auth } from "@/lib/auth";
import { handleUpload } from "@vercel/blob/client";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getLocalUser } from "@/lib/auth/get-local-user";
import { getGalleryStorage } from "@/lib/gallery/storage";
import { getUploadRateLimiter } from "@/lib/rate-limiter";
import { processImage } from "@/lib/gallery/image-processing";
import { processVideo } from "@/lib/gallery/video-processing";

export async function POST(request: Request) {
  try {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken || !blobToken.startsWith("vercel_blob_rw_")) {
      console.error(
        "BLOB_READ_WRITE_TOKEN is missing or invalid. It must start with 'vercel_blob_rw_'."
      );
      return NextResponse.json(
        {
          error:
            "Vercel Blob storage is not configured properly. BLOB_READ_WRITE_TOKEN is missing or invalid in environment variables.",
        },
        { status: 500 }
      );
    }

    // Check rate limiting
    const rateLimitResponse = await getUploadRateLimiter().limit(request);
    if (!rateLimitResponse.success) {
      return NextResponse.json(
        {
          error: "Too many upload requests. Please try again later.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    const response = await handleUpload({
      body,
      request,
      token: blobToken,

      onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
        const { userId } = await auth();

        if (!userId) {
          throw new Error("Unauthorized");
        }

        let creator;
        try {
          creator = await getLocalUser(userId);
        } catch (e) {
          console.error("Creator not found for upload route:", e);
          throw new Error("Unauthorized");
        }

        let galleryId: string | null = null;
        if (clientPayload) {
          try {
            const parsed = JSON.parse(clientPayload);
            galleryId = parsed.galleryId;
          } catch {
            throw new Error("Invalid clientPayload");
          }
        }

        if (!galleryId) {
          throw new Error("galleryId is required.");
        }

        const gallery = await db.execute(sql`
          SELECT id
          FROM galleries
          WHERE id = ${galleryId}
            AND creator_id = ${creator.id}
          LIMIT 1
        `);

        if (!gallery.rows[0]) {
          throw new Error("Gallery not found.");
        }

        // Determine if this is a video or image based on extension
        const isVideo = /\.(mp4|mov|avi|mkv|webm|flv|wmv)$/i.test(pathname);

        // Provide explicit callbackUrl for reliable onUploadCompleted in all environments
        const callbackUrl = process.env.VERCEL_BLOB_CALLBACK_URL
          ? `${process.env.VERCEL_BLOB_CALLBACK_URL}/api/galleries/upload`
          : undefined;

        return {
          allowedContentTypes: isVideo
            ? [
                "video/mp4",
                "video/quicktime", // .mov
                "video/x-msvideo", // .avi
                "video/x-matroska", // .mkv
                "video/webm",
                "video/x-flv",
                "video/x-ms-wmv",
              ]
            : [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/heic",
                "image/heif",
              ],

          maximumSizeInBytes:
            100 * 1024 * 1024, // 100MB limit for both images and videos

          addRandomSuffix: true,

          tokenPayload: JSON.stringify({
            creatorId: creator.id,
            galleryId,
            pathname,
            isVideo,
          }),

          callbackUrl,
        };
      },

      onUploadCompleted: async ({
        blob,
        tokenPayload,
      }) => {
        try {
          if (!tokenPayload) {
            throw new Error("Missing tokenPayload");
          }
          const payload =
            JSON.parse(tokenPayload as string);
          const { isVideo, creatorId, galleryId } = payload;

          // Verify gallery ownership again in callback for security
          const gallery = await db.execute(sql`
            SELECT id
            FROM galleries
            WHERE id = ${galleryId}
              AND creator_id = ${creatorId}
            LIMIT 1
          `);

          if (!gallery.rows[0]) {
            throw new Error("Gallery not found or access denied in callback.");
          }

          const maxOrder =
            await db.execute(sql`
              SELECT COALESCE(
                MAX(sort_order),
                -1
              )::int AS max_order

              FROM gallery_photos

              WHERE gallery_id =
                ${galleryId}
            `);

          const sortOrder =
            Number(
              maxOrder.rows[0]?.max_order ??
                -1
            ) + 1;

          // Fetch the uploaded blob
          const blobResponse = await fetch(blob.url, {
            cache: "no-store",
          });

          if (!blobResponse.ok) {
            throw new Error(`Failed to fetch uploaded blob: ${blobResponse.status}`);
          }

          const blobBuffer = Buffer.from(await blobResponse.arrayBuffer());

          // Get watermark settings for this gallery
          const watermarkResult = await db.execute(sql`
            SELECT
              enabled,
              text,
              position,
              opacity,
              font_size
            FROM gallery_watermarks
            WHERE gallery_id = ${galleryId}
            LIMIT 1
          `);

          const watermarkOptions = {
            enabled: watermarkResult.rows[0]?.enabled !== false,
            text: String(watermarkResult.rows[0]?.text || "KIPSMTHN"),
            position: (watermarkResult.rows[0]?.position || "bottom-right") as
              | "top-left"
              | "top-right"
              | "bottom-left"
              | "bottom-right"
              | "center",
            opacity: Number(watermarkResult.rows[0]?.opacity ?? 55),
            fontSize: Number(watermarkResult.rows[0]?.font_size ?? 42),
          };

          let processed;
          let mimeType = "image/jpeg"; // default
          let width = null;
          let height = null;

          if (isVideo) {
            // Process as video
            const videoWatermarkOptions = {
              enabled: watermarkOptions.enabled,
              text: watermarkOptions.text,
              position: watermarkOptions.position,
              opacity: watermarkOptions.opacity,
              fontSize: watermarkOptions.fontSize,
            };

            processed = await processVideo(blobBuffer, videoWatermarkOptions);
            mimeType = processed.mimeType;
            width = processed.width;
            height = processed.height;
          } else {
            // Process as image (existing logic)
            processed = await processImage(blobBuffer, watermarkOptions);
            mimeType = processed.mimeType;
            width = processed.width;
            height = processed.height;
          }

          // Generate IDs and paths
          const photoId = randomUUID();
          const filename = blob.pathname.split("/").pop() || blob.pathname;
          const safeFilename = filename.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 180) || "media";
          const basePath = `galleries/${galleryId}/${photoId}`;

          // Storage
          const storage = getGalleryStorage();

          let originalResult, displayResult, thumbnailResult;

          if (isVideo) {
            // For video, we store different versions

            // Upload original video
            originalResult = await storage.putObject({
              path: `${basePath}/original.${getExtensionFromMimeType(processed.mimeType)}`,
              body: processed.original,
              contentType: processed.mimeType,
            });

            // For display, we'll use a transcoded version (simplified - using original for now)
            displayResult = await storage.putObject({
              path: `${basePath}/display.${getExtensionFromMimeType(processed.mimeType)}`,
              body: processed.original, // In production, this would be the transcoded display version
              contentType: processed.mimeType,
            });

            // Thumbnail (we'll generate a JPEG thumbnail from the video)
            thumbnailResult = await storage.putObject({
              path: `${basePath}/thumbnail.jpg`,
              body: processed.thumbnail,
              contentType: "image/jpeg",
            });

            // Watermarked version (simplified - using thumbnail for now)
            await storage.putObject({
              path: `${basePath}/watermark.jpg`,
              body: processed.watermark,
              contentType: "image/jpeg",
            });
          } else {
            // Existing image processing storage logic
            // Upload processed images
            originalResult = await storage.putObject({
              path: `${basePath}/original.jpg`,
              body: processed.original,
              contentType: "image/jpeg",
            });

            displayResult = await storage.putObject({
              path: `${basePath}/display.jpg`,
              body: processed.display,
              contentType: "image/jpeg",
            });

            thumbnailResult = await storage.putObject({
              path: `${basePath}/thumbnail.jpg`,
              body: processed.thumbnail,
              contentType: "image/jpeg",
            });

            await storage.putObject({
              path: `${basePath}/watermark.jpg`,
              body: processed.watermark,
              contentType: "image/jpeg",
            });
          }

          // Insert into database with all required fields including *_path columns
          // Use INSERT ... ON CONFLICT DO NOTHING to make it idempotent
          await db.execute(sql`
            INSERT INTO gallery_photos (
              id,
              gallery_id,
              filename,
              original_url,
              display_url,
              thumbnail_url,
              storage_path,
              original_path,
              display_path,
              thumbnail_path,
              watermark_path,
              mime_type,
              file_size,
              width,
              height,
              processing_status,
              sort_order
            )
            VALUES (
              ${photoId},
              ${galleryId},
              ${safeFilename},
              ${originalResult.url},
              ${displayResult.url},
              ${thumbnailResult.url},
              ${blob.pathname},
              ${originalResult.path},
              ${displayResult.path},
              ${thumbnailResult.path},
              ${basePath}/watermark.jpg,
              ${mimeType},
              ${processed.original.byteLength},
              ${width},
              ${height},
              'ready',
              ${sortOrder}
            )
            ON CONFLICT (id) DO NOTHING
          `);
        } catch (error) {
          console.error(
            "BLOB UPLOAD COMPLETION ERROR",
            error
          );

          throw error;
        }
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "POST /api/galleries/upload",
      error
    );

    return NextResponse.json(
      {
        error: "Upload failed.",
      },
      {
        status: 400,
      }
    );
  }
}

// Helper function to get file extension from MIME type
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/x-msvideo": "avi",
    "video/x-matroska": "mkv",
    "video/webm": "webm",
    "video/x-flv": "flv",
    "video/x-ms-wmv": "wmv",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
  };

  return mimeToExt[mimeType] || "bin";
}

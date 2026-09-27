import { randomUUID } from 'crypto';

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { handleUpload } from "@vercel/blob/client";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getLocalUser } from "@/lib/auth/get-local-user";
import { getGalleryStorage } from "@/lib/gallery/storage";
import { processImage } from "@/lib/gallery/image-processing";
import { processVideo } from "@/lib/gallery/video-processing";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let creator;
    try {
      creator = await getLocalUser(userId);
    } catch (e) {
      console.error("Creator not found for upload route:", e);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const clientPayload =
      typeof body.clientPayload === "string"
        ? JSON.parse(body.clientPayload)
        : null;
    const galleryId = body.galleryId || clientPayload?.galleryId;

    if (!galleryId) {
      return NextResponse.json(
        { error: "galleryId is required." },
        { status: 400 }
      );
    }

    const gallery = await db.execute(sql`
      SELECT id
      FROM galleries
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

    const response = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,

      onBeforeGenerateToken: async (
        pathname
      ) => {
        // Determine if this is a video or image based on extension
        const isVideo = /\.(mp4|mov|avi|mkv|webm|flv|wmv)$/i.test(pathname);
        
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
            isVideo: isVideo, // Pass this to the upload completed handler
          }),
        };
      },

      onUploadCompleted: async ({
        blob,
        tokenPayload,
      }) => {
        try {
          const payload =
            JSON.parse(tokenPayload as string);
          const { isVideo } = payload;

          const maxOrder =
            await db.execute(sql`
              SELECT COALESCE(
                MAX(sort_order),
                -1
              )::int AS max_order

              FROM gallery_photos

              WHERE gallery_id =
                ${payload.galleryId}
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
            WHERE gallery_id = ${payload.galleryId}
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
          let duration = null;
          let videoCodec = null;
          let audioCodec = null;

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
            duration = processed.duration;
            videoCodec = processed.videoCodec;
            audioCodec = processed.audioCodec;
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
          const basePath = `galleries/${payload.galleryId}/${photoId}`;

          // Storage
          const storage = getGalleryStorage();

          let originalResult, displayResult, thumbnailResult, watermarkedResult;

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
            watermarkedResult = await storage.putObject({
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

            watermarkedResult = await storage.putObject({
              path: `${basePath}/watermark.jpg`,
              body: processed.watermark,
              contentType: "image/jpeg",
            });
          }

          // Insert into database
          await db.execute(sql`
            INSERT INTO gallery_photos (
              id,
              gallery_id,
              filename,
              original_url,
              display_url,
              thumbnail_url,
              storage_path,
              mime_type,
              file_size,
              width,
              height,
              duration,
              video_codec,
              audio_codec,
              sort_order
            )
            VALUES (
              ${photoId},
              ${payload.galleryId},
              ${safeFilename},
              ${originalResult.url},
              ${displayResult.url},
              ${thumbnailResult.url},
              ${blob.pathname},
              ${mimeType},
              ${processed.original.byteLength},
              ${width},
              ${height},
              ${duration || null},
              ${videoCodec || null},
              ${audioCodec || null},
              ${sortOrder}
            )
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
        error:
          error instanceof Error
            ? error.message
            : "Upload failed.",
      },
      {
        status: 500,
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

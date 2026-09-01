import { randomUUID } from 'crypto';

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { handleUpload } from "@vercel/blob/client";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getLocalUser } from "@/lib/auth/get-local-user";
import { getGalleryStorage } from "@/lib/gallery/storage";
import { processImage } from "@/lib/gallery/image-processing";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const creator =
      await getOrCreateLocalUser(userId);

    const body = await request.json();

    const galleryId = body.galleryId;

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

      onBeforeGenerateToken: async (
        pathname
      ) => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
            "image/heif",
          ],

          maximumSizeInBytes:
            100 * 1024 * 1024,

          addRandomSuffix: true,

          tokenPayload: JSON.stringify({
            creatorId: creator.id,
            galleryId,
            pathname,
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

          // Process the image
          const processed = await processImage(blobBuffer, watermarkOptions);

          // Generate IDs and paths
          const photoId = randomUUID();
          const filename = blob.pathname.split("/").pop() || blob.pathname;
          const safeFilename = filename.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 180) || "photo.jpg";
          const basePath = `galleries/${payload.galleryId}/${photoId}`;

          // Storage
          const storage = getGalleryStorage();

          // Upload processed images
          const original = await storage.putObject({
            path: `${basePath}/original.jpg`,
            body: processed.original,
            contentType: "image/jpeg",
          });

          const display = await storage.putObject({
            path: `${basePath}/display.jpg`,
            body: processed.display,
            contentType: "image/jpeg",
          });

          const thumbnail = await storage.putObject({
            path: `${basePath}/thumbnail.jpg`,
            body: processed.thumbnail,
            contentType: "image/jpeg",
          });

          const watermarked = await storage.putObject({
            path: `${basePath}/watermark.jpg`,
            body: processed.watermark,
            contentType: "image/jpeg",
          });

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
              ${payload.galleryId},
              ${safeFilename},
              ${original.url},
              ${display.url},
              ${thumbnail.url},
              ${blob.pathname},
              ${original.path},
              ${display.path},
              ${thumbnail.path},
              ${watermarked.path},
              ${processed.mimeType},
              ${processed.original.byteLength},
              ${processed.width || null},
              ${processed.height || null},
              'ready',
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

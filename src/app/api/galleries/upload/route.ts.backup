import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { handleUpload } from "@vercel/blob/client";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getOrCreateLocalUser } from "@/lib/auth/get-or-create-local-user";

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

          await db.execute(sql`
            INSERT INTO gallery_photos (
              gallery_id,
              filename,
              original_url,
              display_url,
              thumbnail_url,
              storage_path,
              mime_type,
              sort_order
            )
            VALUES (
              ${payload.galleryId},

              ${blob.pathname
                .split("/")
                .pop() ||
                blob.pathname},

              ${blob.url},
              ${blob.url},
              ${blob.url},
              ${blob.pathname},
              ${blob.contentType || null},
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
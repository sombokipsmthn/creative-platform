import crypto from "node:crypto";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getOrCreateLocalUser } from "@/lib/auth/get-or-create-local-user";
import { getGalleryStorage } from "@/lib/gallery/storage";
import { processImage } from "@/lib/gallery/image-processing";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

const MAX_IMAGE_BYTES =
  100 * 1024 * 1024;

async function getCreator() {
  const { userId } =
    await auth();

  if (!userId) {
    return null;
  }

  return getOrCreateLocalUser(
    userId,
  );
}

async function ownsGallery(
  galleryId: string,
  creatorId: string,
) {
  const result =
    await db.execute(sql`
      SELECT id
      FROM galleries
      WHERE id = ${galleryId}
        AND creator_id = ${creatorId}
      LIMIT 1
    `);

  return Boolean(
    result.rows[0],
  );
}

function dataUrlToBuffer(
  value: string,
) {
  const match = value.match(
    /^data:([^;]+);base64,(.+)$/,
  );

  if (!match) {
    return null;
  }

  const buffer =
    Buffer.from(
      match[2],
      "base64",
    );

  if (
    buffer.byteLength >
    MAX_IMAGE_BYTES
  ) {
    throw new Error(
      "Image exceeds the 100MB upload limit.",
    );
  }

  return {
    buffer,
    contentType: match[1],
  };
}

async function fetchRemoteImage(
  value: string,
) {
  const response =
    await fetch(value, {
      cache: "no-store",
      redirect: "follow",
    });

  if (!response.ok) {
    throw new Error(
      `Unable to fetch image (${response.status}).`,
    );
  }

  const contentLength =
    Number(
      response.headers.get(
        "content-length",
      ) || 0,
    );

  if (
    contentLength >
    MAX_IMAGE_BYTES
  ) {
    throw new Error(
      "Image exceeds the 100MB upload limit.",
    );
  }

  const buffer =
    Buffer.from(
      await response.arrayBuffer(),
    );

  if (
    buffer.byteLength >
    MAX_IMAGE_BYTES
  ) {
    throw new Error(
      "Image exceeds the 100MB upload limit.",
    );
  }

  return {
    buffer,
    contentType:
      response.headers.get(
        "content-type",
      ) || "image/jpeg",
  };
}

async function resolveImage(
  value: string,
) {
  if (
    value.startsWith(
      "data:",
    )
  ) {
    const result =
      dataUrlToBuffer(value);

    if (!result) {
      throw new Error(
        "Invalid image data.",
      );
    }

    return result;
  }

  if (
    !/^https?:\/\//i.test(
      value,
    )
  ) {
    throw new Error(
      "Photo URL must be an http(s) URL or a data URL.",
    );
  }

  return fetchRemoteImage(
    value,
  );
}

function safeFilename(
  filename: string,
) {
  return (
    filename
      .replace(
        /[^a-zA-Z0-9._-]+/g,
        "-",
      )
      .slice(0, 180) ||
    "photo.jpg"
  );
}

async function getWatermarkSettings(
  galleryId: string,
) {
  const result =
    await db.execute(sql`
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

  const row =
    result.rows[0];

  return {
    enabled:
      row?.enabled !== false,
    text: String(
      row?.text ||
        "KIPSMTHN",
    ),
    position:
      (row?.position ||
        "bottom-right") as
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right"
        | "center",
    opacity: Number(
      row?.opacity ?? 55,
    ),
    fontSize: Number(
      row?.font_size ?? 42,
    ),
  };
}

export async function POST(
  request: Request,
  context: Context,
) {
  try {
    const creator =
      await getCreator();

    if (!creator) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const {
      id: galleryId,
    } = await context.params;

    if (
      !(await ownsGallery(
        galleryId,
        creator.id,
      ))
    ) {
      return NextResponse.json(
        {
          error:
            "Gallery not found.",
        },
        {
          status: 404,
        },
      );
    }

    const body =
      await request.json();

    const photosList =
      Array.isArray(
        body.photos,
      )
        ? body.photos
        : body.url
          ? [
              {
                url: body.url,
                filename:
                  body.filename ||
                  "photo.jpg",
                collectionId:
                  body.collectionId ||
                  null,
              },
            ]
          : [];

    if (
      !photosList.length
    ) {
      return NextResponse.json(
        {
          error:
            "No photo data provided.",
        },
        {
          status: 400,
        },
      );
    }

    const maxOrder =
      await db.execute(sql`
        SELECT
          COALESCE(
            MAX(sort_order),
            -1
          )::int AS max_order
        FROM gallery_photos
        WHERE gallery_id = ${galleryId}
      `);

    let currentSortOrder =
      Number(
        maxOrder.rows[0]
          ?.max_order ?? -1,
      ) + 1;

    const insertedPhotos =
      [];

    const storage =
      getGalleryStorage();

    const watermark =
      await getWatermarkSettings(
        galleryId,
      );

    for (
      const item of photosList
    ) {
      const sourceUrl =
        item.url ||
        item.displayUrl ||
        item.originalUrl;

      if (!sourceUrl) {
        continue;
      }

      const source =
        await resolveImage(
          String(sourceUrl),
        );

      const processed =
        await processImage(
          source.buffer,
          watermark,
        );

      const photoId =
        crypto.randomUUID();

      const filename =
        safeFilename(
          String(
            item.filename ||
              "photo.jpg",
          ),
        );

      const basePath =
        `galleries/${galleryId}/${photoId}`;

      const original =
        await storage.putObject({
          path: `${basePath}/original.jpg`,
          body: processed.original,
          contentType:
            "image/jpeg",
        });

      const display =
        await storage.putObject({
          path: `${basePath}/display.jpg`,
          body: processed.display,
          contentType:
            "image/jpeg",
        });

      const thumbnail =
        await storage.putObject({
          path: `${basePath}/thumbnail.jpg`,
          body: processed.thumbnail,
          contentType:
            "image/jpeg",
        });

      const watermarked =
        await storage.putObject({
          path: `${basePath}/watermark.jpg`,
          body: processed.watermark,
          contentType:
            "image/jpeg",
        });

      const result =
        await db.execute(sql`
          INSERT INTO gallery_photos (
            id,
            gallery_id,
            collection_id,
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
            ${
              item.collectionId ||
              null
            },
            ${filename},
            ${original.url},
            ${display.url},
            ${thumbnail.url},
            ${original.path},
            ${original.path},
            ${display.path},
            ${thumbnail.path},
            ${watermarked.path},
            ${processed.mimeType},
            ${processed.original.byteLength},
            ${
              processed.width ||
              null
            },
            ${
              processed.height ||
              null
            },
            'ready',
            ${currentSortOrder}
          )
          RETURNING *
        `);

      if (result.rows[0]) {
        insertedPhotos.push(
          result.rows[0],
        );
      }

      currentSortOrder += 1;
    }

    return NextResponse.json(
      {
        photos:
          insertedPhotos,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST gallery photos",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to add photos.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  request: Request,
  context: Context,
) {
  try {
    const creator =
      await getCreator();

    if (!creator) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const {
      id: galleryId,
    } = await context.params;

    if (
      !(await ownsGallery(
        galleryId,
        creator.id,
      ))
    ) {
      return NextResponse.json(
        {
          error:
            "Gallery not found.",
        },
        {
          status: 404,
        },
      );
    }

    const body =
      await request.json();

    const photoId =
      body.photoId;

    if (!photoId) {
      return NextResponse.json(
        {
          error:
            "photoId is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      body.collectionId !==
      undefined
    ) {
      await db.execute(sql`
        UPDATE gallery_photos
        SET
          collection_id = ${
            body.collectionId ||
            null
          },
          updated_at = now()
        WHERE id = ${photoId}
          AND gallery_id = ${galleryId}
      `);
    }

    if (
      body.isHidden !==
      undefined
    ) {
      await db.execute(sql`
        UPDATE gallery_photos
        SET
          is_hidden = ${Boolean(
            body.isHidden,
          )},
          updated_at = now()
        WHERE id = ${photoId}
          AND gallery_id = ${galleryId}
      `);
    }

    if (
      body.isFavorite !==
      undefined
    ) {
      await db.execute(sql`
        UPDATE gallery_photos
        SET
          is_favorite = ${Boolean(
            body.isFavorite,
          )},
          updated_at = now()
        WHERE id = ${photoId}
          AND gallery_id = ${galleryId}
      `);
    }

    if (
      body.isSelected !==
      undefined
    ) {
      await db.execute(sql`
        UPDATE gallery_photos
        SET
          is_selected = ${Boolean(
            body.isSelected,
          )},
          updated_at = now()
        WHERE id = ${photoId}
          AND gallery_id = ${galleryId}
      `);
    }

    if (body.isCover) {
      await db.execute(sql`
        UPDATE galleries
        SET
          cover_photo_id = ${photoId},
          updated_at = now()
        WHERE id = ${galleryId}
          AND creator_id = ${creator.id}
      `);
    }

    const result =
      await db.execute(sql`
        SELECT *
        FROM gallery_photos
        WHERE id = ${photoId}
          AND gallery_id = ${galleryId}
        LIMIT 1
      `);

    return NextResponse.json({
      photo:
        result.rows[0],
    });
  } catch (error) {
    console.error(
      "PATCH gallery photo",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to update photo.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  request: Request,
  context: Context,
) {
  try {
    const creator =
      await getCreator();

    if (!creator) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const {
      id: galleryId,
    } = await context.params;

    if (
      !(await ownsGallery(
        galleryId,
        creator.id,
      ))
    ) {
      return NextResponse.json(
        {
          error:
            "Gallery not found.",
        },
        {
          status: 404,
        },
      );
    }

    const body =
      await request.json();

    const ids: string[] =
      Array.isArray(
        body.photoIds,
      )
        ? body.photoIds
        : [];

    if (!ids.length) {
      return NextResponse.json(
        {
          error:
            "No photos selected.",
        },
        {
          status: 400,
        },
      );
    }

    const storage =
      getGalleryStorage();

    for (
      const photoId of ids
    ) {
      const result =
        await db.execute(sql`
          SELECT
            original_path,
            display_path,
            thumbnail_path,
            watermark_path
          FROM gallery_photos
          WHERE id = ${photoId}
            AND gallery_id = ${galleryId}
          LIMIT 1
        `);

      const photo =
        result.rows[0];

      if (!photo) {
        continue;
      }

      for (const path of [
        photo.original_path,
        photo.display_path,
        photo.thumbnail_path,
        photo.watermark_path,
      ]) {
        if (path) {
          try {
            await storage.deleteObject(
              String(path),
            );
          } catch (
            storageError
          ) {
            console.warn(
              "Failed to delete storage object",
              storageError,
            );
          }
        }
      }

      await db.execute(sql`
        DELETE FROM gallery_photos
        WHERE id = ${photoId}
          AND gallery_id = ${galleryId}
      `);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE gallery photos",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to delete photos.",
      },
      {
        status: 500,
      },
    );
  }
}
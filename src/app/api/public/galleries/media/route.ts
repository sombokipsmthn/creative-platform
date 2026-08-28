import { NextResponse } from "next/server";

import {
  getGalleryStorage,
  getGalleryStorageProvider,
} from "@/lib/gallery/storage";

export const dynamic =
  "force-dynamic";

export async function GET(
  request: Request,
) {
  try {
    if (
      getGalleryStorageProvider() !==
      "r2"
    ) {
      return NextResponse.json(
        {
          error:
            "Media proxy is only used for R2 storage.",
        },
        {
          status: 404,
        },
      );
    }

    const url =
      new URL(request.url);

    const key =
      url.searchParams.get(
        "key",
      );

    if (
      !key ||
      !key.startsWith(
        "galleries/",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid media key.",
        },
        {
          status: 400,
        },
      );
    }

    const object =
      await getGalleryStorage().getObject(
        key,
      );

    if (!object) {
      return NextResponse.json(
        {
          error:
            "Media not found.",
        },
        {
          status: 404,
        },
      );
    }

    return new NextResponse(
      object.body as unknown as BodyInit,
      {
        status: 200,
        headers: {
          "Content-Type":
            object.contentType,
          "Cache-Control":
            "public, max-age=31536000, immutable",
        },
      },
    );
  } catch (error) {
    console.error(
      "GET /api/public/galleries/media",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load media.",
      },
      {
        status: 500,
      },
    );
  }
}
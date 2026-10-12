import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: Context
) {
  try {
    const { slug } =
      await context.params;

    const body =
      await request.json();

    const photoId =
      body.photoId;

    const [galleryResult] = await db
      .select({ id: galleries.id })
      .from(galleries)
      .where(and(eq(galleries.slug, slug), eq(galleries.status, 'published')))
      .limit(1)
      .returning();

    if (!galleryResult) {
      return NextResponse.json(
        {
          error: "Gallery not found.",
        },
        {
          status: 404,
        }
      );
    }

    const galleryId = galleryResult.id;

    if (!galleryId) {
      return NextResponse.json(
        {
          error: "Gallery not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (body.isFavorite !== undefined) {
      await db
        .update(galleryPhotos)
        .set({
          isFavorite: Boolean(body.isFavorite),
          updatedAt: new Date(),
        })
        .where(and(eq(galleryPhotos.id, photoId), eq(galleryPhotos.galleryId, galleryId)))
        .returning();
    }

    if (body.isSelected !== undefined) {
      await db
        .update(galleryPhotos)
        .set({
          isSelected: Boolean(body.isSelected),
          updatedAt: new Date(),
        })
        .where(and(eq(galleryPhotos.id, photoId), eq(galleryPhotos.galleryId, galleryId)))
        .returning();
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "PATCH public gallery photo",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update photo.",
      },
      {
        status: 500,
      }
    );
  }
}
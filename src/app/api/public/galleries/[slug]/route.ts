import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { getGallerySession } from "@/lib/gallery/session";
import { galleries } from "@/db/schema";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  _request: Request,
  context: Context,
) {
  try {
    const { slug } =
      await context.params;

    const [galleryResult] = await db
      .select({
        id: galleries.id,
        slug: galleries.slug,
        title: galleries.title,
        description: galleries.description,
        category: galleries.category,
        accessPin: galleries.accessPin,
        status: galleries.status,
        coverPhotoId: galleries.coverPhotoId,
        publishedAt: galleries.publishedAt,
        createdAt: galleries.createdAt,
        updatedAt: galleries.updatedAt,
        clientName: clients.name,
        clientCompany: clients.company,
        projectName: projects.name,
        coverUrl: sql<string>`(SELECT p.display_url FROM gallery_photos p WHERE p.gallery_id = ${galleries.id} AND p.is_hidden = false ORDER BY p.sort_order ASC, p.created_at ASC LIMIT 1)`,
      })
      .from(galleries)
      .leftJoin(clients, eq(galleries.clientId, clients.id))
      .leftJoin(projects, eq(galleries.projectId, projects.id))
      .leftJoin(gallery_photos as cp, eq(galleries.coverPhotoId, cp.id))
      .where(
        or(
          eq(galleries.slug, slug),
          eq(galleries.id, sql<number>(slug))
        )
      )
      .limit(1)
      .returning();

    const gallery =
      galleryResult.rows[0];

    if (!gallery) {
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

    if (
      gallery.expires_at &&
      new Date(
        String(
          gallery.expires_at,
        ),
      ).getTime() <=
        Date.now()
    ) {
      return NextResponse.json(
        {
          error:
            "Gallery expired.",
          expired: true,
          title:
            gallery.title,
        },
        {
          status: 410,
        },
      );
    }

    const clientId =
      gallery.client_id
        ? String(
            gallery.client_id,
          )
        : null;

    const session =
      await getGallerySession(
        String(
          gallery.id,
        ),
        true,
        clientId,
      );

    const galleryId =
      String(
        gallery.id,
      );

    const collectionsResult = await db
      .select({
        id: galleryCollections.id,
        title: galleryCollections.title,
        description: galleryCollections.description,
        photoCount: sql<number>`(SELECT COUNT(*)::int FROM gallery_photos p WHERE p.collection_id = ${galleryCollections.id} AND p.is_hidden = false)`,
      })
      .from(galleryCollections)
      .where(eq(galleryCollections.galleryId, galleryId))
      .orderBy(
        asc(galleryCollections.sortOrder),
        asc(galleryCollections.createdAt)
      )
      .returning();

    const photosResult = await db
      .select({
        id: galleryPhotos.id,
        filename: galleryPhotos.filename,
        originalUrl: galleryPhotos.originalUrl,
        displayUrl: galleryPhotos.displayUrl,
        thumbnailUrl: galleryPhotos.thumbnailUrl,
        sortOrder: galleryPhotos.sortOrder,
        isHidden: galleryPhotos.isHidden,
        width: galleryPhotos.width,
        height: galleryPhotos.height,
        isFavorite: sql<boolean>`COALESCE(${galleryPhotoActions.isFavorite}, ${galleryPhotos.isFavorite})`,
        isSelected: sql<boolean>`COALESCE(${galleryPhotoActions.isSelected}, ${galleryPhotos.isSelected})`,
        collectionTitle: galleryCollections.title,
      })
      .from(galleryPhotos)
      .leftJoin(galleryCollections, eq(galleryPhotos.collectionId, galleryCollections.id))
      .leftJoin(
        galleryPhotoActions,
        and(
          eq(galleryPhotoActions.photoId, galleryPhotos.id),
          eq(galleryPhotoActions.sessionId, session?.id ?? null)
        )
      )
      .where(
        and(
          eq(galleryPhotos.galleryId, galleryId),
          eq(galleryPhotos.isHidden, false)
        )
      )
      .orderBy(
        asc(galleryPhotos.sortOrder),
        asc(galleryPhotos.createdAt)
      )
      .returning();

    const [approvalResult] = await db
      .select()
      .from(galleryApprovals)
      .where(eq(galleryApprovals.galleryId, galleryId))
      .limit(1)
      .returning();

    const approval = approvalResult ?? null;

    const [themeResult] = await db
      .select()
      .from(galleryThemes)
      .where(eq(galleryThemes.galleryId, galleryId))
      .limit(1)
      .returning();

    const theme = themeResult ?? null;

    return NextResponse.json({
      gallery,
      collections:
        collections.rows,
      photos:
        photos.rows,
      approval:
        approval.rows[0] ||
        null,
      theme:
        theme.rows[0] ||
        null,
      sessionId:
        session?.id ||
        null,
    });
  } catch (error) {
    console.error(
      "GET /api/public/galleries/[slug]",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load public gallery.",
      },
      {
        status: 500,
      },
    );
  }
}
import { NextResponse } from "next/server";
import { and, eq, or, sql, asc } from "drizzle-orm";

import { db } from "@/db";
import { getGallerySession, requireGallerySession } from "@/lib/gallery/session";
import { comparePin } from "@/lib/gallery/pin";
import { galleries, clients, projects, galleryPhotos, galleryCollections, galleryPhotoActions, galleryApprovals, galleryThemes } from "@/db/schema";

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

    const galleryResult = await db
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
        expiresAt: galleries.expiresAt,
        clientId: galleries.clientId,
        clientName: clients.name,
        clientCompany: clients.company,
        projectName: projects.name,
        coverUrl: sql<string>`(SELECT p.display_url FROM gallery_photos p WHERE p.gallery_id = ${galleries.id} AND p.is_hidden = false ORDER BY p.sort_order ASC, p.created_at ASC LIMIT 1)`,
      })
      .from(galleries)
      .leftJoin(clients, eq(galleries.clientId, clients.id))
      .leftJoin(projects, eq(galleries.projectId, projects.id))
      .leftJoin(galleryPhotos, eq(galleries.coverPhotoId, galleryPhotos.id))
      .where(
        eq(galleries.slug, slug)
      )
      .limit(1);

    const gallery =
      galleryResult[0];

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
      gallery.expiresAt &&
      new Date(gallery.expiresAt).getTime() <= Date.now()
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
      gallery.clientId
        ? String(gallery.clientId)
        : null;

    // Check if gallery requires PIN authentication
    if (gallery.accessPin) {
      const existingSession = await getGallerySession(
        String(gallery.id),
        false,
        clientId,
      );

      if (!existingSession) {
        return NextResponse.json(
          { error: "Gallery requires PIN access." },
          { status: 401 },
        );
      }
    }

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
      );

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
          eq(galleryPhotoActions.sessionId, session?.id ?? sql`null`)
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
      );

    const [approvalResult] = await db
      .select()
      .from(galleryApprovals)
      .where(eq(galleryApprovals.galleryId, galleryId))
      .limit(1);

    const approval = approvalResult ?? null;

    const [themeResult] = await db
      .select()
      .from(galleryThemes)
      .where(eq(galleryThemes.galleryId, galleryId))
      .limit(1);

    const theme = themeResult ?? null;

    return NextResponse.json({
      gallery,
      collections: collectionsResult,
      photos: photosResult,
      approval,
      theme,
      sessionId: session?.id || null,
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
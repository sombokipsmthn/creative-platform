import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { sql, eq, and, asc, desc } from "drizzle-orm";

import { db } from "@/db";
import { getLocalUser } from "@/lib/auth/get-local-user";
import { hashPin } from "@/lib/gallery/pin";
import { galleries, galleryCollections, galleryPhotos, galleryApprovals, galleryDownloadPresets, galleryWatermarks, clients, projects } from "@/db/schema";

type Context = {
  params: Promise<{ id: string }>;
};

async function getCreator() {
  const session = await getCurrentSession();
    const userId = session?.user?.id ?? null;

  if (!userId) {
    return null;
  }

  try {
    return await getLocalUser(userId);
  } catch (e) {
    console.error("Creator not found for this route:", e);
    return null;
  }
}

export async function GET(_request: Request, context: Context) {
  try {
    const creator = await getCreator();

    if (!creator) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Gallery ID is required." },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------------
     * CORE GALLERY
     * --------------------------------------------------------
     *
     * This is the critical query. If this succeeds, the gallery
     * editor can load its main data.
     */
    const galleryResult = await db
      .select({
        id: galleries.id,
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
        clientEmail: clients.email,
        clientCompany: clients.company,
        projectName: projects.name,
        coverUrl: sql<string>`(SELECT p.display_url FROM galleryPhotos p WHERE p.gallery_id = ${galleries.id} AND p.is_hidden = false ORDER BY p.sort_order ASC, p.created_at ASC LIMIT 1)`,
      })
      .from(galleries)
      .leftJoin(clients, eq(galleries.clientId, clients.id))
      .leftJoin(projects, eq(galleries.projectId, projects.id))
      .leftJoin(galleryPhotos, eq(galleries.coverPhotoId, galleryPhotos.id))
      .where(and(eq(galleries.id, id), eq(galleries.creatorId, creator.id)))
      .limit(1)

    const gallery = galleryResult[0];

    if (!gallery) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 }
      );
    }

    /*
     * --------------------------------------------------------
     * CORE COLLECTIONS
     * --------------------------------------------------------
     */
    const collectionsResult = await db
      .select({
        id: galleryCollections.id,
        title: galleryCollections.title,
        description: galleryCollections.description,
        photoCount: sql<number>`(SELECT COUNT(*)::int FROM gallery_photos p WHERE p.collection_id = ${galleryCollections.id})`,
      })
      .from(galleryCollections)
      .where(eq(galleryCollections.galleryId, id))
      .orderBy(
        asc(galleryCollections.sortOrder),
        asc(galleryCollections.createdAt)
      )

    /*
     * --------------------------------------------------------
     * CORE PHOTOS
     * --------------------------------------------------------
     */
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
        altText: galleryPhotos.altText,
        caption: galleryPhotos.caption,
        isCover: galleryPhotos.isCover,
        createdAt: galleryPhotos.createdAt,
        updatedAt: galleryPhotos.updatedAt,
        collectionTitle: galleryCollections.title,
      })
      .from(galleryPhotos)
      .leftJoin(galleryCollections, eq(galleryPhotos.collectionId, galleryCollections.id))
      .where(eq(galleryPhotos.galleryId, id))
      .orderBy(
        asc(galleryPhotos.sortOrder),
        asc(galleryPhotos.createdAt)
      )

    /*
     * --------------------------------------------------------
     * OPTIONAL GALLERY FEATURES
     * --------------------------------------------------------
     *
     * These should never prevent the main gallery from loading.
     *
     * This is particularly useful while the database is being
     * migrated between Gallery Manager versions.
     */

    let approval: Record<string, unknown> | null = null;
    let presets: Record<string, unknown>[] = [];
    let watermark: Record<string, unknown> | null = null;

    try {
      const approvalResult = await db
        .select()
        .from(galleryApprovals)
        .where(eq(galleryApprovals.galleryId, id))
        .limit(1)
  
      approval = approvalResult[0] ?? null;
    } catch (error) {
      console.warn(
        "Gallery approval data unavailable:",
        error
      );
    }

    try {
      const presetsResult = await db
        .select()
        .from(galleryDownloadPresets)
        .where(eq(galleryDownloadPresets.galleryId, id))
        .orderBy(asc(galleryDownloadPresets.createdAt))
  
      presets = presetsResult;
    } catch (error) {
      console.warn(
        "Gallery download presets unavailable:",
        error
      );
    }

    try {
      const watermarkResult = await db
        .select()
        .from(galleryWatermarks)
        .where(eq(galleryWatermarks.galleryId, id))
        .limit(1)
  
      watermark = watermarkResult[0] ?? null;
    } catch (error) {
      console.warn(
        "Gallery watermark data unavailable:",
        error
      );
    }

    /*
     * --------------------------------------------------------
     * RESPONSE
     * --------------------------------------------------------
     */
    return NextResponse.json({
      gallery,
      collections: collectionsResult,
      photos: photosResult,
      approval,
      presets,
      watermark,
    });
  } catch (error) {
    console.error(
      "GET /api/galleries/[id] failed:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load gallery.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: Context
) {
  try {
    const creator = await getCreator();

    if (!creator) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Gallery ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const [currentGalleryResult] = await db
      .select()
      .from(galleries)
      .where(and(eq(galleries.id, id), eq(galleries.creatorId, creator.id)))
      .limit(1)

    if (!currentGalleryResult) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 }
      );
    }

    const title =
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : undefined;

    const description =
      body.description !== undefined
        ? body.description
        : undefined;

    const category =
      body.category !== undefined
        ? body.category
        : undefined;

    const clientId =
      body.clientId !== undefined
        ? body.clientId || null
        : undefined;

    const projectId =
      body.projectId !== undefined
        ? body.projectId || null
        : undefined;

    const slug =
      typeof body.slug === "string" && body.slug.trim()
        ? body.slug
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-_]+/g, "-")
        : undefined;

    const accessPin =
      body.accessPin !== undefined
        ? (typeof body.accessPin === "string" && body.accessPin.trim()
            ? await hashPin(body.accessPin.trim())
            : (body.accessPin === "" ? null : body.accessPin))
        : undefined;

    const status =
      body.status === "published" ||
      body.status === "draft"
        ? body.status
        : undefined;

    const coverPhotoId =
      body.coverPhotoId !== undefined
        ? body.coverPhotoId || null
        : undefined;

    const allowDownloads =
      body.allowDownloads !== undefined
        ? Boolean(body.allowDownloads)
        : undefined;

    const allowFavorites =
      body.allowFavorites !== undefined
        ? Boolean(body.allowFavorites)
        : undefined;

    const allowSelections =
      body.allowSelections !== undefined
        ? Boolean(body.allowSelections)
        : undefined;

    const expiresAt =
      body.expiresAt === undefined
        ? undefined
        : body.expiresAt
          ? new Date(body.expiresAt)
          : null;

    const expiryBehavior =
      body.expiryBehavior === "delete" ||
      body.expiryBehavior === "hide"
        ? body.expiryBehavior
        : undefined;

    if (
      expiresAt instanceof Date &&
      Number.isNaN(expiresAt.getTime())
    ) {
      return NextResponse.json(
        { error: "Invalid expiry date." },
        { status: 400 }
      );
    }

    const publishedAt =
      status === "published"
        ? sql`COALESCE(published_at, now())`
        : status === "draft"
          ? sql`NULL`
          : sql`published_at`;

    const result = await db
      .update(galleries)
      .set({
        title: title ?? undefined,
        description: description ?? undefined,
        category: category ?? undefined,
        clientId: clientId ?? null,
        projectId: projectId ?? null,
        slug: slug ?? undefined,
        accessPin: accessPin ?? undefined,
        status: status ?? undefined,
        coverPhotoId: coverPhotoId ?? null,
        allowDownloads: allowDownloads ?? undefined,
        allowFavorites: allowFavorites ?? undefined,
        allowSelections: allowSelections ?? undefined,
        expiresAt: expiresAt ?? undefined,
        expiryBehavior: expiryBehavior ?? undefined,
        publishedAt: status === "published" ? (publishedAt ?? new Date()) : null,
        updatedAt: new Date(),
      })
      .where(and(eq(galleries.id, id), eq(galleries.creatorId, creator.id)))
      .returning();

    return NextResponse.json({
      gallery: result,
    });
  } catch (error) {
    console.error(
      "PATCH /api/galleries/[id] failed:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to update gallery.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: Context
) {
  try {
    const creator = await getCreator();

    if (!creator) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Gallery ID is required." },
        { status: 400 }
      );
    }

    const result = await db
      .delete(galleries)
      .where(and(eq(galleries.id, id), eq(galleries.creatorId, creator.id)))

    if (!result) {
      return NextResponse.json(
        { error: "Gallery not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (error) {
    console.error(
      "DELETE /api/galleries/[id] failed:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to delete gallery.",
      },
      { status: 500 }
    );
  }
}
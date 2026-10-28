import { and, eq, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { galleries, galleryCollections, galleryPhotos, projects } from "@/db/schema";
import { canAccessGalleryMedia, isValidGalleryMediaKey } from "@/lib/gallery/media-access";
import { getCurrentUserFromRequest } from "@/lib/auth/get-current-user";
import { getGallerySession } from "@/lib/gallery/session";
import { getGalleryStorage } from "@/lib/gallery/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const key = new URL(request.url).searchParams.get("key") || "";
    if (!isValidGalleryMediaKey(key)) return NextResponse.json({ error: "Invalid media key." }, { status: 400 });

    const rows = await db.select({
      galleryId: galleryPhotos.galleryId,
      isHidden: galleryPhotos.isHidden,
      clientVisibility: galleryCollections.clientVisibility,
      photoSelection: galleryPhotos.portfolioSelection,
      collectionSelection: galleryCollections.portfolioSelection,
      portfolioMode: galleries.portfolioPublishMode,
      galleryStatus: galleries.status,
      galleryPublishedAt: galleries.publishedAt,
      accessPin: galleries.accessPin,
      expiresAt: galleries.expiresAt,
      projectId: galleries.projectId,
    })
      .from(galleryPhotos)
      .innerJoin(galleries, eq(galleryPhotos.galleryId, galleries.id))
      .leftJoin(galleryCollections, eq(galleryPhotos.collectionId, galleryCollections.id))
      .where(and(
        or(
          eq(galleryPhotos.storagePath, key),
          eq(galleryPhotos.originalPath, key),
          eq(galleryPhotos.displayPath, key),
          eq(galleryPhotos.thumbnailPath, key),
          eq(galleryPhotos.watermarkPath, key),
        ),
        sql`(${galleryCollections.id} IS NULL OR ${galleryCollections.galleryId} = ${galleryPhotos.galleryId})`,
      ))
      .limit(1);
    const media = rows[0];
    if (!media) return NextResponse.json({ error: "Media not found." }, { status: 404 });

    const gallery = await db.query.galleries.findFirst({ where: eq(galleries.id, media.galleryId) });
    if (!gallery) return NextResponse.json({ error: "Media not found." }, { status: 404 });

    const user = await getCurrentUserFromRequest(request);
    const owned = Boolean(user && gallery.creatorId === user.id);
    const now = new Date();
    const expired = Boolean(media.expiresAt && media.expiresAt <= now);
    const session = !owned && !expired ? await getGallerySession(gallery.id, false) : null;
    const project = !owned && !expired && media.projectId
      ? await db.query.projects.findFirst({ where: eq(projects.id, media.projectId) })
      : null;
    const publicPortfolio = !owned && !session && canAccessGalleryMedia({
      owner: false,
      hasSession: false,
      clientVisibility: (media.clientVisibility || "all") as "all" | "authorized" | "guest" | "none",
      isHidden: media.isHidden,
      expired,
      galleryStatus: media.galleryStatus,
      galleryPublishedAt: media.galleryPublishedAt,
      accessPin: media.accessPin,
      projectPublic: Boolean(project && project.creatorId === gallery.creatorId && project.visibility === "public"),
      projectPublishedAt: project?.publishedAt ?? null,
      portfolioMode: media.portfolioMode as "none" | "all" | "selected",
      collectionSelection: media.collectionSelection as "inherit" | "include" | "exclude" | null,
      photoSelection: media.photoSelection as "inherit" | "include" | "exclude" | null,
    });
    const authorizedSession = !owned && Boolean(session && canAccessGalleryMedia({
      owner: false,
      hasSession: true,
      sessionClientId: session?.clientId,
      clientVisibility: (media.clientVisibility || "all") as "all" | "authorized" | "guest" | "none",
      isHidden: media.isHidden,
      expired,
      galleryStatus: media.galleryStatus,
      galleryPublishedAt: media.galleryPublishedAt,
      accessPin: media.accessPin,
      projectPublic: false,
      projectPublishedAt: null,
      portfolioMode: "none",
      collectionSelection: null,
      photoSelection: null,
    }));
    if (!owned && !authorizedSession && !publicPortfolio) return NextResponse.json({ error: expired ? "Gallery expired." : "Unauthorized." }, { status: expired ? 410 : 401 });

    const object = await getGalleryStorage().getObject(key);
    if (!object) return NextResponse.json({ error: "Media not found." }, { status: 404 });
    return new NextResponse(new Uint8Array(object.body), { headers: {
      "Content-Type": object.contentType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": publicPortfolio && !session ? "public, max-age=300" : "private, no-store",
    } });
  } catch (error) {
    console.error("GET /api/public/galleries/media", error);
    return NextResponse.json({ error: "Unable to load media." }, { status: 500 });
  }
}

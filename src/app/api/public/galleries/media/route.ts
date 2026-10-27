import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { galleries, galleryCollections, galleryPhotos, projects } from "@/db/schema";
import { isPortfolioPhotoIncluded } from "@/lib/portfolio/gallery-curation";
import { getCurrentUserFromRequest } from "@/lib/auth/get-current-user";
import { getGallerySession } from "@/lib/gallery/session";
import { getGalleryStorage } from "@/lib/gallery/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const key = new URL(request.url).searchParams.get("key") || "";
    if (!key.startsWith("galleries/") || key.includes("..")) return NextResponse.json({ error: "Invalid media key." }, { status: 400 });
    const photo = await db.select({
      galleryId: galleryPhotos.galleryId,
      photoSelection: galleryPhotos.portfolioSelection,
      collectionSelection: galleryCollections.portfolioSelection,
      portfolioMode: galleries.portfolioPublishMode,
    })
      .from(galleryPhotos)
      .innerJoin(galleries, eq(galleryPhotos.galleryId, galleries.id))
      .leftJoin(galleryCollections, eq(galleryPhotos.collectionId, galleryCollections.id))
      .where(and(
        eq(galleryPhotos.galleryId, galleries.id),
        sql`${key} IN (${galleryPhotos.storagePath}, ${galleryPhotos.originalPath}, ${galleryPhotos.displayPath}, ${galleryPhotos.thumbnailPath}, ${galleryPhotos.watermarkPath})`,
      ))
      .limit(1);
    const galleryId = photo[0]?.galleryId || key.split("/")[1];
    const gallery = galleryId ? await db.query.galleries.findFirst({ where: eq(galleries.id, galleryId) }) : null;
    if (!gallery) return NextResponse.json({ error: "Media not found." }, { status: 404 });

    const user = await getCurrentUserFromRequest(request);
    const owned = user ? await db.select({ id: galleries.id }).from(galleries).where(and(eq(galleries.id, gallery.id), eq(galleries.creatorId, user.id))).limit(1) : [];
    const session = owned.length ? true : Boolean(await getGallerySession(gallery.id, false));
    const project = gallery.projectId ? await db.query.projects.findFirst({ where: eq(projects.id, gallery.projectId) }) : null;
    const curated = photo[0] ? isPortfolioPhotoIncluded(
      photo[0].portfolioMode as "none" | "all" | "selected",
      photo[0].collectionSelection as "inherit" | "include" | "exclude" | null,
      photo[0].photoSelection as "inherit" | "include" | "exclude" | null,
    ) : false;
    const publicPortfolio = gallery.status === "published" && !gallery.accessPin && (!gallery.expiresAt || gallery.expiresAt > new Date()) && project?.visibility === "public" && Boolean(project.publishedAt) && curated;
    if (!owned.length && !session && !publicPortfolio) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const object = await getGalleryStorage().getObject(key);
    if (!object) return NextResponse.json({ error: "Media not found." }, { status: 404 });
    return new NextResponse(new Uint8Array(object.body), { headers: { "Content-Type": object.contentType, "Cache-Control": publicPortfolio ? "public, max-age=300" : "private, max-age=300" } });
  } catch (error) {
    console.error("GET /api/public/galleries/media", error);
    return NextResponse.json({ error: "Unable to load media." }, { status: 500 });
  }
}

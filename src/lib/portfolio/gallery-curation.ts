import { and, asc, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { galleries, galleryCollections, galleryPhotos } from "@/db/schema";

export type PortfolioMode = "none" | "all" | "selected";
export type SelectionOverride = "inherit" | "include" | "exclude";

export function isClientPhotoVisible(visibility: "all" | "authorized" | "guest" | "none", clientId: string | null) {
  if (visibility === "none") return false;
  if (visibility === "authorized") return Boolean(clientId);
  if (visibility === "guest") return !clientId;
  return true;
}

export function isPortfolioPhotoIncluded(
  mode: PortfolioMode,
  collectionSelection: SelectionOverride | null | undefined,
  photoSelection: SelectionOverride | null | undefined,
) {
  if (photoSelection === "exclude") return false;
  if (photoSelection === "include") return true;
  if (collectionSelection === "exclude") return false;
  if (collectionSelection === "include") return true;
  return mode === "all";
}

export async function getCuratedGalleryMedia(creatorId: string) {
  const rows = await db
    .select({
      gallery: galleries,
      collection: galleryCollections,
      photo: galleryPhotos,
    })
    .from(galleries)
    .innerJoin(galleryPhotos, eq(galleryPhotos.galleryId, galleries.id))
    .leftJoin(galleryCollections, eq(galleryPhotos.collectionId, galleryCollections.id))
    .where(and(
      eq(galleries.creatorId, creatorId),
      eq(galleries.status, "published"),
      isNull(galleries.accessPin),
      or(isNull(galleries.expiresAt), gt(galleries.expiresAt, new Date())),
      eq(galleryPhotos.isHidden, false),
    ))
    .orderBy(asc(galleries.createdAt), asc(galleryPhotos.sortOrder), asc(galleryPhotos.createdAt));

  return rows.filter(({ gallery, collection, photo }) =>
    isPortfolioPhotoIncluded(
      gallery.portfolioPublishMode as PortfolioMode,
      collection?.portfolioSelection as SelectionOverride | undefined,
      photo.portfolioSelection as SelectionOverride,
    ),
  );
}

export async function hasPublishedPortfolioContent(creatorId: string) {
  const media = await getCuratedGalleryMedia(creatorId);
  if (media.length) return true;
  return false;
}

import { and, asc, eq, gt, isNull, isNotNull, or } from "drizzle-orm";

import { db } from "@/db";

import { galleries, galleryCollections, galleryPhotos, projects } from "@/db/schema";



export type PortfolioMode = "none" | "all" | "selected";

export type SelectionOverride = "inherit" | "include" | "exclude";



export function galleryMediaProxyUrl(objectPath: string | null | undefined) {

  return objectPath ? `/api/public/galleries/media?key=${encodeURIComponent(objectPath)}` : "";

}



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

    .innerJoin(projects, eq(galleries.projectId, projects.id))

    .innerJoin(galleryPhotos, eq(galleryPhotos.galleryId, galleries.id))

    .leftJoin(galleryCollections, eq(galleryPhotos.collectionId, galleryCollections.id))

    .where(and(

      eq(galleries.creatorId, creatorId),

      eq(galleries.status, "published"),

      isNotNull(galleries.publishedAt),

      eq(projects.creatorId, creatorId),

      eq(projects.visibility, "public"),

      eq(projects.status, "published"),

      isNotNull(projects.publishedAt),

      isNull(galleries.accessPin),

      or(isNull(galleries.expiresAt), gt(galleries.expiresAt, new Date())),

      eq(galleryPhotos.isHidden, false),

      or(eq(galleryCollections.clientVisibility, "all"), isNull(galleryCollections.id)), 

    ))

    .orderBy(asc(galleries.createdAt), asc(galleryPhotos.sortOrder), asc(galleryPhotos.createdAt));



  return rows.filter(({ gallery, collection, photo }) =>

    isPortfolioPhotoIncluded(

      gallery.portfolioPublishMode as PortfolioMode,

      collection?.portfolioSelection as SelectionOverride | undefined,

      photo.portfolioSelection as SelectionOverride,

    ),

  ).map((entry) => ({

    ...entry,

    photo: {

      ...entry.photo,

      originalUrl: galleryMediaProxyUrl(entry.photo.originalPath || entry.photo.storagePath) || entry.photo.originalUrl,

      displayUrl: galleryMediaProxyUrl(entry.photo.displayPath || entry.photo.storagePath) || entry.photo.displayUrl,

      thumbnailUrl: galleryMediaProxyUrl(entry.photo.thumbnailPath || entry.photo.storagePath) || entry.photo.thumbnailUrl,

    },

  }));

}



export async function hasPublishedPortfolioContent(creatorId: string) {

  const media = await getCuratedGalleryMedia(creatorId);

  if (media.length) return true;

  return false;

}


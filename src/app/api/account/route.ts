import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users, galleries, galleryPhotos, projectMedia, uploadAudit } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";
import { getGalleryStorage } from "@/lib/gallery/storage";

/**
 * DELETE /api/account
 *
 * Permanently deletes the authenticated creator's account and all records
 * connected to that creator. A confirmation phrase is required to reduce
 * accidental deletion. Storage objects are removed before database records;
 * if storage cleanup fails, the database account is left intact.
 *
 * Equipment is global catalogue data and is deliberately never deleted here.
 */
export async function DELETE(request: Request) {
  return withCreatorApi(request, async (_request, creator) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "A confirmation phrase is required." }, { status: 400 });
    }

    const confirmation =
      typeof body === "object" && body !== null && "confirmation" in body
        ? (body as { confirmation?: unknown }).confirmation
        : null;

    if (confirmation !== "DELETE MY CREATOR ACCOUNT") {
      return NextResponse.json(
        { error: 'Type "DELETE MY CREATOR ACCOUNT" to confirm permanent deletion.' },
        { status: 400 },
      );
    }

    const [account] = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.id, creator.id))
      .limit(1);

    if (!account) {
      return NextResponse.json({ error: "Creator account not found." }, { status: 404 });
    }

    const [ownedGalleries, ownedPhotos, ownedProjectMedia, ownedUploads] = await Promise.all([
      db.select({ id: galleries.id }).from(galleries).where(eq(galleries.creatorId, creator.id)),
      db.select({
        storagePath: galleryPhotos.storagePath,
        originalPath: galleryPhotos.originalPath,
        displayPath: galleryPhotos.displayPath,
        thumbnailPath: galleryPhotos.thumbnailPath,
        watermarkPath: galleryPhotos.watermarkPath,
        originalUrl: galleryPhotos.originalUrl,
        displayUrl: galleryPhotos.displayUrl,
        thumbnailUrl: galleryPhotos.thumbnailUrl,
      }).from(galleryPhotos)
        .innerJoin(galleries, eq(galleryPhotos.galleryId, galleries.id))
        .where(eq(galleries.creatorId, creator.id)),
      db.select({
        storagePath: projectMedia.storagePath,
        originalPath: projectMedia.originalPath,
        displayPath: projectMedia.displayPath,
        thumbnailPath: projectMedia.thumbnailPath,
        watermarkPath: projectMedia.watermarkPath,
        originalUrl: projectMedia.originalUrl,
        displayUrl: projectMedia.displayUrl,
        thumbnailUrl: projectMedia.thumbnailUrl,
      }).from(projectMedia).where(eq(projectMedia.creatorId, creator.id)),
      db.select({ blobPath: uploadAudit.blobPath }).from(uploadAudit).where(eq(uploadAudit.userId, creator.id)),
    ]);

    const storageObjects = new Set<string>();
    for (const photo of ownedPhotos) {
      for (const value of Object.values(photo)) if (value) storageObjects.add(value);
    }
    for (const media of ownedProjectMedia) {
      for (const value of Object.values(media)) if (value) storageObjects.add(value);
    }
    for (const upload of ownedUploads) if (upload.blobPath) storageObjects.add(upload.blobPath);

    try {
      const storage = getGalleryStorage();
      for (const objectPath of storageObjects) {
        await storage.deleteObject(objectPath);
      }
    } catch (error) {
      console.error("Account deletion stopped because storage cleanup failed.", {
        creatorId: creator.id,
        error: error instanceof Error ? error.message : "Unknown storage error",
      });
      return NextResponse.json(
        { error: "Account data was not deleted because some uploaded files could not be removed. Please retry or contact support." },
        { status: 502 },
      );
    }

    // Most creator-owned rows cascade through creatorId/userId foreign keys.
    // The explicit gallery cleanup ensures tables without a direct creator FK
    // are removed by their gallery foreign keys before the account is deleted.
    try {
      await db.transaction(async (tx) => {
        for (const gallery of ownedGalleries) {
          await tx.delete(galleries).where(eq(galleries.id, gallery.id));
        }
        await tx.delete(users).where(eq(users.id, creator.id));
      });
    } catch (error) {
      console.error("Creator account database deletion failed.", {
        creatorId: creator.id,
        error: error instanceof Error ? error.message : "Unknown database error",
      });
      return NextResponse.json(
        { error: "Uploaded files were cleaned up, but the account records could not be fully deleted. Please contact support before retrying." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Creator account and associated platform data were permanently deleted.",
      deletedStorageObjects: storageObjects.size,
    });
  });
}

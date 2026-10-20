import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { creatorGalleryDefaults } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";

export async function GET(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const defaults = await db.query.creatorGalleryDefaults.findFirst({
        where: eq(creatorGalleryDefaults.userId, user.id),
      });

      return NextResponse.json({
        defaults: defaults || {
          defaultPhotoSelectionLimit: 25,
          defaultExpirationDays: 60,
          defaultMasterPin: '4821',
          defaultAllowDownloads: true,
          defaultAllowFavorites: true,
          defaultAllowSelections: true,
          defaultRequirePin: false,
        },
      });
    } catch (error) {
      console.error("GET /api/gallery-defaults error:", error);
      return NextResponse.json(
        { error: "Failed to fetch gallery defaults" },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const body = await request.json();

      const allowedUpdates: Partial<typeof creatorGalleryDefaults.$inferInsert> = {};

      if (typeof body.defaultPhotoSelectionLimit === "number") {
        allowedUpdates.defaultPhotoSelectionLimit = Math.min(200, Math.max(1, Math.round(body.defaultPhotoSelectionLimit)));
      }
      if (typeof body.defaultExpirationDays === "number") {
        allowedUpdates.defaultExpirationDays = Math.min(365, Math.max(1, Math.round(body.defaultExpirationDays)));
      }
      if (typeof body.defaultMasterPin === "string") {
        allowedUpdates.defaultMasterPin = body.defaultMasterPin.slice(0, 10);
      }
      if (typeof body.defaultAllowDownloads === "boolean") {
        allowedUpdates.defaultAllowDownloads = body.defaultAllowDownloads;
      }
      if (typeof body.defaultAllowFavorites === "boolean") {
        allowedUpdates.defaultAllowFavorites = body.defaultAllowFavorites;
      }
      if (typeof body.defaultAllowSelections === "boolean") {
        allowedUpdates.defaultAllowSelections = body.defaultAllowSelections;
      }
      if (typeof body.defaultRequirePin === "boolean") {
        allowedUpdates.defaultRequirePin = body.defaultRequirePin;
      }

      if (Object.keys(allowedUpdates).length === 0) {
        return NextResponse.json({ error: "No updates provided" }, { status: 400 });
      }

      const [updated] = await db
        .insert(creatorGalleryDefaults)
        .values({
          userId: user.id,
          ...allowedUpdates,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: creatorGalleryDefaults.userId,
          set: {
            ...allowedUpdates,
            updatedAt: new Date(),
          },
        })
        .returning();

      return NextResponse.json({ defaults: updated });
    } catch (error) {
      console.error("PATCH /api/gallery-defaults error:", error);
      return NextResponse.json(
        { error: "Failed to update gallery defaults" },
        { status: 500 }
      );
    }
  });
}

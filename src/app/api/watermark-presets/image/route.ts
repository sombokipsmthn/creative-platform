import { NextResponse } from "next/server";
import sharp from "sharp";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { galleryWatermarkPresets } from "@/db/schema";
import { ApiError, withCreatorApi } from "@/lib/api/route-boundaries";
import { getGalleryStorage } from "@/lib/gallery/storage";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    const form = await request.formData();
    const presetId = String(form.get("presetId") || "");
    const file = form.get("file");
    if (!presetId) throw new ApiError("Preset ID is required.", 400);
    if (!(file instanceof File)) throw new ApiError("A PNG watermark file is required.", 400);
    if (file.type !== "image/png") throw new ApiError("Watermark images must be PNG files.", 400);
    if (file.size === 0 || file.size > MAX_BYTES) throw new ApiError("Watermark PNG files must be smaller than 5 MB.", 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw new ApiError("The uploaded file is not a valid PNG.", 400);
    const metadata = await sharp(buffer, { failOn: "error" }).metadata();
    if (!metadata.width || !metadata.height || metadata.width > 5000 || metadata.height > 5000) {
      throw new ApiError("Watermark images must have dimensions between 1 and 5000 pixels.", 400);
    }

    const [preset] = await db.select().from(galleryWatermarkPresets)
      .where(and(eq(galleryWatermarkPresets.id, presetId), eq(galleryWatermarkPresets.creatorId, user.id))).limit(1);
    if (!preset) throw new ApiError("Preset not found.", 404);

    const storage = getGalleryStorage();
    const path = `watermarks/${user.id}/${preset.id}/${crypto.randomUUID()}.png`;
    const stored = await storage.putObject({ path, body: buffer, contentType: "image/png" });
    if (preset.imagePath) await storage.deleteObject(preset.imagePath).catch(() => undefined);

    const [updated] = await db.update(galleryWatermarkPresets).set({
      imageUrl: stored.url,
      imagePath: stored.path,
      imageFilename: file.name.slice(0, 180),
      imageMimeType: "image/png",
      updatedAt: new Date(),
    }).where(and(eq(galleryWatermarkPresets.id, preset.id), eq(galleryWatermarkPresets.creatorId, user.id))).returning();
    return NextResponse.json({ preset: updated });
  });
}

export async function DELETE(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    const body = await request.json().catch(() => null) as { presetId?: string } | null;
    const presetId = body?.presetId || "";
    if (!presetId) throw new ApiError("Preset ID is required.", 400);
    const [preset] = await db.select().from(galleryWatermarkPresets)
      .where(and(eq(galleryWatermarkPresets.id, presetId), eq(galleryWatermarkPresets.creatorId, user.id))).limit(1);
    if (!preset) throw new ApiError("Preset not found.", 404);
    if (preset.imagePath) await getGalleryStorage().deleteObject(preset.imagePath).catch(() => undefined);
    const [updated] = await db.update(galleryWatermarkPresets).set({ imageUrl: null, imagePath: null, imageFilename: null, imageMimeType: null, updatedAt: new Date() })
      .where(and(eq(galleryWatermarkPresets.id, preset.id), eq(galleryWatermarkPresets.creatorId, user.id))).returning();
    return NextResponse.json({ preset: updated });
  });
}

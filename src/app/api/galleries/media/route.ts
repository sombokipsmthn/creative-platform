import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { galleryPhotos, galleries } from "@/db/schema";
import { getCurrentUserFromRequest } from "@/lib/auth/get-current-user";
import { getGallerySession } from "@/lib/gallery/session";
import { getGalleryStorage } from "@/lib/gallery/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const key = new URL(request.url).searchParams.get("key") || "";
    if (!key.startsWith("galleries/") || key.includes("..")) return NextResponse.json({ error: "Invalid media key." }, { status: 400 });

    const photo = await db.select({ galleryId: galleryPhotos.galleryId })
      .from(galleryPhotos).where(eq(galleryPhotos.storagePath, key)).limit(1);
    const match = photo[0];
    const galleryId = match?.galleryId || key.split("/")[1];
    if (!galleryId) return NextResponse.json({ error: "Media not found." }, { status: 404 });

    const user = await getCurrentUserFromRequest(request);
    const owned = user ? await db.select({ id: galleries.id }).from(galleries).where(and(eq(galleries.id, galleryId), eq(galleries.creatorId, user.id))).limit(1) : [];
    const gallery = await db.query.galleries.findFirst({ where: eq(galleries.id, galleryId) });
    const session = owned.length ? true : gallery ? Boolean(await getGallerySession(gallery.id, false)) : false;
    if (!owned.length && !session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const object = await getGalleryStorage().getObject(key);
    if (!object) return NextResponse.json({ error: "Media not found." }, { status: 404 });
    return new NextResponse(new Uint8Array(object.body), { headers: { "Content-Type": object.contentType, "Cache-Control": "private, max-age=300" } });
  } catch (error) {
    console.error("GET /api/galleries/media", error);
    return NextResponse.json({ error: "Unable to load media." }, { status: 500 });
  }
}

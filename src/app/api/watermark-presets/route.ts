import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { galleryWatermarkPresets } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";

const positions = new Set(["top-left", "top-right", "bottom-left", "bottom-right", "center"]);
const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.round(number))) : fallback;
};

function parsePreset(body: unknown) {
  const value = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const name = typeof value.name === "string" ? value.name.trim().slice(0, 80) : "";
  if (!name) return { error: "Preset name is required." } as const;
  const text = typeof value.text === "string" ? value.text.trim().slice(0, 120) : "KIPSMTHN";
  return {
    value: {
      name,
      enabled: value.enabled !== false,
      type: value.type === "image" ? "image" : "text",
      text: text || "KIPSMTHN",
      position: typeof value.position === "string" && positions.has(value.position) ? value.position : "bottom-right",
      opacity: clamp(value.opacity, 0, 100, 55),
      fontSize: clamp(value.fontSize, 12, 160, 42),
      imageUrl: typeof value.imageUrl === "string" ? value.imageUrl : null,
      imagePath: typeof value.imagePath === "string" ? value.imagePath : null,
      imageFilename: typeof value.imageFilename === "string" ? value.imageFilename.slice(0, 180) : null,
      imageMimeType: value.imageMimeType === "image/png" ? "image/png" : null,
    },
  } as const;
}

export async function GET(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    const presets = await db.select().from(galleryWatermarkPresets)
      .where(eq(galleryWatermarkPresets.creatorId, user.id))
      .orderBy(asc(galleryWatermarkPresets.name));
    return NextResponse.json({ presets });
  });
}

export async function POST(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    const parsed = parsePreset(await request.json().catch(() => null));
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    try {
      const [preset] = await db.insert(galleryWatermarkPresets)
        .values({ creatorId: user.id, ...parsed.value })
        .returning();
      return NextResponse.json({ preset }, { status: 201 });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "23505") {
        return NextResponse.json({ error: "A preset with that name already exists." }, { status: 409 });
      }
      throw error;
    }
  });
}

export async function PATCH(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "Preset ID is required." }, { status: 400 });
    const parsed = parsePreset(body);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const [preset] = await db.update(galleryWatermarkPresets)
      .set({ ...parsed.value, updatedAt: new Date() })
      .where(and(eq(galleryWatermarkPresets.id, id), eq(galleryWatermarkPresets.creatorId, user.id)))
      .returning();
    if (!preset) return NextResponse.json({ error: "Preset not found." }, { status: 404 });
    return NextResponse.json({ preset });
  });
}

export async function DELETE(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "Preset ID is required." }, { status: 400 });
    const [deleted] = await db.delete(galleryWatermarkPresets)
      .where(and(eq(galleryWatermarkPresets.id, id), eq(galleryWatermarkPresets.creatorId, user.id)))
      .returning({ id: galleryWatermarkPresets.id });
    if (!deleted) return NextResponse.json({ error: "Preset not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  });
}
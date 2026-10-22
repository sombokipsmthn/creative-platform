import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { creatorWorkspaceBranding } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";

export async function GET(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const branding = await db.query.creatorWorkspaceBranding.findFirst({
        where: eq(creatorWorkspaceBranding.userId, user.id),
      });

      return NextResponse.json({
        branding: branding || {
          customDomain: null,
          hidePlatformBranding: true,
          headerLogoUrl: null,
          faviconUrl: null,
        },
      });
    } catch (error) {
      console.error("GET /api/workspace/branding error:", error);
      return NextResponse.json(
        { error: "Failed to fetch workspace branding" },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const body = await request.json();

      const allowedUpdates: Partial<typeof creatorWorkspaceBranding.$inferInsert> = {};

      if (typeof body.customDomain === "string") {
        allowedUpdates.customDomain = body.customDomain.trim() || null;
      }
      if (typeof body.hidePlatformBranding === "boolean") {
        allowedUpdates.hidePlatformBranding = body.hidePlatformBranding;
      }
      if (typeof body.headerLogoUrl === "string") {
        allowedUpdates.headerLogoUrl = body.headerLogoUrl.trim() || null;
      }
      if (typeof body.faviconUrl === "string") {
        allowedUpdates.faviconUrl = body.faviconUrl.trim() || null;
      }

      if (Object.keys(allowedUpdates).length === 0) {
        return NextResponse.json({ error: "No updates provided" }, { status: 400 });
      }

      const [updated] = await db
        .insert(creatorWorkspaceBranding)
        .values({
          userId: user.id,
          ...allowedUpdates,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: creatorWorkspaceBranding.userId,
          set: {
            ...allowedUpdates,
            updatedAt: new Date(),
          },
        })
        .returning();

      return NextResponse.json({ branding: updated });
    } catch (error) {
      console.error("PATCH /api/workspace/branding error:", error);
      return NextResponse.json(
        { error: "Failed to update workspace branding" },
        { status: 500 }
      );
    }
  });
}

import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { creatorBranding, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { canUseCustomBranding } from "@/lib/entitlements";

export async function GET() {
  try {
    const session = await getCurrentSession();
    const userId = session?.user?.id ?? null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has custom branding entitlement
    const allowed = await canUseCustomBranding(userId);

    // Get creator branding
    const [branding] = await db
      .select()
      .from(creatorBranding)
      .where(eq(creatorBranding.userId, userId))
      .limit(1);

    return NextResponse.json({
      branding: branding || {
        studioName: null,
        logoLightUrl: null,
        logoDarkUrl: null,
        logoTransparentUrl: null,
        logoSvgUrl: null,
        logoSize: 'medium',
        brandColor: '#000000',
        coverBrandingVisible: true,
        navBrandingVisible: true,
      },
      canUseBranding: allowed,
    });
  } catch (error) {
    console.error("GET /api/creator/branding failed:", error);
    return NextResponse.json(
      { error: "Unable to load branding." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentSession();
    const userId = session?.user?.id ?? null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has custom branding entitlement
    const allowed = await canUseCustomBranding(userId);

    if (!allowed) {
      return NextResponse.json(
        { error: "Custom branding is a paid feature. Upgrade your plan to unlock." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const [result] = await db
      .insert(creatorBranding)
      .values({
        userId,
        studioName: body.studioName || null,
        logoLightUrl: body.logoLightUrl || null,
        logoDarkUrl: body.logoDarkUrl || null,
        logoTransparentUrl: body.logoTransparentUrl || null,
        logoSvgUrl: body.logoSvgUrl || null,
        logoSize: body.logoSize || 'medium',
        brandColor: body.brandColor || '#000000',
        coverBrandingVisible: body.coverBrandingVisible ?? true,
        navBrandingVisible: body.navBrandingVisible ?? true,
      })
      .onConflictDoUpdate({
        target: creatorBranding.userId,
        set: {
          studioName: body.studioName || null,
          logoLightUrl: body.logoLightUrl || null,
          logoDarkUrl: body.logoDarkUrl || null,
          logoTransparentUrl: body.logoTransparentUrl || null,
          logoSvgUrl: body.logoSvgUrl || null,
          logoSize: body.logoSize || 'medium',
          brandColor: body.brandColor || '#000000',
          coverBrandingVisible: body.coverBrandingVisible ?? true,
          navBrandingVisible: body.navBrandingVisible ?? true,
          updatedAt: new Date(),
        },
      })
      .returning();

    return NextResponse.json({ branding: result });
  } catch (error) {
    console.error("PATCH /api/creator/branding failed:", error);
    return NextResponse.json(
      { error: "Unable to update branding." },
      { status: 500 },
    );
  }
}
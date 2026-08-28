import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { creatorProfiles, creatorBusinessProfiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/get-current-user";

/* =========================================================
   GET /api/profile
   =========================================================
   Returns the personal and business profiles for the current creator.
   ========================================================= */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile, businessProfile] = await Promise.all([
      db.query.creatorProfiles.findFirst({
        where: eq(creatorProfiles.userId, user.id),
      }),
      db.query.creatorBusinessProfiles.findFirst({
        where: eq(creatorBusinessProfiles.userId, user.id),
      }),
    ]);

    return NextResponse.json({
      profile,
      businessProfile,
    });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/* =========================================================
   PATCH /api/profile
   =========================================================
   Updates the personal or business profile.
   ========================================================= */
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { profile, businessProfile } = body;

    const updates = [];

    if (profile) {
      updates.push(
        db
          .insert(creatorProfiles)
          .values({
            userId: user.id,
            ...profile,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: creatorProfiles.userId,
            set: { ...profile, updatedAt: new Date() },
          })
          .returning()
      );
    }

    if (businessProfile) {
      updates.push(
        db
          .insert(creatorBusinessProfiles)
          .values({
            userId: user.id,
            ...businessProfile,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: creatorBusinessProfiles.userId,
            set: { ...businessProfile, updatedAt: new Date() },
          })
          .returning()
      );
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const results = await Promise.all(updates);

    return NextResponse.json({
      success: true,
      updated: results.flat(),
    });
  } catch (error) {
    console.error("PATCH /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { creatorProfiles, creatorBusinessProfiles, users } from "@/db/schema";
import getCurrentUser from "@/lib/auth/get-current-user";

/* =========================================================
   GET /api/profile
   =========================================================
   Returns the authenticated creator's account, personal profile,
   and business profile. No demo/default creator data is used.
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
      user,
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
   Updates only fields that actually exist in the database schema.
   ========================================================= */
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const profile = body?.profile ?? null;
    const businessProfile = body?.businessProfile ?? null;
    const userUpdates = body?.user ?? null;

    const operations: Promise<unknown>[] = [];

    if (userUpdates) {
      const allowedUserUpdates: Partial<typeof users.$inferInsert> = {};

      if (typeof userUpdates.name === "string") {
        allowedUserUpdates.name = userUpdates.name.trim();
      }

      if (typeof userUpdates.handle === "string") {
        allowedUserUpdates.handle = userUpdates.handle.trim() || null;
      }

      if (Object.keys(allowedUserUpdates).length > 0) {
        operations.push(
          db
            .update(users)
            .set({
              ...allowedUserUpdates,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id))
            .returning()
            .then((result) => result[0])
        );
      }
    }

    if (profile) {
      const allowedProfileUpdates: Partial<typeof creatorProfiles.$inferInsert> = {};

      if (typeof profile.bio === "string") allowedProfileUpdates.bio = profile.bio;
      if (typeof profile.avatarUrl === "string") allowedProfileUpdates.avatarUrl = profile.avatarUrl;
      if (typeof profile.website === "string") allowedProfileUpdates.website = profile.website;
      if (typeof profile.location === "string") allowedProfileUpdates.location = profile.location;

      if (Object.keys(allowedProfileUpdates).length > 0) {
        operations.push(
          db
            .insert(creatorProfiles)
            .values({
              userId: user.id,
              ...allowedProfileUpdates,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: creatorProfiles.userId,
              set: {
                ...allowedProfileUpdates,
                updatedAt: new Date(),
              },
            })
            .returning()
            .then((result) => result[0])
        );
      }
    }

    if (businessProfile) {
      const allowedBusinessUpdates: Partial<typeof creatorBusinessProfiles.$inferInsert> = {};

      if (typeof businessProfile.businessName === "string") {
        allowedBusinessUpdates.businessName = businessProfile.businessName;
      }
      if (typeof businessProfile.phone === "string") {
        allowedBusinessUpdates.phone = businessProfile.phone;
      }
      if (typeof businessProfile.kraPin === "string") {
        allowedBusinessUpdates.kraPin = businessProfile.kraPin;
      }
      if (typeof businessProfile.vatNumber === "string") {
        allowedBusinessUpdates.vatNumber = businessProfile.vatNumber;
      }
      if (typeof businessProfile.currency === "string") {
        allowedBusinessUpdates.currency = businessProfile.currency;
      }
      if (typeof businessProfile.depositPercentage === "number") {
        allowedBusinessUpdates.depositPercentage = businessProfile.depositPercentage;
      }
      if (typeof businessProfile.whtRate === "number") {
        allowedBusinessUpdates.whtRate = businessProfile.whtRate;
      }
      if (typeof businessProfile.vatRegistered === "boolean") {
        allowedBusinessUpdates.vatRegistered = businessProfile.vatRegistered;
      }

      if (Object.keys(allowedBusinessUpdates).length > 0) {
        operations.push(
          db
            .insert(creatorBusinessProfiles)
            .values({
              userId: user.id,
              ...allowedBusinessUpdates,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: creatorBusinessProfiles.userId,
              set: {
                ...allowedBusinessUpdates,
                updatedAt: new Date(),
              },
            })
            .returning()
            .then((result) => result[0])
        );
      }
    }

    if (operations.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const updated = await Promise.all(operations);

    return NextResponse.json({
      success: true,
      updated,
    });
  } catch (error) {
    console.error("PATCH /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

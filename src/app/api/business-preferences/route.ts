import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { creatorBusinessProfiles } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";

export async function GET(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const prefs = await db.query.creatorBusinessProfiles.findFirst({
        where: eq(creatorBusinessProfiles.userId, user.id),
      });

      return NextResponse.json({
        preferences: prefs || {
          kraPin: '',
          vatRegistered: false,
          vatNumber: '',
          currency: 'KES',
          depositPercentage: 50,
          whtRate: 0,
        },
      });
    } catch (error) {
      console.error("GET /api/business-preferences error:", error);
      return NextResponse.json(
        { error: "Failed to fetch business preferences" },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const body = await request.json();

      const allowedUpdates: Partial<typeof creatorBusinessProfiles.$inferInsert> = {};

      if (typeof body.kraPin === "string") {
        allowedUpdates.kraPin = body.kraPin.trim().toUpperCase().slice(0, 20);
      }
      if (typeof body.vatRegistered === "boolean") {
        allowedUpdates.vatRegistered = body.vatRegistered;
      }
      if (typeof body.vatNumber === "string") {
        allowedUpdates.vatNumber = body.vatNumber.trim().slice(0, 50);
      }
      if (typeof body.currency === "string") {
        allowedUpdates.currency = body.currency.toUpperCase().slice(0, 3);
      }
      if (typeof body.depositPercentage === "number") {
        allowedUpdates.depositPercentage = Math.min(100, Math.max(0, Math.round(body.depositPercentage)));
      }
      if (typeof body.whtRate === "number") {
        allowedUpdates.whtRate = Math.min(100, Math.max(0, Math.round(body.whtRate)));
      }

      if (Object.keys(allowedUpdates).length === 0) {
        return NextResponse.json({ error: "No updates provided" }, { status: 400 });
      }

      const [updated] = await db
        .insert(creatorBusinessProfiles)
        .values({
          userId: user.id,
          ...allowedUpdates,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: creatorBusinessProfiles.userId,
          set: {
            ...allowedUpdates,
            updatedAt: new Date(),
          },
        })
        .returning();

      return NextResponse.json({ preferences: updated });
    } catch (error) {
      console.error("PATCH /api/business-preferences error:", error);
      return NextResponse.json(
        { error: "Failed to update business preferences" },
        { status: 500 }
      );
    }
  });
}

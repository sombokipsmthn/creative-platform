import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { creatorNotificationPreferences } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";

export async function GET(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const prefs = await db.query.creatorNotificationPreferences.findFirst({
        where: eq(creatorNotificationPreferences.userId, user.id),
      });

      return NextResponse.json({
        preferences: prefs || {
          gallerySelections: true,
          galleryComments: true,
          galleryShares: true,
          galleryApprovals: true,
          contractSigned: true,
          contractViewed: true,
          contractDeclined: true,
          invoicePaid: true,
          invoiceOverdue: true,
          paymentReceived: true,
          emailEnabled: true,
          inAppEnabled: true,
        },
      });
    } catch (error) {
      console.error("GET /api/notifications error:", error);
      return NextResponse.json(
        { error: "Failed to fetch notification preferences" },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const body = await request.json();

      const allowedUpdates: Partial<typeof creatorNotificationPreferences.$inferInsert> = {};

      const booleanFields = [
        'gallerySelections', 'galleryComments', 'galleryShares', 'galleryApprovals',
        'contractSigned', 'contractViewed', 'contractDeclined',
        'invoicePaid', 'invoiceOverdue', 'paymentReceived',
        'emailEnabled', 'inAppEnabled'
      ] as const;

      for (const field of booleanFields) {
        if (typeof body[field] === "boolean") {
          allowedUpdates[field] = body[field];
        }
      }

      if (Object.keys(allowedUpdates).length === 0) {
        return NextResponse.json({ error: "No updates provided" }, { status: 400 });
      }

      const [updated] = await db
        .insert(creatorNotificationPreferences)
        .values({
          userId: user.id,
          ...allowedUpdates,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: creatorNotificationPreferences.userId,
          set: {
            ...allowedUpdates,
            updatedAt: new Date(),
          },
        })
        .returning();

      return NextResponse.json({ preferences: updated });
    } catch (error) {
      console.error("PATCH /api/notifications error:", error);
      return NextResponse.json(
        { error: "Failed to update notification preferences" },
        { status: 500 }
      );
    }
  });
}

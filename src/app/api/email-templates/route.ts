import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { creatorEmailTemplates } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";

export async function GET(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const templates = await db.query.creatorEmailTemplates.findFirst({
        where: eq(creatorEmailTemplates.userId, user.id),
      });

      return NextResponse.json({
        templates: templates || {
          invitationSubject: 'Your Private Client Gallery is Ready — KIPSMTHN',
          invitationBody: 'Hello {ClientName},\n\nYour private gallery "{GalleryTitle}" is now live on KIPSMTHN.\n\nUse your access PIN: {PIN} to view, favorite, and download your deliverables.\n\nBest regards,\n{CreatorName}',
          reminderSubject: 'Reminder: Your gallery "{GalleryTitle}" expires in {DaysRemaining} days',
          reminderBody: 'Hello {ClientName},\n\nThis is a friendly reminder that your access to "{GalleryTitle}" will expire on {ExpiryDate}.\n\nVisit the gallery to make your final selections and downloads.\n\nBest regards,\n{CreatorName}',
        },
      });
    } catch (error) {
      console.error("GET /api/email-templates error:", error);
      return NextResponse.json(
        { error: "Failed to fetch email templates" },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const body = await request.json();

      const allowedUpdates: Partial<typeof creatorEmailTemplates.$inferInsert> = {};

      if (typeof body.invitationSubject === "string") {
        allowedUpdates.invitationSubject = body.invitationSubject.trim().slice(0, 200);
      }
      if (typeof body.invitationBody === "string") {
        allowedUpdates.invitationBody = body.invitationBody.slice(0, 5000);
      }
      if (typeof body.reminderSubject === "string") {
        allowedUpdates.reminderSubject = body.reminderSubject.trim().slice(0, 200);
      }
      if (typeof body.reminderBody === "string") {
        allowedUpdates.reminderBody = body.reminderBody.slice(0, 5000);
      }

      if (Object.keys(allowedUpdates).length === 0) {
        return NextResponse.json({ error: "No updates provided" }, { status: 400 });
      }

      const [updated] = await db
        .insert(creatorEmailTemplates)
        .values({
          userId: user.id,
          ...allowedUpdates,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: creatorEmailTemplates.userId,
          set: {
            ...allowedUpdates,
            updatedAt: new Date(),
          },
        })
        .returning();

      return NextResponse.json({ templates: updated });
    } catch (error) {
      console.error("PATCH /api/email-templates error:", error);
      return NextResponse.json(
        { error: "Failed to update email templates" },
        { status: 500 }
      );
    }
  });
}

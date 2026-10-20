import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
    }

    // Find the local user
    const localUser = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!localUser) {
      return NextResponse.json({ error: "Local creator account not found." }, { status: 404 });
    }

    // Update the user's onboarding status to "skipped" (not "complete")
    // This allows them to resume later from Settings
    const [updatedUser] = await db
      .update(users)
      .set({
        onboardingStatus: "skipped",
        onboardingStep: 4, // Set to final step so they can resume from finish
        updatedAt: new Date(),
      })
      .where(eq(users.id, localUser.id))
      .returning();

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("POST /api/onboarding/dismiss FAILED:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to dismiss onboarding." },
      { status: 500 }
    );
  }
}
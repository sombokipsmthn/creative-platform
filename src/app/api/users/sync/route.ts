import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { creatorProfiles } from "@/db/schema";
import { getOrCreateLocalUser } from "@/lib/auth/get-or-create-local-user";
import { logUnexpectedApiError } from "@/lib/api/route-boundaries";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const localUser = await getOrCreateLocalUser(session.user);
    const profile =
      (await db.query.creatorProfiles.findFirst({
        where: eq(creatorProfiles.userId, localUser.id),
      })) ?? null;

    return NextResponse.json({
      needsOnboarding:
        !profile || localUser.onboardingStatus !== "complete",
      user: localUser,
      profile,
    });
  } catch (error) {
    logUnexpectedApiError(request, "users.sync", error);
    return NextResponse.json(
      { error: "Unable to synchronize creator account." },
      { status: 500 }
    );
  }
}

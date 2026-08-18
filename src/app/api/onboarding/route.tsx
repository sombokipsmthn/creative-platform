import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, creatorProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

type OnboardingBody = {
  name?: string;
  handle?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatarUrl?: string;
};

function cleanString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export async function POST(request: Request) {
  try {
    /*
     * -------------------------------------------------------
     * CLERK AUTHENTICATION
     * -------------------------------------------------------
     */

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * CLERK USER
     * -------------------------------------------------------
     */

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        {
          error:
            "Authenticated user could not be found.",
        },
        {
          status: 401,
        }
      );
    }

    const primaryEmail =
      clerkUser.emailAddresses.find(
        (email) =>
          email.id ===
          clerkUser.primaryEmailAddressId
      )?.emailAddress ||
      clerkUser.emailAddresses[0]
        ?.emailAddress ||
      "";

    if (!primaryEmail) {
      return NextResponse.json(
        {
          error:
            "Your Clerk account does not have an email address.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * REQUEST BODY
     * -------------------------------------------------------
     */

    const body =
      (await request.json()) as OnboardingBody;

    const name =
      cleanString(body.name) ||
      [
        clerkUser.firstName,
        clerkUser.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

    const handle = cleanString(body.handle)
      .toLowerCase()
      .replace(/^@/, "")
      .replace(/[^a-z0-9_-]/g, "");

    const bio = cleanString(body.bio);
    const website = cleanString(body.website);
    const location =
      cleanString(body.location);

    const avatarUrl =
      cleanString(body.avatarUrl) ||
      clerkUser.imageUrl ||
      "";

    if (!name) {
      return NextResponse.json(
        {
          error: "Your name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!handle) {
      return NextResponse.json(
        {
          error:
            "Please choose a creator handle.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * CHECK HANDLE
     * -------------------------------------------------------
     */

    const existingHandle =
      await db
        .select()
        .from(users)
        .where(eq(users.handle, handle))
        .limit(1);

    if (
      existingHandle[0] &&
      existingHandle[0].authUserId !== userId
    ) {
      return NextResponse.json(
        {
          error:
            "That creator handle is already in use.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * FIND LOCAL USER
     * -------------------------------------------------------
     */

    const existingUsers =
      await db
        .select()
        .from(users)
        .where(
          eq(
            users.authUserId,
            userId
          )
        )
        .limit(1);

    let user = existingUsers[0];

    /*
     * -------------------------------------------------------
     * CREATE / UPDATE LOCAL USER
     * -------------------------------------------------------
     */

    if (user) {
      const updatedUsers =
        await db
          .update(users)
          .set({
            email:
              primaryEmail.toLowerCase(),
            name,
            handle,
            updatedAt: new Date(),
          })
          .where(
            eq(users.id, user.id)
          )
          .returning();

      user = updatedUsers[0];

      if (!user) {
        return NextResponse.json(
          {
            error:
              "Unable to update your creator account.",
          },
          {
            status: 500,
          }
        );
      }
    } else {
      /*
       * Check if this email is already attached
       * to a different local account.
       */

      const existingEmail =
        await db
          .select()
          .from(users)
          .where(
            eq(
              users.email,
              primaryEmail.toLowerCase()
            )
          )
          .limit(1);

      if (existingEmail[0]) {
        return NextResponse.json(
          {
            error:
              "This email is already connected to another creator account.",
          },
          {
            status: 409,
          }
        );
      }

      const insertedUsers =
        await db
          .insert(users)
          .values({
            authUserId: userId,
            email:
              primaryEmail.toLowerCase(),
            name,
            handle,
          })
          .returning();

      user = insertedUsers[0];

      if (!user) {
        return NextResponse.json(
          {
            error:
              "Unable to create your creator account.",
          },
          {
            status: 500,
          }
        );
      }
    }

    /*
     * -------------------------------------------------------
     * FIND CREATOR PROFILE
     * -------------------------------------------------------
     */

    const existingProfiles =
      await db
        .select()
        .from(creatorProfiles)
        .where(
          eq(
            creatorProfiles.userId,
            user.id
          )
        )
        .limit(1);

    const existingProfile =
      existingProfiles[0];

    /*
     * -------------------------------------------------------
     * UPDATE EXISTING PROFILE
     * -------------------------------------------------------
     */

    if (existingProfile) {
      const updatedProfiles =
        await db
          .update(creatorProfiles)
          .set({
            bio: bio || null,
            avatarUrl:
              avatarUrl || null,
            website:
              website || null,
            location:
              location || null,
            updatedAt: new Date(),
          })
          .where(
            eq(
              creatorProfiles.id,
              existingProfile.id
            )
          )
          .returning();

      const profile =
        updatedProfiles[0];

      return NextResponse.json(
        {
          success: true,
          user,
          profile,
          message:
            "Creator profile updated successfully.",
        },
        {
          status: 200,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * CREATE CREATOR PROFILE
     * -------------------------------------------------------
     */

    const insertedProfiles =
      await db
        .insert(creatorProfiles)
        .values({
          userId: user.id,
          bio: bio || null,
          avatarUrl:
            avatarUrl || null,
          website:
            website || null,
          location:
            location || null,
        })
        .returning();

    const profile =
      insertedProfiles[0];

    if (!profile) {
      return NextResponse.json(
        {
          error:
            "Your account was created, but your creator profile could not be created.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * SUCCESS
     * -------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,
        user,
        profile,
        message:
          "Creator onboarding completed successfully.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Creator onboarding error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message
        .toLowerCase()
        .includes("unique")
    ) {
      return NextResponse.json(
        {
          error:
            "That email or creator handle is already in use.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "Something went wrong while setting up your creator account.",
      },
      {
        status: 500,
      }
    );
  }
}
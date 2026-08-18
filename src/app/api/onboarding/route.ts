import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users, creatorProfiles } from "@/db/schema";

type OnboardingBody = {
  name?: string;
  handle?: string;
  bio?: string;
  website?: string;
  location?: string;
};

function cleanString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export async function POST(request: Request) {
  try {
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

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        {
          error: "Clerk user not found.",
        },
        {
          status: 401,
        }
      );
    }


    const email =
      clerkUser.emailAddresses.find(
        (item) =>
          item.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      "";


    if (!email) {
      return NextResponse.json(
        {
          error: "No email found.",
        },
        {
          status: 400,
        }
      );
    }


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


    if (!name) {
      return NextResponse.json(
        {
          error: "Name required.",
        },
        {
          status: 400,
        }
      );
    }


    if (!handle) {
      return NextResponse.json(
        {
          error: "Handle required.",
        },
        {
          status: 400,
        }
      );
    }



    /*
     * Find existing local user
     */

    let localUser =
      (
        await db
          .select()
          .from(users)
          .where(
            eq(
              users.authUserId,
              userId
            )
          )
          .limit(1)
      )[0];



    /*
     * Create user if missing
     */

    if (!localUser) {
      localUser =
        (
          await db
            .insert(users)
            .values({
              authUserId: userId,
              email: email.toLowerCase(),
              name,
              handle,
            })
            .returning()
        )[0];
    } else {

      localUser =
        (
          await db
            .update(users)
            .set({
              email: email.toLowerCase(),
              name,
              handle,
              updatedAt: new Date(),
            })
            .where(
              eq(
                users.id,
                localUser.id
              )
            )
            .returning()
        )[0];
    }



    /*
     * Create/update profile
     *
     * IMPORTANT:
     * Do NOT store Clerk imageUrl.
     * It is a proxy URL.
     */

    const existingProfile =
      (
        await db
          .select()
          .from(creatorProfiles)
          .where(
            eq(
              creatorProfiles.userId,
              localUser.id
            )
          )
          .limit(1)
      )[0];


    let profile;


    if (existingProfile) {

      profile =
        (
          await db
            .update(creatorProfiles)
            .set({
              bio:
                cleanString(body.bio) ||
                null,

              website:
                cleanString(body.website) ||
                null,

              location:
                cleanString(body.location) ||
                null,

              updatedAt:
                new Date(),
            })
            .where(
              eq(
                creatorProfiles.id,
                existingProfile.id
              )
            )
            .returning()
        )[0];

    } else {

      profile =
        (
          await db
            .insert(creatorProfiles)
            .values({

              userId:
                localUser.id,

              bio:
                cleanString(body.bio) ||
                null,

              website:
                cleanString(body.website) ||
                null,

              location:
                cleanString(body.location) ||
                null,

              avatarUrl:
                null,

            })
            .returning()
        )[0];

    }


    if (!profile) {
      return NextResponse.json(
        {
          error:
            "Profile creation failed.",
        },
        {
          status:500,
        }
      );
    }


    return NextResponse.json(
      {
        success:true,
        user:localUser,
        profile,
      },
      {
        status:200,
      }
    );


  } catch(error) {

    console.error(
      "ONBOARDING ERROR:",
      error
    );


    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown onboarding error",
      },
      {
        status:500,
      }
    );
  }
}
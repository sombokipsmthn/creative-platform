import { NextResponse } from "next/server";
import {
  auth,
  currentUser,
} from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  users,
  creatorProfiles,
  creatorServices,
  creatorBusinessProfiles,
} from "@/db/schema";

import {
  getOrCreateLocalUser,
} from "@/lib/auth/get-or-create-local-user";

type ServiceInput = {
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  defaultRate?: string | number;
  currency?: string;
};

type BusinessInput = {
  businessName?: string;
  phone?: string;
  kraPin?: string;
  vatRegistered?: boolean;
  vatNumber?: string;
  currency?: string;
  depositPercentage?: string | number;
  whtRate?: string | number;
};

type OnboardingBody = {
  section?:
    | "profile"
    | "services"
    | "business"
    | "finish";

  skip?: boolean;

  name?: string;
  handle?: string;
  bio?: string;
  website?: string;
  location?: string;

  services?: ServiceInput[];

  business?: BusinessInput;
};

function cleanString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function cleanNumber(
  value: unknown,
  fallback = 0
): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return number;
}

async function getAuthenticatedContext() {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: NextResponse.json(
        {
          error: "You must be signed in.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return {
      error: NextResponse.json(
        {
          error: "Clerk user not found.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  let localUser;

  try {
    localUser =
      await getOrCreateLocalUser(userId);
  } catch (error) {
    console.error(
      "ONBOARDING LOCAL USER ERROR:",
      error
    );

    return {
      error: NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to create creator account.",
        },
        {
          status: 500,
        }
      ),
    };
  }

  console.log(
    "ONBOARDING AUTH DEBUG:",
    {
      userId,
      clerkUserId: clerkUser.id,
      localUserFound: Boolean(localUser),
      localUserId: localUser.id,
    }
  );

  return {
    userId,
    clerkUser,
    localUser,
  };
}

export async function GET() {
  try {
    const context =
      await getAuthenticatedContext();

    if ("error" in context) {
      return context.error;
    }

    const { localUser } = context;

    const profileRows = await db
      .select()
      .from(creatorProfiles)
      .where(
        eq(
          creatorProfiles.userId,
          localUser.id
        )
      )
      .limit(1);

    const serviceRows = await db
      .select()
      .from(creatorServices)
      .where(
        eq(
          creatorServices.creatorId,
          localUser.id
        )
      );

    const businessRows = await db
      .select()
      .from(creatorBusinessProfiles)
      .where(
        eq(
          creatorBusinessProfiles.userId,
          localUser.id
        )
      )
      .limit(1);

    return NextResponse.json({
      user: {
        id: localUser.id,
        name: localUser.name,
        handle: localUser.handle,
        onboardingStatus:
          localUser.onboardingStatus,
        onboardingStep:
          localUser.onboardingStep,
      },

      profile:
        profileRows[0] ?? null,

      services: serviceRows,

      business:
        businessRows[0] ?? null,
    });
  } catch (error) {
    console.error(
      "GET /api/onboarding FAILED:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load onboarding.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const context =
      await getAuthenticatedContext();

    if ("error" in context) {
      return context.error;
    }

    const {
      localUser,
      clerkUser,
    } = context;

    const body =
      (await request.json()) as OnboardingBody;

    const section = body.section;

    if (!section) {
      return NextResponse.json(
        {
          error:
            "Onboarding section is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ---------------------------------------------------
     * PROFILE
     * ---------------------------------------------------
     */

    if (section === "profile") {
      const email =
        clerkUser.emailAddresses.find(
          (item) =>
            item.id ===
            clerkUser.primaryEmailAddressId
        )?.emailAddress ??
        clerkUser.emailAddresses[0]
          ?.emailAddress ??
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

      const name =
        cleanString(body.name) ||
        [
          clerkUser.firstName,
          clerkUser.lastName,
        ]
          .filter(Boolean)
          .join(" ")
          .trim();

      const handle = cleanString(
        body.handle
      )
        .toLowerCase()
        .replace(/^@/, "")
        .replace(
          /[^a-z0-9_-]/g,
          ""
        );

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
       * Make sure the handle is not already being used
       * by another creator.
       */

      const handleRows = await db
        .select()
        .from(users)
        .where(
          eq(users.handle, handle)
        );

      const conflictingUser =
        handleRows.find(
          (user) =>
            user.id !== localUser.id
        );

      if (conflictingUser) {
        return NextResponse.json(
          {
            error:
              "That handle is already in use.",
          },
          {
            status: 409,
          }
        );
      }

      const updatedUser = await db
        .update(users)
        .set({
          email:
            email.toLowerCase(),

          name,

          handle,

          onboardingStatus:
            "incomplete",

          onboardingStep: 2,

          updatedAt:
            new Date(),
        })
        .where(
          eq(
            users.id,
            localUser.id
          )
        )
        .returning();

      const existingProfileRows =
        await db
          .select()
          .from(creatorProfiles)
          .where(
            eq(
              creatorProfiles.userId,
              localUser.id
            )
          )
          .limit(1);

      let profile;

      const profileValues = {
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
      };

      if (
        existingProfileRows[0]
      ) {
        profile =
          (
            await db
              .update(
                creatorProfiles
              )
              .set(
                profileValues
              )
              .where(
                eq(
                  creatorProfiles.id,
                  existingProfileRows[0]
                    .id
                )
              )
              .returning()
          )[0];
      } else {
        profile =
          (
            await db
              .insert(
                creatorProfiles
              )
              .values({
                userId:
                  localUser.id,

                ...profileValues,

                avatarUrl:
                  null,
              })
              .returning()
          )[0];
      }

      return NextResponse.json({
        success: true,

        section,

        user:
          updatedUser[0] ??
          localUser,

        profile:
          profile ?? null,
      });
    }

    /*
     * ---------------------------------------------------
     * SERVICES
     * ---------------------------------------------------
     */

    if (section === "services") {
      const services =
        Array.isArray(
          body.services
        )
          ? body.services
          : [];

      /*
       * Replace the creator's existing
       * onboarding services.
       */

      await db
        .delete(creatorServices)
        .where(
          eq(
            creatorServices.creatorId,
            localUser.id
          )
        );

      /*
       * Build values using the actual
       * database types.
       *
       * defaultRate is a number in the
       * Drizzle schema, so we keep it
       * as a number rather than converting
       * it to a string.
       */

      const serviceValues =
        services
          .map(
            (service) => {
              const name =
                cleanString(
                  service.name
                );

              if (!name) {
                return null;
              }

              return {
                creatorId:
                  localUser.id,

                name,

                description:
                  cleanString(
                    service.description
                  ) || null,

                category:
                  cleanString(
                    service.category
                  ) || null,

                defaultRate:
                  cleanNumber(
                    service.defaultRate
                  ),

                currency:
                  cleanString(
                    service.currency
                  ) || "KES",
              };
            }
          )
          .filter(
            (
              service
            ): service is NonNullable<
              typeof service
            > =>
              service !== null
          );

      /*
       * Let Drizzle infer the return type
       * instead of forcing the result to
       * have the same type as serviceValues.
       */

      const insertedServices =
        serviceValues.length > 0
          ? await db
              .insert(
                creatorServices
              )
              .values(
                serviceValues
              )
              .returning()
          : [];

      /*
       * Move onboarding to the
       * business step.
       */

      const updatedUser =
        await db
          .update(users)
          .set({
            onboardingStatus:
              "incomplete",

            onboardingStep: 3,

            updatedAt:
              new Date(),
          })
          .where(
            eq(
              users.id,
              localUser.id
            )
          )
          .returning();

      return NextResponse.json({
        success: true,

        section,

        services:
          insertedServices,

        user:
          updatedUser[0] ??
          localUser,
      });
    }

    /*
     * ---------------------------------------------------
     * BUSINESS
     * ---------------------------------------------------
     */

    if (section === "business") {
      const business =
        body.business ?? {};

      /*
       * depositPercentage and whtRate
       * are numeric database fields.
       */

      const businessValues = {
        userId:
          localUser.id,

        businessName:
          cleanString(
            business.businessName
          ) || null,

        phone:
          cleanString(
            business.phone
          ) || null,

        kraPin:
          cleanString(
            business.kraPin
          ) || null,

        vatRegistered:
          Boolean(
            business.vatRegistered
          ),

        vatNumber:
          cleanString(
            business.vatNumber
          ) || null,

        currency:
          cleanString(
            business.currency
          ) || "KES",

        depositPercentage:
          cleanNumber(
            business.depositPercentage,
            50
          ),

        whtRate:
          cleanNumber(
            business.whtRate
          ),

        updatedAt:
          new Date(),
      };

      const existingBusiness =
        await db
          .select()
          .from(
            creatorBusinessProfiles
          )
          .where(
            eq(
              creatorBusinessProfiles.userId,
              localUser.id
            )
          )
          .limit(1);

      let savedBusiness;

      if (
        existingBusiness[0]
      ) {
        savedBusiness =
          (
            await db
              .update(
                creatorBusinessProfiles
              )
              .set(
                businessValues
              )
              .where(
                eq(
                  creatorBusinessProfiles.id,
                  existingBusiness[0]
                    .id
                )
              )
              .returning()
          )[0];
      } else {
        savedBusiness =
          (
            await db
              .insert(
                creatorBusinessProfiles
              )
              .values(
                businessValues
              )
              .returning()
          )[0];
      }

      /*
       * Move onboarding to the
       * final step.
       */

      const updatedUser =
        await db
          .update(users)
          .set({
            onboardingStatus:
              "incomplete",

            onboardingStep: 4,

            updatedAt:
              new Date(),
          })
          .where(
            eq(
              users.id,
              localUser.id
            )
          )
          .returning();

      return NextResponse.json({
        success: true,

        section,

        business:
          savedBusiness ??
          null,

        user:
          updatedUser[0] ??
          localUser,
      });
    }

    /*
     * ---------------------------------------------------
     * FINISH
     * ---------------------------------------------------
     */

    if (section === "finish") {
      const updatedUser =
        await db
          .update(users)
          .set({
            onboardingStatus:
              "complete",

            onboardingStep: 4,

            updatedAt:
              new Date(),
          })
          .where(
            eq(
              users.id,
              localUser.id
            )
          )
          .returning();

      return NextResponse.json({
        success: true,

        section,

        user:
          updatedUser[0] ??
          localUser,
      });
    }

    return NextResponse.json(
      {
        error:
          "Invalid onboarding section.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/onboarding FAILED:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save onboarding.",
      },
      {
        status: 500,
      }
    );
  }
}
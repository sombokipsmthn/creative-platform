import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import {
  creatorBusinessProfiles,
  creatorProfiles,
  creatorServices,
  users,
} from "@/db/schema";
import { getLocalUser } from "@/lib/auth/get-local-user";

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
  section?: "profile" | "services" | "business" | "finish";
  skip?: boolean;
  name?: string;
  handle?: string;
  bio?: string;
  website?: string;
  location?: string;
  avatarUrl?: string | null;
  services?: ServiceInput[];
  business?: BusinessInput;
};

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanNumber(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normaliseHandle(value: unknown): string {
  return cleanString(value)
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 40);
}

async function getAuthenticatedContext() {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: NextResponse.json({ error: "You must be signed in." }, { status: 401 }),
    };
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return {
      error: NextResponse.json({ error: "Clerk user not found." }, { status: 401 }),
    };
  }

  try {
    const localUser = await getLocalUser(userId);
    return { userId, clerkUser, localUser };
  } catch (error) {
    console.error("ONBOARDING: local user missing", error);
    return {
      error: NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Local creator account not found.",
        },
        { status: 404 }
      ),
    };
  }
}

export async function GET(request: Request) {
  try {
    const context = await getAuthenticatedContext();

    if ("error" in context) {
      return context.error;
    }

    const { localUser } = context;
    const url = new URL(request.url);
    const requestedHandle = url.searchParams.get("handle");

    if (requestedHandle !== null) {
      const handle = normaliseHandle(requestedHandle);

      if (!handle) {
        return NextResponse.json({ available: false, handle: "" });
      }

      const conflict = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.handle, handle), ne(users.id, localUser.id)))
        .limit(1);

      return NextResponse.json({ available: conflict.length === 0, handle });
    }

    const [profileRows, serviceRows, businessRows] = await Promise.all([
      db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, localUser.id)).limit(1),
      db.select().from(creatorServices).where(eq(creatorServices.creatorId, localUser.id)),
      db.select().from(creatorBusinessProfiles).where(eq(creatorBusinessProfiles.userId, localUser.id)).limit(1),
    ]);

    return NextResponse.json({
      user: {
        id: localUser.id,
        name: localUser.name,
        handle: localUser.handle,
        onboardingStatus: localUser.onboardingStatus,
        onboardingStep: localUser.onboardingStep,
      },
      profile: profileRows[0] ?? null,
      services: serviceRows,
      business: businessRows[0] ?? null,
    });
  } catch (error) {
    console.error("GET /api/onboarding FAILED:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load onboarding." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAuthenticatedContext();

    if ("error" in context) {
      return context.error;
    }

    const { localUser, clerkUser } = context;
    const body = (await request.json()) as OnboardingBody;
    const section = body.section;

    if (!section) {
      return NextResponse.json({ error: "Onboarding section is required." }, { status: 400 });
    }

    if (section === "profile") {
      const email =
        clerkUser.emailAddresses.find((item) => item.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
        clerkUser.emailAddresses[0]?.emailAddress ??
        "";
      const name =
        cleanString(body.name) ||
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();
      const handle = normaliseHandle(body.handle);
      const avatarUrl = body.avatarUrl === null ? null : cleanString(body.avatarUrl) || null;

      if (!email) return NextResponse.json({ error: "No email found." }, { status: 400 });
      if (!name) return NextResponse.json({ error: "Name required." }, { status: 400 });
      if (!handle) return NextResponse.json({ error: "Handle required." }, { status: 400 });

      if (avatarUrl && !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(avatarUrl)) {
        return NextResponse.json(
          { error: "Profile image must be a valid JPEG, PNG, or WebP image." },
          { status: 400 }
        );
      }

      if (avatarUrl && avatarUrl.length > 900_000) {
        return NextResponse.json(
          { error: "Profile image is too large. Please choose a smaller image." },
          { status: 413 }
        );
      }

      const conflictingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.handle, handle), ne(users.id, localUser.id)))
        .limit(1);

      if (conflictingUser.length > 0) {
        return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
      }

      const [updatedUser] = await db
        .update(users)
        .set({
          email: email.toLowerCase(),
          name,
          handle,
          onboardingStatus: "incomplete",
          onboardingStep: 2,
          updatedAt: new Date(),
        })
        .where(eq(users.id, localUser.id))
        .returning();

      const [existingProfile] = await db
        .select()
        .from(creatorProfiles)
        .where(eq(creatorProfiles.userId, localUser.id))
        .limit(1);

      const profileValues = {
        bio: cleanString(body.bio) || null,
        website: cleanString(body.website) || null,
        location: cleanString(body.location) || null,
        avatarUrl,
        updatedAt: new Date(),
      };

      const profile = existingProfile
        ? (
            await db
              .update(creatorProfiles)
              .set(profileValues)
              .where(eq(creatorProfiles.id, existingProfile.id))
              .returning()
          )[0]
        : (
            await db
              .insert(creatorProfiles)
              .values({ userId: localUser.id, ...profileValues })
              .returning()
          )[0];

      return NextResponse.json({ success: true, section, user: updatedUser ?? localUser, profile: profile ?? null });
    }

    if (section === "services") {
      const services = Array.isArray(body.services) ? body.services : [];

      await db.delete(creatorServices).where(eq(creatorServices.creatorId, localUser.id));

      const serviceValues = services
        .map((service) => {
          const name = cleanString(service.name);
          if (!name) return null;
          return {
            creatorId: localUser.id,
            name,
            description: cleanString(service.description) || null,
            category: cleanString(service.category) || null,
            defaultRate: cleanNumber(service.defaultRate),
            currency: cleanString(service.currency) || "KES",
          };
        })
        .filter((service): service is NonNullable<typeof service> => service !== null);

      const insertedServices = serviceValues.length > 0
        ? await db.insert(creatorServices).values(serviceValues).returning()
        : [];

      const [updatedUser] = await db
        .update(users)
        .set({ onboardingStatus: "incomplete", onboardingStep: 3, updatedAt: new Date() })
        .where(eq(users.id, localUser.id))
        .returning();

      return NextResponse.json({ success: true, section, services: insertedServices, user: updatedUser ?? localUser });
    }

    if (section === "business") {
      if (body.skip) {
        const [updatedUser] = await db
          .update(users)
          .set({ onboardingStatus: "incomplete", onboardingStep: 4, updatedAt: new Date() })
          .where(eq(users.id, localUser.id))
          .returning();

        return NextResponse.json({ success: true, section, skipped: true, user: updatedUser ?? localUser });
      }

      const business = body.business ?? {};
      const businessValues = {
        userId: localUser.id,
        businessName: cleanString(business.businessName) || null,
        phone: cleanString(business.phone) || null,
        kraPin: cleanString(business.kraPin) || null,
        vatRegistered: Boolean(business.vatRegistered),
        vatNumber: cleanString(business.vatNumber) || null,
        currency: cleanString(business.currency) || "KES",
        depositPercentage: cleanNumber(business.depositPercentage, 50),
        whtRate: cleanNumber(business.whtRate),
        updatedAt: new Date(),
      };

      const [existingBusiness] = await db
        .select()
        .from(creatorBusinessProfiles)
        .where(eq(creatorBusinessProfiles.userId, localUser.id))
        .limit(1);

      const savedBusiness = existingBusiness
        ? (
            await db
              .update(creatorBusinessProfiles)
              .set(businessValues)
              .where(eq(creatorBusinessProfiles.id, existingBusiness.id))
              .returning()
          )[0]
        : (
            await db
              .insert(creatorBusinessProfiles)
              .values(businessValues)
              .returning()
          )[0];

      const [updatedUser] = await db
        .update(users)
        .set({ onboardingStatus: "incomplete", onboardingStep: 4, updatedAt: new Date() })
        .where(eq(users.id, localUser.id))
        .returning();

      return NextResponse.json({ success: true, section, business: savedBusiness ?? null, user: updatedUser ?? localUser });
    }

    if (section === "finish") {
      const [updatedUser] = await db
        .update(users)
        .set({ onboardingStatus: "complete", onboardingStep: 4, updatedAt: new Date() })
        .where(eq(users.id, localUser.id))
        .returning();

      return NextResponse.json({ success: true, section, user: updatedUser ?? localUser });
    }

    return NextResponse.json({ error: "Invalid onboarding section." }, { status: 400 });
  } catch (error) {
    console.error("POST /api/onboarding FAILED:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save onboarding." },
      { status: 500 }
    );
  }
}

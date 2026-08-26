import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { clients, users } from "@/db/schema";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getCurrentUser() {
  try {
    const clerkKey =
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      process.env.CLERK_PUBLISHABLE_KEY;

    let userId: string | null = null;

    if (clerkKey) {
      const authResult = await auth();
      userId = authResult.userId;
    } else {
      userId = "dev_admin_user";
    }

    if (!userId) {
      return null;
    }

    let user = await db.query.users.findFirst({
      where: eq(users.authUserId, userId),
    });

    if (!user) {
      try {
        const [created] = await db
          .insert(users)
          .values({
            authUserId: userId,
            email:
              process.env.ADMIN_EMAIL ||
              "creator@kipsmthn.com",
            name: "Somboriot Kipchilat",
            onboardingStatus: "incomplete",
            onboardingStep: 1,
          })
          .onConflictDoNothing()
          .returning();

        user =
          created ??
          (await db.query.users.findFirst({
            where: eq(users.authUserId, userId),
          }));
      } catch {
        user = {
          id: "creator_01",
          authUserId: userId,
          email:
            process.env.ADMIN_EMAIL ||
            "creator@kipsmthn.com",
          name: "Somboriot Kipchilat",
          handle: "kipsmthn",
          onboardingStatus: "incomplete",
          onboardingStep: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }

    return user ?? null;
  } catch (error) {
    console.warn("User auth fallback:", error);

    return {
      id: "creator_01",
      authUserId: "dev_admin_user",
      email:
        process.env.ADMIN_EMAIL ||
        "creator@kipsmthn.com",
      name: "Somboriot Kipchilat",
      handle: "kipsmthn",
      onboardingStatus: "incomplete",
      onboardingStep: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

function cleanString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

const allowedStatuses = [
  "active",
  "inactive",
  "archived",
] as const;

const allowedFeedbackStatuses = [
  "AWAITING_FEEDBACK",
  "FEEDBACK_RECEIVED",
  "IN_PRODUCTION",
  "COMPLETED",
] as const;

const allowedContractStatuses = [
  "NOT_SENT",
  "SENT",
  "SIGNED",
] as const;

const allowedEtimsInvoiceStatuses = [
  "NOT_SENT",
  "SENT",
  "PAID",
] as const;

const allowedTaxCertificateStatuses = [
  "NOT_RECEIVED",
  "RECEIVED",
  "NOT_APPLICABLE",
] as const;

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Client ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const client =
      await db.query.clients.findFirst({
        where: and(
          eq(clients.id, id),
          eq(clients.creatorId, user.id)
        ),
      });

    if (!client) {
      return NextResponse.json(
        {
          error: "Client not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error(
      "GET /api/clients/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch client.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Client ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existingClient =
      await db.query.clients.findFirst({
        where: and(
          eq(clients.id, id),
          eq(clients.creatorId, user.id)
        ),
      });

    if (!existingClient) {
      return NextResponse.json(
        {
          error: "Client not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body = await request.json();

    const updateData: Partial<
      typeof clients.$inferInsert
    > = {};

    /*
     * ---------------------------------------------------
     * BASIC CLIENT INFORMATION
     * ---------------------------------------------------
     */

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "name"
      )
    ) {
      const name = cleanString(body.name);

      if (!name) {
        return NextResponse.json(
          {
            error:
              "Client name cannot be empty.",
          },
          {
            status: 400,
          }
        );
      }

      updateData.name = name;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "company"
      )
    ) {
      updateData.company =
        cleanString(body.company);
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "email"
      )
    ) {
      updateData.email =
        cleanString(body.email);
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "kraPin"
      )
    ) {
      updateData.kraPin =
        cleanString(body.kraPin);
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "phone"
      )
    ) {
      updateData.phone =
        cleanString(body.phone);
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "website"
      )
    ) {
      updateData.website =
        cleanString(body.website);
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "location"
      )
    ) {
      updateData.location =
        cleanString(body.location);
    }

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "notes"
      )
    ) {
      updateData.notes =
        cleanString(body.notes);
    }

    /*
     * ---------------------------------------------------
     * GENERAL CLIENT STATUS
     * ---------------------------------------------------
     */

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "status"
      )
    ) {
      const status =
        cleanString(body.status);

      if (
        !status ||
        !allowedStatuses.includes(
          status as (typeof allowedStatuses)[number]
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid client status.",
          },
          {
            status: 400,
          }
        );
      }

      updateData.status = status;
    }

    /*
     * ---------------------------------------------------
     * FEEDBACK STATUS
     * ---------------------------------------------------
     */

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "feedbackStatus"
      )
    ) {
      const feedbackStatus =
        cleanString(
          body.feedbackStatus
        );

      if (
        !feedbackStatus ||
        !allowedFeedbackStatuses.includes(
          feedbackStatus as (typeof allowedFeedbackStatuses)[number]
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid feedback status.",
          },
          {
            status: 400,
          }
        );
      }

      updateData.feedbackStatus =
        feedbackStatus;
    }

    /*
     * ---------------------------------------------------
     * CONTRACT STATUS
     * ---------------------------------------------------
     */

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "contractStatus"
      )
    ) {
      const contractStatus =
        cleanString(
          body.contractStatus
        );

      if (
        !contractStatus ||
        !allowedContractStatuses.includes(
          contractStatus as (typeof allowedContractStatuses)[number]
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid contract status.",
          },
          {
            status: 400,
          }
        );
      }

      updateData.contractStatus =
        contractStatus;
    }

    /*
     * ---------------------------------------------------
     * eTIMS INVOICE STATUS
     * ---------------------------------------------------
     */

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "etimsInvoiceStatus"
      )
    ) {
      const etimsInvoiceStatus =
        cleanString(
          body.etimsInvoiceStatus
        );

      if (
        !etimsInvoiceStatus ||
        !allowedEtimsInvoiceStatuses.includes(
          etimsInvoiceStatus as (typeof allowedEtimsInvoiceStatuses)[number]
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid eTIMS invoice status.",
          },
          {
            status: 400,
          }
        );
      }

      updateData.etimsInvoiceStatus =
        etimsInvoiceStatus;
    }

    /*
     * ---------------------------------------------------
     * TAX CERTIFICATE STATUS
     * ---------------------------------------------------
     */

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "taxCertificateStatus"
      )
    ) {
      const taxCertificateStatus =
        cleanString(
          body.taxCertificateStatus
        );

      if (
        !taxCertificateStatus ||
        !allowedTaxCertificateStatuses.includes(
          taxCertificateStatus as (typeof allowedTaxCertificateStatuses)[number]
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid tax certificate status.",
          },
          {
            status: 400,
          }
        );
      }

      updateData.taxCertificateStatus =
        taxCertificateStatus;
    }

    /*
     * ---------------------------------------------------
     * UPDATED TIMESTAMP
     * ---------------------------------------------------
     */

    updateData.updatedAt = new Date();

    /*
     * ---------------------------------------------------
     * NOTHING TO UPDATE
     * ---------------------------------------------------
     */

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json(
        {
          error:
            "No client fields were provided for update.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ---------------------------------------------------
     * UPDATE CLIENT
     * ---------------------------------------------------
     */

    const [updatedClient] =
      await db
        .update(clients)
        .set(updateData)
        .where(
          and(
            eq(clients.id, id),
            eq(
              clients.creatorId,
              user.id
            )
          )
        )
        .returning();

    if (!updatedClient) {
      return NextResponse.json(
        {
          error:
            "Failed to update client.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      updatedClient
    );
  } catch (error) {
    console.error(
      "PATCH /api/clients/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update client.",
      },
      {
        status: 500,
      }
    );
  }
}
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

type ClerkEmailAddress = {
  id?: string;
  email_address?: string;
};

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: ClerkEmailAddress[];
    primary_email_address_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
  };
};

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("WEBHOOK ERROR: CLERK_WEBHOOK_SECRET is missing");

    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET is missing" },
      { status: 500 }
    );
  }

  const payload = await req.text();
  const headerPayload = await headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  console.log("WEBHOOK HEADERS:", {
    hasSvixId: Boolean(svixId),
    hasSvixTimestamp: Boolean(svixTimestamp),
    hasSvixSignature: Boolean(svixSignature),
  });

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("WEBHOOK ERROR: Missing Svix headers");

    return NextResponse.json(
      { error: "Missing Svix webhook headers" },
      { status: 400 }
    );
  }

  const wh = new Webhook(webhookSecret);

  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (error) {
    console.error("WEBHOOK ERROR: Signature verification failed");
    console.error(error);

    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  console.log("WEBHOOK EVENT:", event.type);

  /*
   * USER CREATED / UPDATED
   */
  if (event.type === "user.created" || event.type === "user.updated") {
    const clerkUser = event.data;

    console.log("WEBHOOK USER:", {
      userId: clerkUser.id,
      emailAddresses: clerkUser.email_addresses ?? [],
      primaryEmailAddressId: clerkUser.primary_email_address_id ?? null,
    });

    /*
     * Find the primary email first.
     * If Clerk has not marked a primary email yet, fall back
     * to the first available email address.
     */
    const email =
      clerkUser.email_addresses?.find(
        (emailAddress) =>
          emailAddress.id === clerkUser.primary_email_address_id &&
          Boolean(emailAddress.email_address)
      )?.email_address ??
      clerkUser.email_addresses?.find(
        (emailAddress) => Boolean(emailAddress.email_address)
      )?.email_address;

    /*
     * Clerk can occasionally send user.created before the email
     * information is available in the webhook payload.
     *
     * Do NOT return 400 or 500 here.
     *
     * A non-2xx response makes Svix retry the same event even though
     * retrying may not add the missing email. A later user.updated
     * event will synchronize the user once the email is available.
     */
    if (!email) {
      console.warn(
        "WEBHOOK: User has no email yet. Waiting for a later user.updated event.",
        {
          userId: clerkUser.id,
        }
      );

      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Email not available yet",
      });
    }

    const firstName = clerkUser.first_name;
    const lastName = clerkUser.last_name;
    const username = clerkUser.username;

    const name =
      [firstName, lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      username ||
      email.split("@")[0];

    try {
      await db
        .insert(users)
        .values({
          authUserId: clerkUser.id,
          email,
          name,
          handle: username ?? null,
        })
        .onConflictDoUpdate({
          target: users.authUserId,
          set: {
            email,
            name,
            handle: username ?? null,
            updatedAt: new Date(),
          },
        });

      console.log("WEBHOOK SUCCESS: User synced:", {
        userId: clerkUser.id,
        email,
      });

      return NextResponse.json({
        success: true,
        synced: true,
      });
    } catch (error) {
      console.error("WEBHOOK ERROR: Database sync failed");
      console.error(error);

      return NextResponse.json(
        { error: "Database sync failed" },
        { status: 500 }
      );
    }
  }

  /*
   * USER DELETED
   */
  if (event.type === "user.deleted") {
    try {
      await db.delete(users).where(eq(users.authUserId, event.data.id));

      console.log("WEBHOOK SUCCESS: User deleted:", event.data.id);

      return NextResponse.json({
        success: true,
        deleted: true,
      });
    } catch (error) {
      console.error("WEBHOOK ERROR: Failed to delete user");
      console.error(error);

      return NextResponse.json(
        { error: "Database delete failed" },
        { status: 500 }
      );
    }
  }

  /*
   * Any other Clerk event.
   *
   * We acknowledge it because this endpoint is only responsible
   * for user synchronization.
   */
  console.log("WEBHOOK: Event ignored:", event.type);

  return NextResponse.json({
    success: true,
    ignored: true,
    event: event.type,
  });
}
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logSecurityEvent } from "@/lib/security-logger";
import { logInfrastructureFailure } from "@/lib/monitoring";

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
    logInfrastructureFailure(
      "webhook",
      "CLERK_WEBHOOK_SECRET is missing - webhook verification disabled",
      { timestamp: new Date().toISOString() }
    );

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

  logSecurityEvent({
    severity: "info",
    eventType: "system_secret_access",
    message: "Clerk webhook received",
    details: { svixId: Boolean(svixId), svixTimestamp: Boolean(svixTimestamp), svixSignature: Boolean(svixSignature) },
  });

  if (!svixId || !svixTimestamp || !svixSignature) {
    logSecurityEvent({
      severity: "high",
      eventType: "system_secret_access",
      message: "Clerk webhook missing required headers",
      details: { hasSvixId: Boolean(svixId), hasSvixTimestamp: Boolean(svixTimestamp), hasSvixSignature: Boolean(svixSignature) },
    });

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
    }) as unknown as ClerkWebhookEvent;
  } catch (error) {
    logSecurityEvent({
      severity: "critical",
      eventType: "auth_login_failure",
      message: "Clerk webhook signature verification failed",
      details: { error: error instanceof Error ? error.message : "Unknown verification error" },
    });

    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // Log the event type (without sensitive data)
  logSecurityEvent({
    severity: "info",
    eventType: "system_config_change",
    message: `Clerk webhook event: ${event.type}`,
    details: { eventType: event.type, userId: event.data.id },
  });

  /*
   * USER CREATED / UPDATED
   */
  if (event.type === "user.created" || event.type === "user.updated") {
    const clerkUser = event.data;

    logSecurityEvent({
      severity: "info",
      eventType: event.type === "user.created" ? "system_onboarding_complete" : "auth_token_refresh",
      message: `User ${event.type.replace(".", " ")}: ${clerkUser.id}`,
      details: { userId: clerkUser.id, hasEmail: Boolean(clerkUser.email_addresses) },
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
      logSecurityEvent({
        severity: "medium",
        eventType: "system_config_change",
        message: "User created but email not available yet",
        details: { userId: clerkUser.id },
      });

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

      logSecurityEvent({
        severity: "info",
        eventType: "system_onboarding_complete",
        message: `User synced successfully: ${clerkUser.id}`,
        details: { userId: clerkUser.id, email: email.split("@")[0] + "@***" },
      });

      return NextResponse.json({
        success: true,
        synced: true,
      });
    } catch (error) {
      logSecurityEvent({
        severity: "high",
        eventType: "system_db_migration",
        message: `Database sync failed for user: ${clerkUser.id}`,
        details: { error: error instanceof Error ? error.message : "Unknown error" },
      });

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

      logSecurityEvent({
        severity: "high",
        eventType: "modify_delete_client",
        message: `User deleted from system: ${event.data.id}`,
        details: { userId: event.data.id },
      });

      return NextResponse.json({
        success: true,
        deleted: true,
      });
    } catch (error) {
      logSecurityEvent({
        severity: "high",
        eventType: "system_db_migration",
        message: `Failed to delete user from database: ${event.data.id}`,
        details: { error: error instanceof Error ? error.message : "Unknown error" },
      });

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
  logSecurityEvent({
    severity: "debug",
    eventType: "system_config_change",
    message: `Ignored Clerk webhook event: ${event.type}`,
    details: { eventType: event.type },
  });

  return NextResponse.json({
    success: true,
    ignored: true,
    event: event.type,
  });
}

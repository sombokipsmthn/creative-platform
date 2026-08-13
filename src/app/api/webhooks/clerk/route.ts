import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{
      email_address: string;
    }>;
    primary_email_address_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
  };
};

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!webhookSecret) {
    console.error("Missing CLERK_WEBHOOK_SIGNING_SECRET");

    return NextResponse.json(
      { error: "Webhook secret is not configured" },
      { status: 500 }
    );
  }

  const payload = await req.text();
  const headerPayload = await headers();

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing webhook headers" },
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
    console.error("Clerk webhook verification failed:", error);

    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const clerkUser = event.data;

    const email =
      clerkUser.email_addresses?.find(
        (emailAddress) =>
          emailAddress.email_address ===
          clerkUser.email_addresses?.[0]?.email_address
      )?.email_address ??
      clerkUser.email_addresses?.[0]?.email_address;

    if (!email) {
      return NextResponse.json(
        { error: "User has no email address" },
        { status: 400 }
      );
    }

    const name =
      [clerkUser.first_name, clerkUser.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      clerkUser.username ||
      email.split("@")[0];

    await db
      .insert(users)
      .values({
        authUserId: clerkUser.id,
        email,
        name,
        handle: clerkUser.username ?? null,
      })
      .onConflictDoUpdate({
        target: users.authUserId,
        set: {
          email,
          name,
          handle: clerkUser.username ?? null,
          updatedAt: new Date(),
        },
      });
  }

  if (event.type === "user.deleted") {
    await db.delete(users).where(eq(users.authUserId, event.data.id));
  }

  return NextResponse.json({ success: true });
}

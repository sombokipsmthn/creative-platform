import crypto from "node:crypto";
import { cookies } from "next/headers";
import { sql } from "drizzle-orm";

import { db } from "@/db";

const COOKIE_NAME = "gallery_session";
const SESSION_DAYS = 90;

export type GallerySession = {
  id: string;
  token: string;
  isNew: boolean;
};

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function createGallerySession(
  galleryId: string,
  clientId?: string | null,
): Promise<GallerySession> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  const expiresAt = new Date(
    Date.now() +
      SESSION_DAYS * 24 * 60 * 60 * 1000,
  );

  const [result] = await db
    .insert(galleryAccessSessions)
    .values({
      galleryId: galleryId,
      clientId: clientId ?? null,
      tokenHash: tokenHash,
      expiresAt: expiresAt,
    })
    .returning();

  const cookieStore = await cookies();

  cookieStore.set(
    COOKIE_NAME,
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    },
  );

  return {
    id: String(result.rows[0].id),
    token,
    isNew: true,
  };
}

export async function getGallerySession(
  galleryId: string,
  create = true,
  clientId?: string | null,
): Promise<GallerySession | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    const tokenHash = hashToken(token);

    const [result] = await db
      .select({ id: galleryAccessSessions.id })
      .from(galleryAccessSessions)
      .where(
        and(
          eq(galleryAccessSessions.tokenHash, tokenHash),
          eq(galleryAccessSessions.galleryId, galleryId),
          or(
            isNull(galleryAccessSessions.expiresAt),
            gt(galleryAccessSessions.expiresAt, new Date())
          )
        )
      )
      .limit(1)
      .returning();

    if (result.rows[0]) {
      const sessionId = String(result.rows[0].id);

      await db
        .update(galleryAccessSessions)
        .set({
          lastSeenAt: new Date(),
          clientId: clientId ?? null,
        })
        .where(eq(galleryAccessSessions.id, sessionId))
        .returning();

      return {
        id: sessionId,
        token,
        isNew: false,
      };
    }
  }

  if (!create) {
    return null;
  }

  return createGallerySession(
    galleryId,
    clientId,
  );
}

export async function requireGallerySession(
  galleryId: string,
  clientId?: string | null,
) {
  return getGallerySession(
    galleryId,
    false,
    clientId,
  );
}
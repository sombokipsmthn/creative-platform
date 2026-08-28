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

  const result = await db.execute(sql`
    INSERT INTO gallery_access_sessions (
      gallery_id,
      client_id,
      token_hash,
      expires_at
    )
    VALUES (
      ${galleryId},
      ${clientId || null},
      ${tokenHash},
      ${expiresAt}
    )
    RETURNING id
  `);

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

    const result = await db.execute(sql`
      SELECT id
      FROM gallery_access_sessions
      WHERE token_hash = ${tokenHash}
        AND gallery_id = ${galleryId}
        AND (
          expires_at IS NULL
          OR expires_at > now()
        )
      LIMIT 1
    `);

    if (result.rows[0]) {
      const sessionId = String(result.rows[0].id);

      await db.execute(sql`
        UPDATE gallery_access_sessions
        SET
          last_seen_at = now(),
          client_id = COALESCE(
            client_id,
            ${clientId || null}
          )
        WHERE id = ${sessionId}
      `);

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
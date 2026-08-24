import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getOrCreateLocalUser } from "@/lib/auth/get-or-create-local-user";

/* =========================================================
   CREATOR
   ========================================================= */

async function getCreator() {
  try {
    const clerkKey =
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      process.env.CLERK_PUBLISHABLE_KEY;

    let userId: string | null = null;

    /*
     * Use Clerk when authentication is configured.
     *
     * When running locally without Clerk configured,
     * use the development creator so the admin interface
     * remains usable.
     */
    if (clerkKey) {
      const { userId: clerkUserId } = await auth();

      userId = clerkUserId;
    } else {
      userId = "dev_admin_user";
    }

    if (!userId) {
      return null;
    }

    return getOrCreateLocalUser(userId);
  } catch (error) {
    console.error(
      "getCreator error:",
      error
    );

    return null;
  }
}

/* =========================================================
   SLUG
   ========================================================= */

function createSlug(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${base || "gallery"}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/* =========================================================
   GET /api/galleries
   ========================================================= */

export async function GET() {
  try {
    const creator = await getCreator();

    if (!creator) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const result = await db.execute(sql`
      SELECT
        g.*,

        c.name AS client_name,

        COALESCE(
          cp.display_url,
          (
            SELECT p.display_url
            FROM gallery_photos p
            WHERE p.gallery_id = g.id
              AND p.is_hidden = false
            ORDER BY
              p.sort_order ASC,
              p.created_at ASC
            LIMIT 1
          )
        ) AS cover_url,

        (
          SELECT COUNT(*)
          FROM gallery_photos p
          WHERE p.gallery_id = g.id
            AND p.is_hidden = false
        )::int AS photo_count,

        (
          SELECT COUNT(*)
          FROM gallery_collections col
          WHERE col.gallery_id = g.id
        )::int AS collections_count

      FROM galleries g

      LEFT JOIN clients c
        ON c.id = g.client_id

      LEFT JOIN gallery_photos cp
        ON cp.id = g.cover_photo_id

      WHERE g.creator_id = ${creator.id}

      ORDER BY g.created_at DESC
    `);

    return NextResponse.json({
      galleries: result.rows,
    });
  } catch (error) {
    console.error(
      "GET /api/galleries error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load galleries.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST /api/galleries
   ========================================================= */

export async function POST(
  request: Request
) {
  try {
    const creator = await getCreator();

    if (!creator) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const title =
      typeof body?.title === "string"
        ? body.title.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Gallery title is required.",
        },
        {
          status: 400,
        }
      );
    }

    const slug = createSlug(title);

    const clientId =
      typeof body?.clientId === "string" &&
        body.clientId.trim()
        ? body.clientId.trim()
        : null;

    const projectId =
      typeof body?.projectId === "string" &&
        body.projectId.trim()
        ? body.projectId.trim()
        : null;

    const description =
      typeof body?.description === "string" &&
        body.description.trim()
        ? body.description.trim()
        : null;

    const category =
      typeof body?.category === "string" &&
        body.category.trim()
        ? body.category.trim()
        : null;

    const accessPin =
      typeof body?.accessPin === "string" &&
        body.accessPin.trim()
        ? body.accessPin.trim()
        : null;

    const allowDownloads =
      body?.allowDownloads !== false;

    const allowFavorites =
      body?.allowFavorites !== false;

    const allowSelections =
      body?.allowSelections !== false;

    /*
     * Create the gallery.
     */
    const galleryResult = await db.execute(sql`
      INSERT INTO galleries (
        creator_id,
        client_id,
        project_id,
        title,
        description,
        category,
        slug,
        access_pin,
        status,
        allow_downloads,
        allow_favorites,
        allow_selections
      )
      VALUES (
        ${creator.id},
        ${clientId},
        ${projectId},
        ${title},
        ${description},
        ${category},
        ${slug},
        ${accessPin},
        'draft',
        ${allowDownloads},
        ${allowFavorites},
        ${allowSelections}
      )
      RETURNING *
    `);

    const gallery =
      galleryResult.rows[0];

    if (!gallery) {
      return NextResponse.json(
        {
          error:
            "Gallery could not be created.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Every gallery starts with one default
     * collection.
     */
    await db.execute(sql`
      INSERT INTO gallery_collections (
        gallery_id,
        title,
        sort_order
      )
      VALUES (
        ${gallery.id},
        'All Photos',
        0
      )
    `);

    return NextResponse.json(
      {
        gallery,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/galleries error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create gallery.",
      },
      {
        status: 500,
      }
    );
  }
}
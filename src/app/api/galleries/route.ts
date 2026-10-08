import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getOrCreateLocalUser } from "@/lib/auth/get-or-create-local-user";
import { logSecurityEvent } from "@/lib/security-logger";
import { withMonitoring } from "@/lib/api-monitor";

async function getCreator() {
  try {
    const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
    if (!clerkKey) {
      return null;
    }

    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return null;
    }

    return getOrCreateLocalUser(clerkUserId);
  } catch (error) {
    console.error("getCreator error:", error);
    return null;
  }
}

function createSlug(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${base || "gallery"}-${Math.random().toString(36).slice(2, 8)}`;
}

async function getGalleryStats(creatorId: string) {
  const totalGalleries = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM galleries
    WHERE creator_id = ${creatorId}
  `);

  const publishedGalleries = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM galleries
    WHERE creator_id = ${creatorId} AND status = 'published'
  `);

  return {
    total: parseInt(totalGalleries.rows[0].count) || 0,
    published: parseInt(publishedGalleries.rows[0].count) || 0,
  };
}

export const GET = withMonitoring(async (request: Request) => {
  try {
    const creator = await getCreator();
    if (!creator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build dynamic query based on filters
    let whereClause = `creator_id = ${sql.raw(creator.id)}`;
    const params: any[] = [creator.id];

    if (status) {
      whereClause += ` AND status = ${sql.raw(`$${params.length + 1}`)}`;
      params.push(status);
    }

    const galleriesQuery = sql`
      SELECT
        g.id,
        g.creator_id,
        g.client_id,
        g.project_id,
        g.title,
        g.description,
        g.category,
        g.slug,
        g.access_pin,
        g.status,
        g.cover_photo_id,
        g.allow_downloads,
        g.allow_favorites,
        g.allow_selections,
        g.published_at,
        g.created_at,
        g.updated_at,
        c.name AS client_name,
        c.company AS client_company,
        (SELECT p.display_url FROM gallery_photos p WHERE p.gallery_id = g.id AND p.is_hidden = false ORDER BY p.sort_order ASC, p.created_at ASC LIMIT 1) AS cover_url,
        (SELECT COUNT(*) FROM gallery_photos p WHERE p.gallery_id = g.id AND p.is_hidden = false)::int AS photo_count,
        (SELECT COUNT(*) FROM gallery_collections col WHERE col.gallery_id = g.id)::int AS collections_count,
        (SELECT COUNT(*) FROM gallery_photo_actions a WHERE a.gallery_id = g.id AND a.is_favorite = true)::int AS favorites_count,
        (SELECT COUNT(*) FROM gallery_photo_actions a WHERE a.gallery_id = g.id AND a.is_selected = true)::int AS selections_count,
        (SELECT COUNT(*) FROM gallery_comments comm WHERE comm.gallery_id = g.id)::int AS comments_count,
        (SELECT COUNT(*) FROM gallery_downloads d WHERE d.gallery_id = g.id)::int AS downloads_count,
        (SELECT COUNT(*) FROM gallery_access_sessions s WHERE s.gallery_id = g.id)::int AS views_count
      FROM galleries g
      LEFT JOIN clients c ON c.id = g.client_id
      WHERE ${whereClause}
      ORDER BY g.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const countQuery = sql`
      SELECT COUNT(*) as count
      FROM galleries g
      WHERE ${whereClause}
    `;

    const [galleriesResult, countResult] = await Promise.all([
      db.execute(galleriesQuery, ...params),
      db.execute(countQuery, ...params),
    ]);

    const total = parseInt(countResult.rows[0].count) || 0;
    const galleries = galleriesResult.rows;

    // Log successful gallery listing access
    logSecurityEvent({
      severity: "info",
      eventType: "access_admin_access_denied",
      message: `Gallery listing accessed: ${galleries.length} galleries retrieved`,
      details: { totalCount: total, page, limit, statusFilter: status },
    });

    return NextResponse.json({
      galleries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/galleries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch galleries" },
      { status: 500 }
    );
  }
});

export const POST = withMonitoring(async (request: Request) => {
  try {
    const creator = await getCreator();
    if (!creator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description = "",
      category,
      clientId,
      projectId,
      status = "draft",
      allowDownloads = false,
      allowFavorites = true,
      allowSelections = false,
      accessPin,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const slug = createSlug(title);
    const publishedAt = status === "published" ? new Date() : null;

    const result = await db.execute(sql`
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
        published_at,
        allow_downloads,
        allow_favorites,
        allow_selections,
        created_at,
        updated_at
      ) VALUES (
        ${creator.id},
        ${clientId || null},
        ${projectId || null},
        ${title},
        ${description},
        ${category || null},
        ${slug},
        ${accessPin || null},
        ${status},
        ${publishedAt},
        ${allowDownloads},
        ${allowFavorites},
        ${allowSelections},
        NOW(),
        NOW()
      )
      RETURNING *
    `, []);

    const gallery = result.rows[0];

    // Log gallery creation
    logSecurityEvent({
      severity: "info",
      eventType: "modify_create_gallery",
      message: `Gallery created: ${title}`,
      details: {
        galleryId: gallery.id,
        slug: gallery.slug,
        status: gallery.status,
        categoryId: categoryId,
      },
    });

    return NextResponse.json(
      { gallery },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/galleries error:", error);
    return NextResponse.json(
      { error: "Failed to create gallery" },
      { status: 500 }
    );
  }
});

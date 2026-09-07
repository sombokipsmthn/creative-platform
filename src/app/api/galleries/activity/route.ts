import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { getLocalUser } from "@/lib/auth/get-local-user";

async function getCreator() {
  try {
    const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY;
    let userId: string | null = null;

    if (clerkKey) {
      const { userId: clerkUserId } = await auth();
      userId = clerkUserId;
    } else if (process.env.NODE_ENV === 'development') {
      userId = "dev_admin_user";
    } else {
      return null;
    }

    if (!userId) return null;
    return getLocalUser(userId);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const creator = await getCreator();
    if (!creator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await db.execute(sql`
      WITH activity_union AS (
        -- Favorites & Selections
        SELECT
          a.id,
          a.gallery_id,
          g.title as gallery_title,
          c.name as client_name,
          CASE 
            WHEN a.is_favorite = true AND a.is_selected = true THEN 'selection_and_favorite'
            WHEN a.is_favorite = true THEN 'favorite'
            WHEN a.is_selected = true THEN 'selection'
            ELSE 'update'
          END as activity_type,
          p.display_url as photo_url,
          a.updated_at as created_at
        FROM gallery_photo_actions a
        JOIN galleries g ON g.id = a.gallery_id
        JOIN gallery_photos p ON p.id = a.photo_id
        LEFT JOIN clients c ON c.id = g.client_id
        WHERE g.creator_id = ${creator.id}

        UNION ALL

        -- Comments
        SELECT
          comm.id,
          comm.gallery_id,
          g.title as gallery_title,
          comm.author_name as client_name,
          'comment' as activity_type,
          p.display_url as photo_url,
          comm.created_at
        FROM gallery_comments comm
        JOIN galleries g ON g.id = comm.gallery_id
        JOIN gallery_photos p ON p.id = comm.photo_id
        WHERE g.creator_id = ${creator.id}

        UNION ALL

        -- Downloads
        SELECT
          d.id,
          d.gallery_id,
          g.title as gallery_title,
          c.name as client_name,
          'download' as activity_type,
          p.display_url as photo_url,
          d.created_at
        FROM gallery_downloads d
        JOIN galleries g ON g.id = d.gallery_id
        LEFT JOIN gallery_photos p ON p.id = d.photo_id
        LEFT JOIN clients c ON c.id = g.client_id
        WHERE g.creator_id = ${creator.id}

        UNION ALL

        -- Access Sessions (Views)
        SELECT
          s.id,
          s.gallery_id,
          g.title as gallery_title,
          c.name as client_name,
          'view' as activity_type,
          NULL as photo_url,
          s.created_at
        FROM gallery_access_sessions s
        JOIN galleries g ON g.id = s.gallery_id
        LEFT JOIN clients c ON c.id = g.client_id
        WHERE g.creator_id = ${creator.id}
      )
      SELECT * FROM activity_union
      ORDER BY created_at DESC
      LIMIT 50
    `);

    return NextResponse.json({ activity: result.rows });
  } catch (error) {
    console.error("GET /api/galleries/activity error:", error);
    return NextResponse.json({ error: "Unable to load activity." }, { status: 500 });
  }
}

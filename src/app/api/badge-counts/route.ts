import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from 'drizzle-orm';

import { db } from '@/db';
import { getLocalUser } from '@/lib/auth/get-local-user';

export async function GET() {
  try {
    const publishableKey =
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      process.env.CLERK_PUBLISHABLE_KEY;
    let userId: string | null = null;

    if (publishableKey) {
      ({ userId } = await auth());
    } else if (process.env.NODE_ENV === 'development') {
      userId = 'dev_admin_user';
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const creator = await getLocalUser(userId);
    const galleryCount = await db.execute(sql`
      SELECT COUNT(*)::int AS count
      FROM galleries
      WHERE creator_id = ${creator.id}
    `);

    const counts = {
      '/admin/quotes': 3,
      '/admin/invoices': 5,
      '/admin/galleries': Number(galleryCount.rows[0]?.count ?? 0),
      '/admin/contracts': 0, // We'll set this to 0 for now, but it could be the number of draft contracts or something else
      '/admin/clients': 0,
      '/admin/settings': 0,
    };

    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error fetching badge counts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

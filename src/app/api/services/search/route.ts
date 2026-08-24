import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { creatorServices } from '@/db/schema';
import { ilike, and, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      // If no query, return first 50 items for this user
      const results = await db
        .select()
        .from(creatorServices)
        .where(eq(creatorServices.creatorId, userId))
        .limit(50);
      return NextResponse.json({ services: results });
    }

    const results = await db
      .select()
      .from(creatorServices)
      .where(
        and(
          eq(creatorServices.creatorId, userId),
          ilike(creatorServices.name, `%${query}%`)
        )
      )
      .limit(20);

    return NextResponse.json({ services: results });
  } catch (error) {
    console.error('Services search error:', error);
    return NextResponse.json({ error: 'Failed to search services' }, { status: 500 });
  }
}

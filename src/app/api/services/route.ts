import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { creatorServices } from '@/db/schema';
import { ilike, and, eq } from 'drizzle-orm';
import { withCreatorApi } from '@/lib/api/route-boundaries';

export async function GET(request: NextRequest) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get('q');

      if (!query) {
        const results = await db
          .select()
          .from(creatorServices)
          .where(eq(creatorServices.creatorId, user.id))
          .limit(50);
        return NextResponse.json({ services: results });
      }

      const results = await db
        .select()
        .from(creatorServices)
        .where(
          and(
            eq(creatorServices.creatorId, user.id),
            ilike(creatorServices.name, `%${query}%`)
          )
        )
        .limit(20);

      return NextResponse.json({ services: results });
    } catch (error) {
      console.error('Services search error:', error);
      return NextResponse.json({ error: 'Failed to search services' }, { status: 500 });
    }
  });
}

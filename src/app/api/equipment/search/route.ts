import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { equipment } from '@/db/schema';
import { ilike } from 'drizzle-orm';
import { withCreatorApi } from '@/lib/api/route-boundaries';

export async function GET(request: NextRequest) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get('q');

      if (!query) {
        const results = await db.select().from(equipment).limit(50);
        return NextResponse.json({ equipment: results });
      }

      const results = await db
        .select()
        .from(equipment)
        .where(ilike(equipment.name, `%${query}%`))
        .limit(20);

      return NextResponse.json({ equipment: results });
    } catch (error) {
      console.error('Equipment search error:', error);
      return NextResponse.json({ error: 'Failed to search equipment' }, { status: 500 });
    }
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { equipment } from '@/db/schema';
import { ilike } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      // If no query, return first 50 items
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
}

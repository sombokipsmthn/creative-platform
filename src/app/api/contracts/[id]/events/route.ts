import { NextRequest, NextResponse } from 'next/server';
import { withCreatorApi } from '@/lib/api/route-boundaries';
import { fetchContractEvents } from '@/lib/contracts/server';

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  context: Context
) {
  return withCreatorApi(request, async (_req, user) => {
    try {
      const { id } = await context.params;
      const events = await fetchContractEvents(id);
      return NextResponse.json(events);
    } catch (error) {
      console.error('GET /api/contracts/[id]/events error:', error);
      return NextResponse.json({ error: 'Failed to fetch contract events' }, { status: 500 });
    }
  });
}

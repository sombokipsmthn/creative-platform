import { NextRequest, NextResponse } from 'next/server';
import { fetchContractEvents } from '@/lib/contracts/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const events = await fetchContractEvents(id);
    return NextResponse.json(events);
  } catch (error) {
    console.error('GET /api/contracts/[id]/events error:', error);
    return NextResponse.json({ error: 'Failed to fetch contract events' }, { status: 500 });
  }
}

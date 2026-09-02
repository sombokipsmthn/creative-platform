import { NextRequest, NextResponse } from 'next/server';
import { sendContract } from '@/lib/contracts/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contract = await sendContract(id);
    return NextResponse.json(contract);
  } catch (error) {
    console.error('POST /api/contracts/[id]/send error:', error);
    return NextResponse.json({ error: 'Failed to send contract' }, { status: 500 });
  }
}

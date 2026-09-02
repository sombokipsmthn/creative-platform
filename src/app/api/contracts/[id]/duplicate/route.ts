import { NextRequest, NextResponse } from 'next/server';
import { duplicateContract } from '@/lib/contracts/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const duplicate = await duplicateContract(id);
    return NextResponse.json(duplicate);
  } catch (error) {
    console.error('POST /api/contracts/[id]/duplicate error:', error);
    return NextResponse.json({ error: 'Failed to duplicate contract' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { fetchContractByToken, updateContractStatus } from '@/lib/contracts/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const contract = await fetchContractByToken(token);
    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    const { token: _, ...safeContract } = contract;
    return NextResponse.json(safeContract);
  } catch (error) {
    console.error('GET /api/public/contracts/[token] error:', error);
    return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const data = await request.json();
    const status = typeof data === 'string' ? data : data?.status;
    if (status !== 'signed' && status !== 'declined') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const updatedContract = await updateContractStatus(token, status);
    return NextResponse.json(updatedContract);
  } catch (error) {
    console.error('POST /api/public/contracts/[token] error:', error);
    return NextResponse.json({ error: 'Failed to update contract status' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { fetchContractByToken, updateContractStatus } from '@/lib/api/contracts';

export async function GET(
  request: NextRequest,
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
    const updatedContract = await updateContractStatus(token, data);
    return NextResponse.json(updatedContract);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update contract status' }, { status: 500 });
  }
}

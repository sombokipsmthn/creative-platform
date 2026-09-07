import { NextRequest, NextResponse } from 'next/server';
import {
  declinePublicContract,
  fetchContractByToken,
  signPublicContract,
} from '@/lib/contracts/server';

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
    const safeContract = Object.fromEntries(
      Object.entries(contract).filter(([key]) => key !== 'token'),
    );
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
    const signerName = typeof data === 'object' && data ? data.signerName : undefined;
    const signerEmail = typeof data === 'object' && data ? data.signerEmail : undefined;
    if ((status !== 'signed' && status !== 'declined') ||
        typeof signerName !== 'string' || signerName.trim().length < 2 ||
        typeof signerEmail !== 'string' || !signerEmail.includes('@')) {
      return NextResponse.json({ error: 'Signer name and valid email are required' }, { status: 400 });
    }
    const signatureData = {
      signerName: signerName.trim(),
      signerEmail: signerEmail.trim().toLowerCase(),
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      signedAt: new Date().toISOString(),
    };
    const updatedContract = status === 'signed'
      ? await signPublicContract(token, signatureData)
      : await declinePublicContract(token, signatureData);
    return NextResponse.json(updatedContract);
  } catch (error) {
    console.error('POST /api/public/contracts/[token] error:', error);
    if (error instanceof Error && error.message.startsWith('Contract cannot be')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update contract status' }, { status: 500 });
  }
}

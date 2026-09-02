import { NextRequest, NextResponse } from 'next/server';
import { fetchContractStats, fetchContracts, fetchContractTemplates, createContract } from '@/lib/api/contracts';

export async function GET(request: NextRequest) {
  try {
    const [stats, contracts, templates] = await Promise.all([
      fetchContractStats(),
      fetchContracts(),
      fetchContractTemplates(),
    ]);
    return NextResponse.json({ stats, contracts, templates });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contracts data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const contract = await createContract(data);
    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
  }
}

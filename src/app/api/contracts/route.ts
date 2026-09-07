import { NextRequest, NextResponse } from 'next/server';
import { fetchContractStats, fetchContracts, fetchContractTemplates, createContract } from '@/lib/contracts/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const [stats, contractResults, templateResults] = await Promise.all([
      fetchContractStats(),
      fetchContracts({
        search: searchParams.get('search') || undefined,
        status: searchParams.get('status') || undefined,
        clientId: searchParams.get('clientId') || undefined,
      }),
      fetchContractTemplates({}),
    ]);

    return NextResponse.json({
      stats,
      contracts: contractResults.contracts,
      total: contractResults.total,
      templates: templateResults.templates,
      templatesTotal: templateResults.total,
    });
  } catch (error) {
    console.error('GET /api/contracts error:', error);
    if (error instanceof Error && error.message === 'Unauthenticated') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch contracts data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const contract = await createContract(data);
    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error('POST /api/contracts error:', error);
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
  }
}

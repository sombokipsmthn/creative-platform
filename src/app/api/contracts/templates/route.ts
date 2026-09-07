import { NextRequest, NextResponse } from 'next/server';
import { fetchContractTemplates } from '@/lib/contracts/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const result = await fetchContractTemplates({
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      limit: Number(searchParams.get('limit')) || 50,
      offset: Number(searchParams.get('offset')) || 0,
    });
    return NextResponse.json(result.templates);
  } catch (error) {
    console.error('GET /api/contracts/templates error:', error);
    if (error instanceof Error && error.message === 'Unauthenticated') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

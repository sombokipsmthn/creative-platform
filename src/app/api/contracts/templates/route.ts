import { NextRequest, NextResponse } from 'next/server';
import { withCreatorApi } from '@/lib/api/route-boundaries';
import { fetchContractTemplates } from '@/lib/contracts/server';

export async function GET(request: NextRequest) {
  return withCreatorApi(request, async (_req, user) => {
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
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
  });
}

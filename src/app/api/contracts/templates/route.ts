import { NextRequest, NextResponse } from 'next/server';
import { fetchContractTemplates } from '@/lib/contracts/server';

export async function GET(_request: NextRequest) {
  try {
    const templates = await fetchContractTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error('GET /api/contracts/templates error:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

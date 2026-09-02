import { NextRequest, NextResponse } from 'next/server';
import { fetchContractTemplates } from '@/lib/api/contracts';

export async function GET(request: NextRequest) {
  try {
    const templates = await fetchContractTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

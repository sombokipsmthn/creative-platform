import { NextRequest, NextResponse } from 'next/server';
import { saveAsTemplate } from '@/lib/contracts/server';
import { withCreatorApi } from '@/lib/api/route-boundaries';

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  return withCreatorApi(request, async () => {
    try {
      const { id } = await context.params;
      const { name, description } = await request.json();
      if (!name || typeof name !== 'string') return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
      return NextResponse.json(await saveAsTemplate(id, name.trim(), description || ''), { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to save as template' }, { status: 400 });
    }
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { withCreatorApi } from '@/lib/api/route-boundaries';
import { saveAsTemplate } from '@/lib/contracts/server';

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: NextRequest,
  context: Context
) {
  return withCreatorApi(request, async (_req, user) => {
    try {
      const { id } = await context.params;
      const { name, description } = await request.json();
      if (!name) {
        return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
      }
      const template = await saveAsTemplate(id, name, description || '');
      return NextResponse.json(template, { status: 201 });
    } catch (error) {
      console.error('POST /api/contracts/[id]/template error:', error);
      return NextResponse.json({ error: 'Failed to save as template' }, { status: 500 });
    }
  });
}

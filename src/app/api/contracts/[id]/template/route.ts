import { NextRequest, NextResponse } from 'next/server';
import { saveAsTemplate } from '@/lib/contracts/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
}

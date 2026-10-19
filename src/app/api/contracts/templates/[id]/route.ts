import { NextRequest, NextResponse } from 'next/server';
import { fetchContractTemplate, duplicateContractTemplate, updateContractTemplate, deleteContractTemplate } from '@/lib/contracts/server';
import { withCreatorApi } from '@/lib/api/route-boundaries';

type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, context: Context) {
  return withCreatorApi(request, async () => {
    try { return NextResponse.json(await fetchContractTemplate((await context.params).id)); }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Template not found' }, { status: 404 }); }
  });
}
export async function POST(request: NextRequest, context: Context) {
  return withCreatorApi(request, async () => {
    try { return NextResponse.json(await duplicateContractTemplate((await context.params).id), { status: 201 }); }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to duplicate template' }, { status: 400 }); }
  });
}
export async function PATCH(request: NextRequest, context: Context) {
  return withCreatorApi(request, async () => {
    try {
      const body = await request.json();
      if (!body.name || !body.category || !body.documentType || !body.content) return NextResponse.json({ error: 'Name, category, document type and content are required' }, { status: 400 });
      return NextResponse.json(await updateContractTemplate((await context.params).id, body));
    } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update template' }, { status: 400 }); }
  });
}
export async function DELETE(request: NextRequest, context: Context) {
  return withCreatorApi(request, async () => {
    try { return NextResponse.json(await deleteContractTemplate((await context.params).id)); }
    catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to archive template' }, { status: 400 }); }
  });
}

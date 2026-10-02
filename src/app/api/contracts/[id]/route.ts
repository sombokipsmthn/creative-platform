import { NextResponse } from 'next/server';
import { withCreatorApi } from '@/lib/api/route-boundaries';
import { fetchContract, updateContract, deleteContract } from '@/lib/contracts/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const { id } = await params;
      const contract = await fetchContract(id);
      return Response.json(contract);
    } catch (error) {
      console.error('GET /api/contracts/[id] error:', error);
      return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 });
    }
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const { id } = await params;
      const data = await request.json();
      const contract = await updateContract(id, data);
      return Response.json(contract);
    } catch (error) {
      console.error('PATCH /api/contracts/[id] error:', error);
      return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
    }
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withCreatorApi(request, async (_request, user) => {
    try {
      const { id } = await params;
      await deleteContract(id);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('DELETE /api/contracts/[id] error:', error);
      return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
    }
  });
}

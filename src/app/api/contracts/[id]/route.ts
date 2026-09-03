import { NextRequest, NextResponse } from 'next/server';
import { fetchContract, updateContract, deleteContract } from '@/lib/contracts/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contract = await fetchContract(params.id);
    return NextResponse.json(contract);
  } catch (error) {
    console.error(`GET /api/contracts/${params.id} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const contract = await updateContract(params.id, data);
    return NextResponse.json(contract);
  } catch (error) {
    console.error(`PATCH /api/contracts/${params.id} error:`, error);
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteContract(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/contracts/${params.id} error:`, error);
    return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
  }
}

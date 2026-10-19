import { NextRequest, NextResponse } from 'next/server';
import { withCreatorApi } from '@/lib/api/route-boundaries';
import { duplicateContract } from '@/lib/contracts/server';

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
      const duplicate = await duplicateContract(id);
      return NextResponse.json(duplicate);
    } catch (error) {
      console.error('POST /api/contracts/[id]/duplicate error:', error);
      return NextResponse.json({ error: 'Failed to duplicate contract' }, { status: 500 });
    }
  });
}

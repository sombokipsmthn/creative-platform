import { NextRequest, NextResponse } from 'next/server';
import { withCreatorApi } from '@/lib/api/route-boundaries';
import { sendContract } from '@/lib/contracts/server';

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
      const contract = await sendContract(id);
      return NextResponse.json(contract);
    } catch (error) {
      console.error('POST /api/contracts/[id]/send error:', error);
      return NextResponse.json({ error: 'Failed to send contract' }, { status: 500 });
    }
  });
}

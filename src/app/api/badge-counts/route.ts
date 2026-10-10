import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';

import { db } from '@/db';
import { withCreatorApi } from '@/lib/api/route-boundaries';

export async function GET(req: Request) {
  return withCreatorApi(req, async (_request, user) => {
    const creatorId = user.id;

    const result = await db.execute(sql`
      SELECT 'galleries' AS resource, COUNT(*)::int AS count
      FROM galleries
      WHERE creator_id = ${creatorId}
      UNION ALL
      SELECT 'quotes', COUNT(*)::int
      FROM quotes
      WHERE creator_id = ${creatorId} AND status = 'draft'
      UNION ALL
      SELECT 'invoices', COUNT(*)::int
      FROM invoices
      WHERE creator_id = ${creatorId} AND status = 'draft'
      UNION ALL
      SELECT 'contracts', COUNT(*)::int
      FROM contracts
      WHERE creator_id = ${creatorId} AND status = 'draft'
      UNION ALL
      SELECT 'clients', COUNT(*)::int
      FROM clients
      WHERE creator_id = ${creatorId} AND status = 'active'
      UNION ALL
      SELECT 'projects', COUNT(*)::int
      FROM projects
      WHERE creator_id = ${creatorId} AND status = 'draft'
    `);
    const countsByResource = new Map(
      result.rows.map((row) => [String(row.resource), Number(row.count)])
    );

    const counts = {
      '/admin/quotes': countsByResource.get('quotes') ?? 0,
      '/admin/invoices': countsByResource.get('invoices') ?? 0,
      '/admin/galleries': countsByResource.get('galleries') ?? 0,
      '/admin/contracts': countsByResource.get('contracts') ?? 0,
      '/admin/clients': countsByResource.get('clients') ?? 0,
      '/admin/projects': countsByResource.get('projects') ?? 0,
      '/admin/settings': 0,
    };

    return NextResponse.json(counts);
  });
}
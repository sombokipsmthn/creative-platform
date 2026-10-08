import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';

import { db } from '@/db';
import { withCreatorApi } from '@/lib/api/route-boundaries';

export async function GET(req: Request) {
  return withCreatorApi(req, async (_request, user) => {
    const creatorId = user.id;

    const [galleryCount, quoteCount, invoiceCount, contractCount, clientCount, projectCount] = await Promise.all([
      db.execute(sql`SELECT COUNT(*)::int AS count FROM galleries WHERE creator_id = ${creatorId}`),
      db.execute(sql`SELECT COUNT(*)::int AS count FROM quotes WHERE creator_id = ${creatorId} AND status = 'draft'`),
      db.execute(sql`SELECT COUNT(*)::int AS count FROM invoices WHERE creator_id = ${creatorId} AND status = 'draft'`),
      db.execute(sql`SELECT COUNT(*)::int AS count FROM contracts WHERE creator_id = ${creatorId} AND status = 'draft'`),
      db.execute(sql`SELECT COUNT(*)::int AS count FROM clients WHERE creator_id = ${creatorId} AND status = 'active'`),
      db.execute(sql`SELECT COUNT(*)::int AS count FROM projects WHERE creator_id = ${creatorId} AND status = 'draft'`),
    ]);

    const counts = {
      '/admin/quotes': Number(quoteCount.rows[0]?.count ?? 0),
      '/admin/invoices': Number(invoiceCount.rows[0]?.count ?? 0),
      '/admin/galleries': Number(galleryCount.rows[0]?.count ?? 0),
      '/admin/contracts': Number(contractCount.rows[0]?.count ?? 0),
      '/admin/clients': Number(clientCount.rows[0]?.count ?? 0),
      '/admin/projects': Number(projectCount.rows[0]?.count ?? 0),
      '/admin/settings': 0,
    };

    return NextResponse.json(counts);
  });
}
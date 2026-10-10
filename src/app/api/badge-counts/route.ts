import { NextResponse } from 'next/server';
import { and, count, eq } from 'drizzle-orm';

import { db } from '@/db';
import { clients, contracts, galleries, invoices, projects, quotes } from '@/db/schema';
import { withCreatorApi } from '@/lib/api/route-boundaries';

export async function GET(req: Request) {
  return withCreatorApi(req, async (_request, user) => {
    const creatorId = user.id;

    const [
      [galleryCount],
      [quoteCount],
      [invoiceCount],
      [contractCount],
      [clientCount],
      [projectCount],
    ] = await Promise.all([
      db.select({ count: count() }).from(galleries)
        .where(eq(galleries.creatorId, creatorId)),
      db.select({ count: count() }).from(quotes)
        .where(and(eq(quotes.creatorId, creatorId), eq(quotes.status, 'draft'))),
      db.select({ count: count() }).from(invoices)
        .where(and(eq(invoices.creatorId, creatorId), eq(invoices.status, 'draft'))),
      db.select({ count: count() }).from(contracts)
        .where(and(eq(contracts.creatorId, creatorId), eq(contracts.status, 'draft'))),
      db.select({ count: count() }).from(clients)
        .where(and(eq(clients.creatorId, creatorId), eq(clients.status, 'active'))),
      db.select({ count: count() }).from(projects)
        .where(and(eq(projects.creatorId, creatorId), eq(projects.status, 'draft'))),
    ]);

    const counts = {
      '/admin/quotes': quoteCount.count,
      '/admin/invoices': invoiceCount.count,
      '/admin/galleries': galleryCount.count,
      '/admin/contracts': contractCount.count,
      '/admin/clients': clientCount.count,
      '/admin/projects': projectCount.count,
      '/admin/settings': 0,
    };

    return NextResponse.json(counts);
  });
}
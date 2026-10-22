import { NextResponse } from 'next/server';
import { and, count, eq, isNull, ne } from 'drizzle-orm';

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
      // Badges represent the creator's actual active records, not only drafts
      // or supporting/template records. Every query is scoped to this creator.
      db.select({ count: count() }).from(galleries)
        .where(and(eq(galleries.creatorId, creatorId), ne(galleries.status, 'archived'))),
      db.select({ count: count() }).from(quotes)
        .where(and(eq(quotes.creatorId, creatorId), isNull(quotes.archivedAt))),
      db.select({ count: count() }).from(invoices)
        .where(and(
          eq(invoices.creatorId, creatorId),
          ne(invoices.status, 'cancelled'),
          ne(invoices.status, 'void'),
        )),
      db.select({ count: count() }).from(contracts)
        .where(eq(contracts.creatorId, creatorId)),
      db.select({ count: count() }).from(clients)
        .where(and(eq(clients.creatorId, creatorId), ne(clients.status, 'archived'))),
      db.select({ count: count() }).from(projects)
        .where(and(eq(projects.creatorId, creatorId), ne(projects.status, 'archived'))),
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
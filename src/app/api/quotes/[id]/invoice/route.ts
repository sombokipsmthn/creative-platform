import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { quotes, invoices, clients } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch quote and related client
    const quoteResult = await db
      .select({ quote: quotes, client: clients })
      .from(quotes)
      .leftJoin(clients, eq(quotes.clientId, clients.id))
      .where(eq(quotes.id, id))
      .limit(1);

    if (!quoteResult.length) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const { quote, client } = quoteResult[0];

    // Ensure quote has a client
    if (!quote.clientId) {
      return NextResponse.json({ error: 'Quote does not have an associated client' }, { status: 400 });
    }

    // Only allow invoice generation for accepted/approved quotes
    const allowedStatuses = ['accepted', 'approved'];
    if (!quote.status || !allowedStatuses.includes(quote.status.toLowerCase())) {
      return NextResponse.json({ error: 'Invoice can only be generated from an accepted quote' }, { status: 400 });
    }

    // Prevent duplicate invoices for the same quote
    const existing = await db
      .select()
      .from(invoices)
      .where(eq(invoices.quoteId, quote.id))
      .limit(1);
    if (existing.length) {
      return NextResponse.json({ error: 'An invoice already exists for this quote', invoice: existing[0] }, { status: 409 });
    }

    // Generate a simple invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    // Insert the new invoice
    const [createdInvoice] = await db
      .insert(invoices)
      .values({
        creatorId: userId,
        clientId: quote.clientId,
        quoteId: quote.id,
        invoiceNumber,
        title: quote.title ?? 'Project Invoice',
        status: 'draft',
        currency: quote.currency ?? 'KES',
        subtotal: quote.subtotal ?? 0,
        tax: quote.tax ?? 0,
        total: quote.total ?? 0,
        issueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ success: true, invoice: createdInvoice }, { status: 201 });
  } catch (error) {
    console.error('Generate invoice error:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
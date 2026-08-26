import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { quotes, invoices, invoiceItems, clients, quoteItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Optional action: 'update' | 'new' | undefined
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action'); // 'update' | 'new'

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

    const { quote } = quoteResult[0];

    // Ensure quote has a client
    if (!quote.clientId) {
      return NextResponse.json({ error: 'Quote does not have an associated client' }, { status: 400 });
    }

    // Only allow invoice generation for accepted/approved quotes
    const allowedStatuses = ['accepted', 'approved'];
    if (!quote.status || !allowedStatuses.includes(quote.status.toLowerCase())) {
      return NextResponse.json({ error: 'Invoice can only be generated from an accepted quote' }, { status: 400 });
    }

    // Fetch quote line items to copy across
    const sourceItems = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, quote.id));

    // Check for existing invoice
    const existingInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.quoteId, quote.id))
      .limit(1);

    const existingInvoice = existingInvoices[0];

    /* -------------------------------------------------------
     | EXISTING INVOICE — ask client what to do (no action)
     ------------------------------------------------------- */
    if (existingInvoice && !action) {
      return NextResponse.json(
        {
          conflict: true,
          message: 'An invoice already exists for this quote.',
          existingInvoiceId: existingInvoice.id,
          existingInvoiceNumber: existingInvoice.invoiceNumber,
        },
        { status: 409 }
      );
    }

    /* -------------------------------------------------------
     | UPDATE existing invoice
     ------------------------------------------------------- */
    if (existingInvoice && action === 'update') {
      // Re-sync totals from quote
      const [updated] = await db
        .update(invoices)
        .set({
          title: quote.title ?? 'Project Invoice',
          currency: quote.currency ?? 'KES',
          subtotal: quote.subtotal ?? 0,
          tax: quote.tax ?? 0,
          total: quote.total ?? 0,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, existingInvoice.id))
        .returning();

      // Delete old invoice items and re-insert from quote
      await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, existingInvoice.id));
      if (sourceItems.length > 0) {
        await db.insert(invoiceItems).values(
          sourceItems.map((item) => ({
            invoiceId: existingInvoice.id,
            description: [item.category, item.description].filter(Boolean).join(' — '),
            quantity: item.quantity,
            unitPrice: item.rate,
            amount: item.amount,
          }))
        );
      }

      return NextResponse.json({ success: true, id: updated?.id, invoice: updated }, { status: 200 });
    }

    /* -------------------------------------------------------
     | CREATE NEW invoice (action === 'new' or no existing)
     ------------------------------------------------------- */
    const invoiceNumber = `INV-${Date.now()}`;

    // Insert the new invoice
    const [createdInvoice] = await db
      .insert(invoices)
      .values({
        creatorId: quote.creatorId,
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

    // Copy quote items into invoice items
    if (createdInvoice && sourceItems.length > 0) {
      await db.insert(invoiceItems).values(
        sourceItems.map((item) => ({
          invoiceId: createdInvoice.id,
          description: [item.category, item.description].filter(Boolean).join(' — '),
          quantity: item.quantity,
          unitPrice: item.rate,
          amount: item.amount,
        }))
      );
    }

    return NextResponse.json({ success: true, id: createdInvoice?.id, invoice: createdInvoice }, { status: 201 });
  } catch (error) {
    console.error('Generate invoice error:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
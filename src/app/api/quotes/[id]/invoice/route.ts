import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { db } from '@/db';
import { quotes, invoices, invoiceItems, clients, quoteItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentSession();
    const userId = session?.user?.id ?? null;
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
      .where(and(eq(quotes.id, id), eq(quotes.creatorId, userId)))
      .limit(1);

    if (!quoteResult.length) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const { quote } = quoteResult[0];

    // Ensure quote has a client
    if (!quote.clientId) {
      return NextResponse.json({ error: 'Quote does not have an associated client' }, { status: 400 });
    }

    // Only allow invoice generation for accepted quotes
    const allowedStatuses = ['accepted'];
    if (!quote.status || !allowedStatuses.includes(quote.status.toLowerCase())) {
      return NextResponse.json({ error: 'Invoice can only be generated from an accepted quote' }, { status: 400 });
    }

    // Fetch quote line items to copy across
    const sourceItems = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, quote.id));

    // Use a transaction to keep invoice and quote in sync
    await db.transaction(async (trx) => {
      // Check for existing invoice
      const existingInvoices = await trx
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
        await trx
          .update(invoices)
          .set({
            title: quote.title ?? 'Project Invoice',
            currency: quote.currency ?? 'KES',
            subtotal: quote.subtotal ?? 0,
            tax: quote.tax ?? 0,
            total: quote.total ?? 0,
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, existingInvoice.id));

        // Delete old invoice items and re-insert from quote
        await trx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, existingInvoice.id));
        if (sourceItems.length > 0) {
          await trx.insert(invoiceItems).values(
            sourceItems.map((item) => ({
              invoiceId: existingInvoice.id,
              description: [item.category, item.description].filter(Boolean).join(' — '),
              quantity: item.quantity,
              unitPrice: item.rate,
              amount: item.amount,
            }))
          );
        }
        return;
      }

      /* -------------------------------------------------------
       | CREATE NEW invoice
       ------------------------------------------------------- */
      // Generate invoice number using timestamp (format: INV-YYYYMMDDHHMMSS)
      const now = new Date();
      const invoiceNumber = `INV-${now.getFullYear()}${
        (now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now.getSeconds().toString().padStart(2, "0")}`;

      // Insert the new invoice
      await trx.insert(invoices).values({
        creatorId: quote.creatorId,
        clientId: quote.clientId!,
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
      });

      // Copy quote items into invoice items - preserve all available fields
      if (sourceItems.length > 0) {
        await trx.insert(invoiceItems).values(
          sourceItems.map((item) => ({
            invoiceId: crypto.randomUUID(),
            description: [item.category, item.description].filter(Boolean).join(' — '),
            quantity: item.quantity,
            unitPrice: item.rate,
            amount: item.amount ?? item.quantity * item.rate,
            // Preserve notes if available (quoteItems may have a notes field)
            notes: item.notes ?? undefined,
          }))
        );
      }

      // Update quote status to "invoiced" and link the invoice
      await trx
        .update(quotes)
        .set({
          status: "invoiced",
          invoiceId: crypto.randomUUID(),
        })
        .where(eq(quotes.id, quote.id));
    });

    // Re-fetch the created/updated invoice and quote to return to the client
    const updatedQuoteResult = await db
      .select({ quote: quotes, invoice: invoices })
      .from(quotes)
      .leftJoin(invoices, eq(invoices.quoteId, quotes.id))
      .where(eq(quotes.id, quote.id))
      .limit(1);

    const updatedQuote = updatedQuoteResult?.[0];

    if (!updatedQuote) {
      return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
    }

    if (action === 'update' && updatedQuote?.invoice?.id) {
      return NextResponse.json({ success: true, id: updatedQuote.invoice.id, invoice: updatedQuote }, { status: 200 });
    }

    return NextResponse.json({ success: true, id: updatedQuote?.quote?.id, invoice: updatedQuote }, { status: 201 });
  } catch (error) {
    console.error('Generate invoice error:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
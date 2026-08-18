
'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Client = {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
};

type QuoteItem = {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  notes?: string | null;
};

type Quote = {
  id: string;
  quoteNumber?: string | null;
  title: string;
  projectName?: string | null;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  paymentTerms?: string | null;
  validUntil?: string | null;
  productionDays?: number | null;
  location?: string | null;
  clientContact?: string | null;
  depositPercentage?: number | null;
  notes?: string | null;
  discountType?: string | null;
  discountValue?: number | null;
  discountAmount?: number | null;
  invoiceId?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client | null;
  items?: QuoteItem[];
};

const statusStyles: Record<string, string> = {
  draft:
    'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300',
  sent:
    'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  viewed:
    'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
  accepted:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  declined:
    'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  invoiced:
    'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
};

function formatStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function formatDate(date?: string | null) {
  if (!date) return '—';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatAmount(
  amount: number | null | undefined,
  currency: string
) {
  return `${currency} ${Number(amount || 0).toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default function QuoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const quoteId = params?.id;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadQuote = async () => {
      if (!quoteId) return;

      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `/api/quotes/${quoteId}`,
          {
            cache: 'no-store',
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.error || 'Failed to load quote'
          );
        }

        setQuote(data);
      } catch (err) {
        console.error('Failed to load quote:', err);

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load quote.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadQuote();
  }, [quoteId]);

  const status = quote?.status?.toLowerCase() || 'draft';

  const canSend = status === 'draft';

  const canAccept =
    status === 'sent' || status === 'viewed';

  const canGenerateInvoice =
    status === 'accepted' && !quote?.invoiceId;

  const hasInvoice = Boolean(quote?.invoiceId);

  const groupedItems = useMemo(() => {
    if (!quote?.items) return [];

    const groups = new Map<string, QuoteItem[]>();

    for (const item of quote.items) {
      const category =
        item.category?.trim() || 'Production';

      const existing = groups.get(category) || [];

      existing.push(item);

      groups.set(category, existing);
    }

    return Array.from(groups.entries());
  }, [quote]);

  async function updateQuoteStatus(
    nextStatus: string
  ) {
    if (!quote) return;

    try {
      setActionLoading(nextStatus);
      setError('');
      setSuccess('');

      const response = await fetch(
        `/api/quotes/${quote.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Failed to change quote status to ${nextStatus}`
        );
      }

      setQuote((current) =>
        current
          ? {
              ...current,
              ...data,
              status:
                data.status || nextStatus,
            }
          : current
      );

      setSuccess(
        nextStatus === 'sent'
          ? 'Quote marked as sent.'
          : nextStatus === 'accepted'
            ? 'Quote accepted.'
            : `Quote updated to ${formatStatus(nextStatus)}.`
      );
    } catch (err) {
      console.error(
        'Failed to update quote:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update quote.'
      );
    } finally {
      setActionLoading('');
    }
  }

  async function generateInvoice() {
    if (!quote) return;

    if (quote.status?.toLowerCase() !== 'accepted') {
      setError(
        'An invoice can only be generated from an accepted quote.'
      );
      return;
    }

    if (quote.invoiceId) {
      router.push(
        `/admin/invoices/${quote.invoiceId}`
      );
      return;
    }

    try {
      setActionLoading('invoice');
      setError('');
      setSuccess('');

      const response = await fetch(
        '/api/invoices',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quoteId: quote.id,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Failed to generate invoice'
        );
      }

      const invoiceId =
        data?.id ||
        data?.invoice?.id;

      if (!invoiceId) {
        throw new Error(
          'Invoice was created but no invoice ID was returned.'
        );
      }

      setQuote((current) =>
        current
          ? {
              ...current,
              invoiceId,
              status: 'invoiced',
            }
          : current
      );

      setSuccess(
        'Invoice generated successfully.'
      );

      router.push(
        `/admin/invoices/${invoiceId}`
      );
    } catch (err) {
      console.error(
        'Failed to generate invoice:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate invoice.'
      );
    } finally {
      setActionLoading('');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-20 text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
              Loading quote...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <Link
            href="/admin/quotes"
            className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400"
          >
            ← Back to Quotes
          </Link>

          <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-6 py-12 text-center">
            <h1 className="text-xl font-medium text-red-700 dark:text-red-300">
              Quote not found
            </h1>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error || 'The requested quote could not be loaded.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* TOP BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-3">
            <Link
              href="/admin/quotes"
              className="inline-flex text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 transition"
            >
              ← Back to Quotes
            </Link>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400 font-semibold">
                Quote
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-light tracking-tight text-slate-900 dark:text-white">
                  {quote.title || 'Untitled Quote'}
                </h1>

                <span
                  className={`inline-flex px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                    statusStyles[status] ||
                    statusStyles.draft
                  }`}
                >
                  {formatStatus(status)}
                </span>
              </div>

              <p className="mt-2 text-xs font-mono text-slate-400 dark:text-zinc-600">
                {quote.quoteNumber || quote.id}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {canSend && (
              <button
                type="button"
                disabled={Boolean(actionLoading)}
                onClick={() =>
                  updateQuoteStatus('sent')
                }
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-mono uppercase tracking-widest font-semibold transition"
              >
                {actionLoading === 'sent'
                  ? 'Sending...'
                  : 'Send Quote'}
              </button>
            )}

            {canAccept && (
              <button
                type="button"
                disabled={Boolean(actionLoading)}
                onClick={() =>
                  updateQuoteStatus('accepted')
                }
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-mono uppercase tracking-widest font-semibold transition"
              >
                {actionLoading === 'accepted'
                  ? 'Accepting...'
                  : 'Mark Accepted'}
              </button>
            )}

            {canGenerateInvoice && (
              <button
                type="button"
                disabled={Boolean(actionLoading)}
                onClick={generateInvoice}
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-mono uppercase tracking-widest font-semibold transition"
              >
                {actionLoading === 'invoice'
                  ? 'Generating...'
                  : 'Generate Invoice'}
              </button>
            )}

            {hasInvoice && (
              <Link
                href={`/admin/invoices/${quote.invoiceId}`}
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono uppercase tracking-widest font-semibold transition"
              >
                View Invoice →
              </Link>
            )}
          </div>
        </div>

        {/* MESSAGES */}
        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-5 py-4">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 px-5 py-4">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              {success}
            </p>
          </div>
        )}

        {/* INVOICE RELATIONSHIP */}
        {hasInvoice && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400">
                Invoice Generated
              </p>

              <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                This quote has already been converted into an invoice.
              </p>
            </div>

            <Link
              href={`/admin/invoices/${quote.invoiceId}`}
              className="text-xs font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200"
            >
              Open Invoice →
            </Link>
          </div>
        )}

        {/* OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* CLIENT */}
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
              Client
            </p>

            {quote.client ? (
              <div className="mt-4 space-y-2">
                <p className="text-lg font-medium text-slate-900 dark:text-white">
                  {quote.client.name}
                </p>

                {quote.client.company && (
                  <p className="text-sm text-slate-500 dark:text-zinc-500">
                    {quote.client.company}
                  </p>
                )}

                {quote.client.email && (
                  <p className="text-sm text-slate-500 dark:text-zinc-500">
                    {quote.client.email}
                  </p>
                )}

                {quote.client.phone && (
                  <p className="text-sm text-slate-500 dark:text-zinc-500">
                    {quote.client.phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400 dark:text-zinc-600">
                No client assigned
              </p>
            )}
          </div>

          {/* PROJECT */}
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
              Project
            </p>

            <div className="mt-4 space-y-3">
              <p className="text-lg font-medium text-slate-900 dark:text-white">
                {quote.projectName || '—'}
              </p>

              {quote.location && (
                <p className="text-sm text-slate-500 dark:text-zinc-500">
                  Location: {quote.location}
                </p>
              )}

              {quote.productionDays && (
                <p className="text-sm text-slate-500 dark:text-zinc-500">
                  Production: {quote.productionDays} day
                  {quote.productionDays === 1 ? '' : 's'}
                </p>
              )}
            </div>
          </div>

          {/* DATES */}
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
              Timeline
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-500 dark:text-zinc-500">
                  Created
                </span>

                <span className="text-sm text-slate-900 dark:text-white">
                  {formatDate(quote.createdAt)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-500 dark:text-zinc-500">
                  Valid until
                </span>

                <span className="text-sm text-slate-900 dark:text-white">
                  {formatDate(quote.validUntil)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-500 dark:text-zinc-500">
                  Updated
                </span>

                <span className="text-sm text-slate-900 dark:text-white">
                  {formatDate(quote.updatedAt)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* LINE ITEMS */}
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-800">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
              Quote Items
            </p>

            <h2 className="mt-1 text-xl font-light text-slate-900 dark:text-white">
              Scope & Pricing
            </h2>
          </div>

          {groupedItems.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-slate-500 dark:text-zinc-500">
                No quote items found.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-900">
              {groupedItems.map(
                ([category, items]) => (
                  <div key={category}>

                    <div className="px-6 py-3 bg-slate-50 dark:bg-zinc-900/50">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-zinc-500">
                        {category}
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-175">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-zinc-900 text-left">
                            <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                              Description
                            </th>

                            <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600 text-right">
                              Qty
                            </th>

                            <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600 text-right">
                              Rate
                            </th>

                            <th className="px-6 py-3 text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600 text-right">
                              Amount
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {items.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b last:border-b-0 border-slate-100 dark:border-zinc-900"
                            >
                              <td className="px-6 py-4">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                  {item.description}
                                </p>

                                {item.notes && (
                                  <p className="mt-1 text-xs text-slate-400 dark:text-zinc-600">
                                    {item.notes}
                                  </p>
                                )}
                              </td>

                              <td className="px-6 py-4 text-right text-sm text-slate-600 dark:text-zinc-400">
                                {item.quantity} {item.unit}
                              </td>

                              <td className="px-6 py-4 text-right text-sm text-slate-600 dark:text-zinc-400">
                                {formatAmount(
                                  item.rate,
                                  quote.currency
                                )}
                              </td>

                              <td className="px-6 py-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                                {formatAmount(
                                  item.amount,
                                  quote.currency
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* TOTALS */}
        <div className="flex justify-end">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">

            <div className="flex justify-between gap-6">
              <span className="text-sm text-slate-500 dark:text-zinc-500">
                Subtotal
              </span>

              <span className="text-sm text-slate-900 dark:text-white">
                {formatAmount(
                  quote.subtotal,
                  quote.currency
                )}
              </span>
            </div>

            {Number(quote.discountAmount || 0) > 0 && (
              <div className="flex justify-between gap-6">
                <span className="text-sm text-slate-500 dark:text-zinc-500">
                  Discount
                  {quote.discountType === 'percentage'
                    ? ` (${quote.discountValue || 0}%)`
                    : ''}
                </span>

                <span className="text-sm text-red-600 dark:text-red-400">
                  -{formatAmount(
                    quote.discountAmount,
                    quote.currency
                  )}
                </span>
              </div>
            )}

            {Number(quote.tax || 0) > 0 && (
              <div className="flex justify-between gap-6">
                <span className="text-sm text-slate-500 dark:text-zinc-500">
                  Tax
                </span>

                <span className="text-sm text-slate-900 dark:text-white">
                  {formatAmount(
                    quote.tax,
                    quote.currency
                  )}
                </span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-between gap-6">
              <span className="text-base font-medium text-slate-900 dark:text-white">
                Total
              </span>

              <span className="text-2xl font-light text-slate-900 dark:text-white">
                {formatAmount(
                  quote.total,
                  quote.currency
                )}
              </span>
            </div>

            {quote.depositPercentage &&
              quote.depositPercentage > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-900 flex justify-between gap-6">
                  <span className="text-xs text-slate-500 dark:text-zinc-500">
                    Deposit ({quote.depositPercentage}%)
                  </span>

                  <span className="text-xs font-medium text-slate-900 dark:text-white">
                    {formatAmount(
                      Math.round(
                        Number(quote.total || 0) *
                          Number(quote.depositPercentage) /
                          100
                      ),
                      quote.currency
                    )}
                  </span>
                </div>
              )}
          </div>
        </div>

        {/* TERMS / NOTES */}
        {(quote.paymentTerms ||
          quote.clientContact ||
          quote.notes) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {quote.paymentTerms && (
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                  Payment Terms
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-zinc-400 whitespace-pre-wrap">
                  {quote.paymentTerms}
                </p>
              </div>
            )}

            {quote.clientContact && (
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                  Client Contact
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-zinc-400 whitespace-pre-wrap">
                  {quote.clientContact}
                </p>
              </div>
            )}

            {quote.notes && (
              <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                  Notes
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-zinc-400 whitespace-pre-wrap">
                  {quote.notes}
                </p>
              </div>
            )}

          </div>
        )}

        {/* WORKFLOW */}
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
            Workflow
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-4 gap-3">

            <div
              className={`rounded-xl border p-4 ${
                ['draft', 'sent', 'viewed', 'accepted', 'invoiced'].includes(status)
                  ? 'border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/20'
                  : 'border-slate-200 dark:border-zinc-800'
              }`}
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                01
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                Draft
              </p>
            </div>

            <div
              className={`rounded-xl border p-4 ${
                ['sent', 'viewed', 'accepted', 'invoiced'].includes(status)
                  ? 'border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-zinc-800'
              }`}
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                02
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                Sent
              </p>
            </div>

            <div
              className={`rounded-xl border p-4 ${
                ['accepted', 'invoiced'].includes(status)
                  ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-zinc-800'
              }`}
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                03
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                Accepted
              </p>
            </div>

            <div
              className={`rounded-xl border p-4 ${
                hasInvoice
                  ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20'
                  : 'border-slate-200 dark:border-zinc-800'
              }`}
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                04
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                Invoice
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

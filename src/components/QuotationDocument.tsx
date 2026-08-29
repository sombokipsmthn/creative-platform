
'use client';

import React from 'react';

type QuoteItem = {
  id?: string;
  category?: string;
  description: string;
  quantity: number;
  unit?: string;
  rate: number;
  amount: number;
  notes?: string | null;
};

type Client = {
  id?: string;
  name?: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
};

type Quote = {
  id: string;
  quoteNumber?: string | null;
  title: string;
  projectName?: string | null;
  status: string;
  subtotal: number;
  discountType?: string | null;
  discountValue?: number | null;
  discountAmount?: number | null;
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
  createdAt: string;
  client?: Client | null;
  items?: QuoteItem[];
};

type QuotationDocumentProps = {
  quote: Quote;
};

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

function formatStatus(status?: string) {
  return String(status || 'draft')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getShortQuoteNumber(quote: Quote) {
  const source = (quote.quoteNumber || quote.id || '').replace(/[^a-zA-Z0-9]/g, '');
  return `Q-${source.slice(-8).toUpperCase()}`;
}

export default function QuotationDocument({
  quote,
}: QuotationDocumentProps) {
  const items = Array.isArray(quote.items) ? quote.items : [];

  const discountAmount = Number(quote.discountAmount || 0);

  const hasDiscount =
    discountAmount > 0 ||
    quote.discountType === 'percentage' ||
    quote.discountType === 'fixed';

  return (
    <div className="bg-white text-slate-900 print:bg-white">
      <div className="mx-auto max-w-5xl px-8 py-10 sm:px-12 sm:py-14 print:max-w-none print:px-0 print:py-0">
        {/* HEADER */}
        <div className="flex flex-col gap-8 border-b border-slate-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.35em] text-purple-600">
              Quotation
            </p>

            <h1 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl">
              {quote.title || 'Quotation'}
            </h1>

            {quote.projectName && (
              <p className="mt-2 text-sm text-slate-500">
                {quote.projectName}
              </p>
            )}
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Quote
            </p>

            <p className="mt-1 text-lg font-medium">
              {getShortQuoteNumber(quote)}
            </p>

            <div className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-600">
              {formatStatus(quote.status)}
            </div>
          </div>
        </div>

        {/* META */}
        <div className="grid grid-cols-1 gap-8 border-b border-slate-200 py-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Prepared For
            </p>

            <div className="mt-2 space-y-1 text-sm">
              <p className="font-medium">
                {quote.client?.name || 'No client selected'}
              </p>

              {quote.client?.company && (
                <p className="text-slate-500">
                  {quote.client.company}
                </p>
              )}

              {quote.client?.email && (
                <p className="text-slate-500">
                  {quote.client.email}
                </p>
              )}

              {quote.client?.phone && (
                <p className="text-slate-500">
                  {quote.client.phone}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Quote Details
            </p>

            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between gap-6">
                <span className="text-slate-500">Created</span>
                <span>{formatDate(quote.createdAt)}</span>
              </div>

              <div className="flex justify-between gap-6">
                <span className="text-slate-500">Valid Until</span>
                <span>{formatDate(quote.validUntil)}</span>
              </div>

              {quote.productionDays && (
                <div className="flex justify-between gap-6">
                  <span className="text-slate-500">Production</span>
                  <span>
                    {quote.productionDays}{' '}
                    {quote.productionDays === 1
                      ? 'day'
                      : 'days'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Production
            </p>

            <div className="mt-2 space-y-1 text-sm">
              {quote.location && (
                <div className="flex justify-between gap-6">
                  <span className="text-slate-500">
                    Location
                  </span>
                  <span className="text-right">
                    {quote.location}
                  </span>
                </div>
              )}

              {quote.clientContact && (
                <div className="flex justify-between gap-6">
                  <span className="text-slate-500">
                    Contact
                  </span>
                  <span className="text-right">
                    {quote.clientContact}
                  </span>
                </div>
              )}

              {quote.depositPercentage != null && (
                <div className="flex justify-between gap-6">
                  <span className="text-slate-500">
                    Deposit
                  </span>
                  <span>
                    {quote.depositPercentage}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LINE ITEMS */}
        <div className="py-8">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    Description
                  </th>

                  <th className="px-4 py-3 text-right text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    Qty
                  </th>

                  <th className="px-4 py-3 text-right text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    Rate
                  </th>

                  <th className="px-4 py-3 text-right text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-slate-400"
                    >
                      No quote items.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr
                      key={item.id || `${item.description}-${index}`}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium">
                            {item.description}
                          </p>

                          {item.category && (
                            <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                              {item.category}
                            </p>
                          )}

                          {item.notes && (
                            <p className="mt-1 text-xs text-slate-500">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right text-sm text-slate-600">
                        {item.quantity}
                        {item.unit && item.unit !== 'unit'
                          ? ` ${item.unit}`
                          : ''}
                      </td>

                      <td className="px-4 py-4 text-right text-sm text-slate-600">
                        {formatAmount(
                          item.rate,
                          quote.currency
                        )}
                      </td>

                      <td className="px-4 py-4 text-right text-sm font-medium">
                        {formatAmount(
                          item.amount,
                          quote.currency
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOTALS */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span>
                {formatAmount(
                  quote.subtotal,
                  quote.currency
                )}
              </span>
            </div>

            {hasDiscount && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Discount
                  {quote.discountType === 'percentage' &&
                    quote.discountValue != null
                    ? ` (${quote.discountValue}%)`
                    : ''}
                </span>

                <span className="text-slate-600">
                  -{' '}
                  {formatAmount(
                    discountAmount,
                    quote.currency
                  )}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Tax</span>
              <span>
                {formatAmount(
                  quote.tax,
                  quote.currency
                )}
              </span>
            </div>

            <div className="border-t border-slate-300 pt-4">
              <div className="flex items-end justify-between gap-6">
                <span className="text-sm font-medium uppercase tracking-wider">
                  Total
                </span>

                <span className="text-2xl font-medium">
                  {formatAmount(
                    quote.total,
                    quote.currency
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TERMS */}
        {(quote.paymentTerms || quote.notes) && (
          <div className="mt-10 grid grid-cols-1 gap-8 border-t border-slate-200 pt-8 sm:grid-cols-2">
            {quote.paymentTerms && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Payment Terms
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {quote.paymentTerms}
                </p>
              </div>
            )}

            {quote.notes && (
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Notes
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {quote.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-12 border-t border-slate-200 pt-6 text-center print:hidden">
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400">
            Thank you for the opportunity
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

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

export type QuotePreviewData = {
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
  createdAt: string;
  updatedAt: string;
  client?: Client | null;
  items?: QuoteItem[];
};

type QuotePreviewProps = {
  quote: QuotePreviewData;
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

export default function QuotePreview({
  quote,
}: QuotePreviewProps) {
  const groupedItems = new Map<string, QuoteItem[]>();

  for (const item of quote.items ?? []) {
    const category =
      item.category?.trim() || 'Production';

    const existing = groupedItems.get(category) ?? [];

    existing.push(item);

    groupedItems.set(category, existing);
  }

  const depositAmount =
    Number(quote.total || 0) *
    Number(quote.depositPercentage || 0) /
    100;

  return (
    <div className="w-full bg-slate-100 dark:bg-zinc-900 py-8 px-4 md:px-8">
      <div
        id="quote-preview"
        className="mx-auto w-full max-w-198.5 min-h-280.75 bg-white text-slate-900 shadow-xl print:shadow-none"
      >
        {/* HEADER */}
        <div className="px-10 md:px-14 pt-10 pb-8 border-b border-slate-200">
          <div className="flex items-start justify-between gap-8">
            <div>
              <p className="text-xl font-bold tracking-[0.2em] uppercase">
                KIPSMTHN
                <span className="text-purple-600">.</span>
              </p>

              <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-slate-400">
                Creative Production
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                Quote
              </p>

              <p className="mt-1 text-lg font-medium">
                {quote.quoteNumber || quote.id}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Valid until {formatDate(quote.validUntil)}
              </p>
            </div>
          </div>
        </div>

        {/* PROJECT / CLIENT */}
        <div className="px-10 md:px-14 py-8 grid grid-cols-2 gap-10">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Prepared For
            </p>

            <div className="mt-3">
              <p className="text-base font-medium">
                {quote.client?.name || 'Client'}
              </p>

              {quote.client?.company && (
                <p className="mt-1 text-sm text-slate-500">
                  {quote.client.company}
                </p>
              )}

              {quote.client?.email && (
                <p className="mt-1 text-xs text-slate-500">
                  {quote.client.email}
                </p>
              )}

              {quote.client?.phone && (
                <p className="mt-1 text-xs text-slate-500">
                  {quote.client.phone}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Project
            </p>

            <div className="mt-3">
              <p className="text-base font-medium">
                {quote.projectName || quote.title}
              </p>

              {quote.location && (
                <p className="mt-1 text-sm text-slate-500">
                  Location: {quote.location}
                </p>
              )}

              {quote.productionDays && (
                <p className="mt-1 text-sm text-slate-500">
                  Production:{' '}
                  {quote.productionDays} day
                  {quote.productionDays === 1
                    ? ''
                    : 's'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* TITLE */}
        <div className="px-10 md:px-14 pb-8">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-purple-600">
            Proposal
          </p>

          <h1 className="mt-2 text-3xl font-light tracking-tight">
            {quote.title}
          </h1>
        </div>

        {/* ITEMS */}
        <div className="px-10 md:px-14">
          <div className="border-t border-slate-200">
            <div className="grid grid-cols-[1fr_70px_110px_110px] gap-4 py-3 border-b border-slate-200">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                Description
              </p>

              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">
                Qty
              </p>

              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">
                Rate
              </p>

              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">
                Amount
              </p>
            </div>

            {Array.from(groupedItems.entries()).map(
              ([category, items]) => (
                <div key={category}>
                  <div className="py-3 bg-slate-50 border-b border-slate-100">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      {category}
                    </p>
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_70px_110px_110px] gap-4 py-4 border-b border-slate-100"
                    >
                      <div>
                        <p className="text-xs font-medium">
                          {item.description}
                        </p>

                        {item.notes && (
                          <p className="mt-1 text-[10px] leading-4 text-slate-400">
                            {item.notes}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 text-right">
                        {item.quantity}
                      </p>

                      <p className="text-xs text-slate-600 text-right">
                        {formatAmount(
                          item.rate,
                          quote.currency
                        )}
                      </p>

                      <p className="text-xs font-medium text-right">
                        {formatAmount(
                          item.amount,
                          quote.currency
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* TOTALS */}
        <div className="px-10 md:px-14 py-8 flex justify-end">
          <div className="w-full max-w-sm space-y-3">
            <div className="flex justify-between gap-6">
              <span className="text-xs text-slate-500">
                Subtotal
              </span>

              <span className="text-xs">
                {formatAmount(
                  quote.subtotal,
                  quote.currency
                )}
              </span>
            </div>

            {Number(quote.discountAmount || 0) > 0 && (
              <div className="flex justify-between gap-6">
                <span className="text-xs text-slate-500">
                  Discount
                  {quote.discountType ===
                  'percentage'
                    ? ` (${quote.discountValue || 0}%)`
                    : ''}
                </span>

                <span className="text-xs text-red-600">
                  -
                  {formatAmount(
                    quote.discountAmount,
                    quote.currency
                  )}
                </span>
              </div>
            )}

            {Number(quote.tax || 0) > 0 && (
              <div className="flex justify-between gap-6">
                <span className="text-xs text-slate-500">
                  Tax
                </span>

                <span className="text-xs">
                  {formatAmount(
                    quote.tax,
                    quote.currency
                  )}
                </span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-300 flex justify-between gap-6">
              <span className="text-sm font-medium">
                Total
              </span>

              <span className="text-xl font-medium">
                {formatAmount(
                  quote.total,
                  quote.currency
                )}
              </span>
            </div>

            {Number(
              quote.depositPercentage || 0
            ) > 0 && (
              <div className="pt-3 border-t border-slate-100 flex justify-between gap-6">
                <span className="text-[10px] text-slate-500">
                  Deposit (
                  {quote.depositPercentage}%)
                </span>

                <span className="text-xs font-medium">
                  {formatAmount(
                    Math.round(depositAmount),
                    quote.currency
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* TERMS */}
        {(quote.paymentTerms ||
          quote.clientContact ||
          quote.notes) && (
          <div className="px-10 md:px-14 py-8 border-t border-slate-200 grid grid-cols-2 gap-8">
            {quote.paymentTerms && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Payment Terms
                </p>

                <p className="mt-3 text-xs leading-5 text-slate-600 whitespace-pre-wrap">
                  {quote.paymentTerms}
                </p>
              </div>
            )}

            {quote.clientContact && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Client Contact
                </p>

                <p className="mt-3 text-xs leading-5 text-slate-600 whitespace-pre-wrap">
                  {quote.clientContact}
                </p>
              </div>
            )}

            {quote.notes && (
              <div className="col-span-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Notes
                </p>

                <p className="mt-3 text-xs leading-5 text-slate-600 whitespace-pre-wrap">
                  {quote.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* FOOTER */}
        <div className="px-10 md:px-14 py-8 mt-4 border-t border-slate-200">
          <div className="flex items-end justify-between gap-8">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Quote prepared by
              </p>

              <p className="mt-2 text-sm font-medium">
                KIPSMTHN
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Creative Production
              </p>
            </div>

            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">
                Created
              </p>

              <p className="mt-1 text-xs text-slate-600">
                {formatDate(quote.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
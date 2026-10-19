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
    <div className="">
      <div
        id="quote-preview"
        className=""
      >
        {/* HEADER */}
        <div className="">
          <div className="">
            <div>
              <p className="">
                KIPSMTHN
                <span className="">.</span>
              </p>

              <p className="">
                Creative Production
              </p>
            </div>

            <div className="">
              <p className="">
                Quote
              </p>

              <p className="">
                {quote.quoteNumber || quote.id}
              </p>

              <p className="">
                Valid until {formatDate(quote.validUntil)}
              </p>
            </div>
          </div>
        </div>

        {/* PROJECT / CLIENT */}
        <div className="">
          <div>
            <p className="">
              Prepared For
            </p>

            <div className="">
              <p className="">
                {quote.client?.name || 'Client'}
              </p>

              {quote.client?.company && (
                <p className="">
                  {quote.client.company}
                </p>
              )}

              {quote.client?.email && (
                <p className="">
                  {quote.client.email}
                </p>
              )}

              {quote.client?.phone && (
                <p className="">
                  {quote.client.phone}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="">
              Project
            </p>

            <div className="">
              <p className="">
                {quote.projectName || quote.title}
              </p>

              {quote.location && (
                <p className="">
                  Location: {quote.location}
                </p>
              )}

              {quote.productionDays && (
                <p className="">
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
        <div className="">
          <p className="">
            Proposal
          </p>

          <h1 className="">
            {quote.title}
          </h1>
        </div>

        {/* ITEMS */}
        <div className="">
          <div className="">
            <div className="">
              <p className="">
                Description
              </p>

              <p className="">
                Qty
              </p>

              <p className="">
                Rate
              </p>

              <p className="">
                Amount
              </p>
            </div>

            {Array.from(groupedItems.entries()).map(
              ([category, items]) => (
                <div key={category}>
                  <div className="">
                    <p className="">
                      {category}
                    </p>
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.id}
                      className=""
                    >
                      <div>
                        <p className="">
                          {item.description}
                        </p>

                        {item.notes && (
                          <p className="">
                            {item.notes}
                          </p>
                        )}
                      </div>

                      <p className="">
                        {item.quantity}
                      </p>

                      <p className="">
                        {formatAmount(
                          item.rate,
                          quote.currency
                        )}
                      </p>

                      <p className="">
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
        <div className="">
          <div className="">
            <div className="">
              <span className="">
                Subtotal
              </span>

              <span className="">
                {formatAmount(
                  quote.subtotal,
                  quote.currency
                )}
              </span>
            </div>

            {Number(quote.discountAmount || 0) > 0 && (
              <div className="">
                <span className="">
                  Discount
                  {quote.discountType ===
                  'percentage'
                    ? ` (${quote.discountValue || 0}%)`
                    : ''}
                </span>

                <span className="">
                  -
                  {formatAmount(
                    quote.discountAmount,
                    quote.currency
                  )}
                </span>
              </div>
            )}

            {Number(quote.tax || 0) > 0 && (
              <div className="">
                <span className="">
                  Tax
                </span>

                <span className="">
                  {formatAmount(
                    quote.tax,
                    quote.currency
                  )}
                </span>
              </div>
            )}

            <div className="">
              <span className="">
                Total
              </span>

              <span className="">
                {formatAmount(
                  quote.total,
                  quote.currency
                )}
              </span>
            </div>

            {Number(
              quote.depositPercentage || 0
            ) > 0 && (
              <div className="">
                <span className="">
                  Deposit (
                  {quote.depositPercentage}%)
                </span>

                <span className="">
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
          <div className="">
            {quote.paymentTerms && (
              <div>
                <p className="">
                  Payment Terms
                </p>

                <p className="">
                  {quote.paymentTerms}
                </p>
              </div>
            )}

            {quote.clientContact && (
              <div>
                <p className="">
                  Client Contact
                </p>

                <p className="">
                  {quote.clientContact}
                </p>
              </div>
            )}

            {quote.notes && (
              <div className="">
                <p className="">
                  Notes
                </p>

                <p className="">
                  {quote.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* FOOTER */}
        <div className="">
          <div className="">
            <div>
              <p className="">
                Quote prepared by
              </p>

              <p className="">
                KIPSMTHN
              </p>

              <p className="">
                Creative Production
              </p>
            </div>

            <div className="">
              <p className="">
                Created
              </p>

              <p className="">
                {formatDate(quote.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

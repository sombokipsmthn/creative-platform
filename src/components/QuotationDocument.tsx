
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
    <div className="">
      <div className="">
        {/* HEADER */}
        <div className="">
          <div>
            <p className="">
              Quotation
            </p>

            <h1 className="">
              {quote.title || 'Quotation'}
            </h1>

            {quote.projectName && (
              <p className="">
                {quote.projectName}
              </p>
            )}
          </div>

          <div className="">
            <p className="">
              Quote
            </p>

            <p className="">
              {getShortQuoteNumber(quote)}
            </p>

            <div className="">
              {formatStatus(quote.status)}
            </div>
          </div>
        </div>

        {/* META */}
        <div className="">
          <div>
            <p className="">
              Prepared For
            </p>

            <div className="">
              <p className="">
                {quote.client?.name || 'No client selected'}
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
              Quote Details
            </p>

            <div className="">
              <div className="">
                <span className="">Created</span>
                <span>{formatDate(quote.createdAt)}</span>
              </div>

              <div className="">
                <span className="">Valid Until</span>
                <span>{formatDate(quote.validUntil)}</span>
              </div>

              {quote.productionDays && (
                <div className="">
                  <span className="">Production</span>
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
            <p className="">
              Production
            </p>

            <div className="">
              {quote.location && (
                <div className="">
                  <span className="">
                    Location
                  </span>
                  <span className="">
                    {quote.location}
                  </span>
                </div>
              )}

              {quote.clientContact && (
                <div className="">
                  <span className="">
                    Contact
                  </span>
                  <span className="">
                    {quote.clientContact}
                  </span>
                </div>
              )}

              {quote.depositPercentage != null && (
                <div className="">
                  <span className="">
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
        <div className="">
          <div className="">
            <table className="">
              <thead>
                <tr className="">
                  <th className="">
                    Description
                  </th>

                  <th className="">
                    Qty
                  </th>

                  <th className="">
                    Rate
                  </th>

                  <th className="">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className=""
                    >
                      No quote items.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr
                      key={item.id || `${item.description}-${index}`}
                      className=""
                    >
                      <td className="">
                        <div>
                          <p className="">
                            {item.description}
                          </p>

                          {item.category && (
                            <p className="">
                              {item.category}
                            </p>
                          )}

                          {item.notes && (
                            <p className="">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="">
                        {item.quantity}
                        {item.unit && item.unit !== 'unit'
                          ? ` ${item.unit}`
                          : ''}
                      </td>

                      <td className="">
                        {formatAmount(
                          item.rate,
                          quote.currency
                        )}
                      </td>

                      <td className="">
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
        <div className="">
          <div className="">
            <div className="">
              <span className="">Subtotal</span>
              <span>
                {formatAmount(
                  quote.subtotal,
                  quote.currency
                )}
              </span>
            </div>

            {hasDiscount && (
              <div className="">
                <span className="">
                  Discount
                  {quote.discountType === 'percentage' &&
                    quote.discountValue != null
                    ? ` (${quote.discountValue}%)`
                    : ''}
                </span>

                <span className="">
                  -{' '}
                  {formatAmount(
                    discountAmount,
                    quote.currency
                  )}
                </span>
              </div>
            )}

            <div className="">
              <span className="">Tax</span>
              <span>
                {formatAmount(
                  quote.tax,
                  quote.currency
                )}
              </span>
            </div>

            <div className="">
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
            </div>
          </div>
        </div>

        {/* TERMS */}
        {(quote.paymentTerms || quote.notes) && (
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

            {quote.notes && (
              <div>
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
          <p className="">
            Thank you for the opportunity
          </p>
        </div>
      </div>
    </div>
  );
}


'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Client = {
  id: string;
  name?: string | null;
  company?: string | null;
  email?: string | null;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  title: string;
  status: string;
  issueDate: string;
  dueDate?: string | null;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  client?: Client | null;
  quoteId?: string | null;
  createdAt: string;
};

const statusStyles: Record<string, string> = {
  draft:
    'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300',
  sent:
    'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  viewed:
    'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
  paid:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  overdue:
    'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  cancelled:
    'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
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
  amount: number,
  currency: string
) {
  return `${currency} ${Number(amount || 0).toLocaleString(
    'en-KE',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )}`;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadInvoices() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          '/api/invoices',
          {
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          throw new Error(
            'Failed to load invoices'
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setInvoices(
            Array.isArray(data) ? data : []
          );
        }
      } catch (err) {
        console.error(
          'Failed to load invoices:',
          err
        );

        if (!cancelled) {
          setError(
            'Unable to load invoices. Please try again.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInvoices();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const clientName =
        invoice.client?.name || '';

      const company =
        invoice.client?.company || '';

      const matchesSearch =
        !query ||
        [
          invoice.invoiceNumber,
          invoice.title,
          invoice.status,
          clientName,
          company,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        invoice.status?.toLowerCase() ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    invoices,
    search,
    statusFilter,
  ]);

  const totalValue = useMemo(
    () =>
      invoices.reduce(
        (sum, invoice) =>
          sum + Number(invoice.total || 0),
        0
      ),
    [invoices]
  );

  const paidValue = useMemo(
    () =>
      invoices
        .filter(
          (invoice) =>
            invoice.status?.toLowerCase() ===
            'paid'
        )
        .reduce(
          (sum, invoice) =>
            sum + Number(invoice.total || 0),
          0
        ),
    [invoices]
  );

  const outstandingValue = useMemo(
    () =>
      invoices
        .filter(
          (invoice) =>
            !['paid', 'cancelled'].includes(
              invoice.status?.toLowerCase()
            )
        )
        .reduce(
          (sum, invoice) =>
            sum + Number(invoice.total || 0),
          0
        ),
    [invoices]
  );

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-mono font-semibold uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">
              Billing & Payments
            </p>

            <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-white">
              Invoices
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-500">
              Track invoices generated from approved quotes.
            </p>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
              Total Invoiced
            </p>

            <p className="mt-2 text-2xl font-light text-slate-900 dark:text-white">
              {formatAmount(
                totalValue,
                'KES'
              )}
            </p>

            <p className="mt-1 text-xs text-slate-400 dark:text-zinc-600">
              {invoices.length}{' '}
              {invoices.length === 1
                ? 'invoice'
                : 'invoices'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
              Paid
            </p>

            <p className="mt-2 text-2xl font-light text-emerald-600 dark:text-emerald-400">
              {formatAmount(
                paidValue,
                'KES'
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
              Outstanding
            </p>

            <p className="mt-2 text-2xl font-light text-slate-900 dark:text-white">
              {formatAmount(
                outstandingValue,
                'KES'
              )}
            </p>
          </div>

        </div>

        {/* FILTERS */}
        <div className="flex flex-col gap-3 md:flex-row">

          <input
            type="search"
            placeholder="Search invoices, clients..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          >
            <option value="all">
              All statuses
            </option>
            <option value="draft">
              Draft
            </option>
            <option value="sent">
              Sent
            </option>
            <option value="viewed">
              Viewed
            </option>
            <option value="paid">
              Paid
            </option>
            <option value="overdue">
              Overdue
            </option>
            <option value="cancelled">
              Cancelled
            </option>
          </select>

        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/50 dark:bg-red-950/20">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

          {loading ? (
            <div className="px-6 py-16 text-center">
              <p className="text-xs font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                Loading invoices...
              </p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="px-6 py-20 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/10 text-xl text-purple-600 dark:text-purple-400">
                $
              </div>

              <h2 className="mt-5 text-lg font-medium text-slate-900 dark:text-white">
                {invoices.length === 0
                  ? 'No invoices yet'
                  : 'No matching invoices'}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-zinc-500">
                {invoices.length === 0
                  ? 'Invoices are created from accepted quotes. Accept a quote to make the Generate Invoice action available.'
                  : 'Try changing your search or status filter.'}
              </p>

              {invoices.length === 0 && (
                <Link
                  href="/admin/quotes"
                  className="mt-6 inline-flex rounded-xl bg-purple-600 px-5 py-3 text-xs font-mono font-semibold uppercase tracking-widest text-white hover:bg-purple-700"
                >
                  View Quotes
                </Link>
              )}

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-225">

                <thead>
                  <tr className="border-b border-slate-200 text-left dark:border-zinc-800">

                    <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                      Invoice
                    </th>

                    <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                      Client
                    </th>

                    <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                      Issue Date
                    </th>

                    <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                      Due Date
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                      Total
                    </th>

                    <th className="px-6 py-4" />

                  </tr>
                </thead>

                <tbody>
                  {filteredInvoices.map(
                    (invoice) => {
                      const status =
                        invoice.status?.toLowerCase() ||
                        'draft';

                      const clientName =
                        invoice.client?.name ||
                        invoice.client?.company ||
                        'No client';

                      return (
                        <tr
                          key={invoice.id}
                          className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50 dark:border-zinc-900 dark:hover:bg-zinc-900/50"
                        >

                          <td className="px-6 py-5">
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900 dark:text-white">
                                {invoice.title ||
                                  'Invoice'}
                              </p>

                              <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-600">
                                {invoice.invoiceNumber}
                              </p>

                              {invoice.quoteId && (
                                <Link
                                  href={`/admin/quotes/${invoice.quoteId}`}
                                  className="text-[10px] font-mono uppercase tracking-wider text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                                >
                                  From quote →
                                </Link>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div>
                              <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                                {clientName}
                              </p>

                              {invoice.client?.company &&
                                invoice.client.name && (
                                  <p className="mt-1 text-xs text-slate-400 dark:text-zinc-600">
                                    {invoice.client.company}
                                  </p>
                                )}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider ${
                                statusStyles[
                                  status
                                ] ||
                                statusStyles.draft
                              }`}
                            >
                              {formatStatus(
                                status
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-500 dark:text-zinc-500">
                            {formatDate(
                              invoice.issueDate
                            )}
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-500 dark:text-zinc-500">
                            {formatDate(
                              invoice.dueDate
                            )}
                          </td>

                          <td className="px-6 py-5 text-right font-medium text-slate-900 dark:text-white">
                            {formatAmount(
                              invoice.total,
                              invoice.currency
                            )}
                          </td>

                          <td className="px-6 py-5 text-right">
                            <Link
                              href={`/admin/invoices/${invoice.id}`}
                              className="text-xs font-mono uppercase tracking-widest text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                            >
                              View →
                            </Link>
                          </td>

                        </tr>
                      );
                    }
                  )}
                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';

type QuoteClient = {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
};

type Quote = {
  id: string;
  quoteNumber?: string | null;
  title: string;
  projectName?: string | null;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  validUntil?: string | null;
  invoiceId?: string | null;
  client?: QuoteClient | null;
};

const statusStyles: Record<string, string> = {
  draft:
    'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300',
  sent:
    'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  viewed:
    'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
  accepted:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  invoiced:
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  declined:
    'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  expired:
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

function formatAmount(amount: number, currency: string) {
  return `${currency} ${Number(amount || 0).toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadQuotes() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/quotes', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to load quotes');
        }

        const data = await response.json();

        if (!cancelled) {
          setQuotes(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load quotes:', err);

        if (!cancelled) {
          setError('Unable to load quotes. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadQuotes();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredQuotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return quotes.filter((quote) => {
      const matchesSearch =
        !query ||
        [
          quote.quoteNumber,
          quote.title,
          quote.projectName,
          quote.status,
          quote.client?.name,
          quote.client?.company,
          quote.client?.email,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        quote.status?.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotes, search, statusFilter]);

  const totalValue = useMemo(
    () =>
      quotes.reduce(
        (sum, quote) => sum + Number(quote.total || 0),
        0
      ),
    [quotes]
  );

  const acceptedQuotes = useMemo(
    () =>
      quotes.filter(
        (quote) =>
          quote.status?.toLowerCase() === 'accepted'
      ).length,
    [quotes]
  );

  const invoicedQuotes = useMemo(
    () =>
      quotes.filter(
        (quote) =>
          quote.status?.toLowerCase() === 'invoiced' ||
          Boolean(quote.invoiceId)
      ).length,
    [quotes]
  );

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HEADER */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="ui-eyebrow">Sales & Production</p>
            <h1 className="ui-page-title">Quotes</h1>

            <p className="ui-meta">
              Production estimates and client proposals.
            </p>
          </div>

          <Link
            href="/admin/quotes/new"
            className="Button Button--primary"
          >
            + New Quote
          </Link>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="ui-card p-4">
            <p className="ui-meta uppercase">Total Quotes</p>
            <p className="text-3xl font-light text-slate-900 dark:text-white">
              {quotes.length}
            </p>
          </div>

          <div className="ui-card p-4">
            <p className="ui-meta uppercase">Accepted</p>
            <p className="mt-2 text-3xl font-light text-emerald-600 dark:text-emerald-400">
              {acceptedQuotes}
            </p>
          </div>

          <div className="ui-card p-4">
            <p className="ui-meta uppercase">Invoiced</p>
            <p className="mt-2 text-3xl font-light text-cyan-600 dark:text-cyan-400">
              {invoicedQuotes}
            </p>
          </div>

          <div className="ui-card p-4">
            <p className="ui-meta uppercase">Pipeline Value</p>
            <p className="mt-2 text-2xl font-light text-slate-900 dark:text-white">
              {formatAmount(totalValue, 'KES')}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            type="search"
            placeholder="Search quotes, clients, projects..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="ui-input flex-1"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="ui-select"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="viewed">Viewed</option>
            <option value="accepted">Accepted</option>
            <option value="invoiced">Invoiced</option>
            <option value="declined">Declined</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* ERROR */}
        {error && (
          <div className="ui-card p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* TABLE */}
        <div className="ui-card">
          {loading ? (
            <div className="px-6 py-16 text-center">
              <p className="text-xs font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                Loading quotes...
              </p>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/10 text-xl text-purple-600 dark:text-purple-400">
                +
              </div>

              <h2 className="mt-5 text-lg font-medium text-slate-900 dark:text-white">
                {quotes.length === 0
                  ? 'No quotes yet'
                  : 'No matching quotes'}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-zinc-500">
                {quotes.length === 0
                  ? 'Create your first production quote to start building your sales pipeline.'
                  : 'Try changing your search or status filter.'}
              </p>

              {quotes.length === 0 && (
                <Link
                  href="/admin/quotes/new"
                  className="Button Button--primary mt-6"
                >
                  Create First Quote
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="ui-table w-full min-w-225">
                <thead>
                  <tr className="border-b border-slate-200 text-left dark:border-zinc-800">
                    <th className="ui-table-header">Quote</th>
                    <th className="ui-table-header">Client</th>
                    <th className="ui-table-header">Project</th>
                    <th className="ui-table-header">Status</th>
                    <th className="ui-table-header">Created</th>
                    <th className="ui-table-header">Total</th>
                    <th className="ui-table-header" />
                  </tr>
                </thead>

                <tbody>
                  {filteredQuotes.map((quote) => {
                    const status =
                      quote.status?.toLowerCase() || 'draft';

                    const hasInvoice = Boolean(quote.invoiceId);

                    return (
                      <tr
                        key={quote.id}
                        className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50 dark:border-zinc-900 dark:hover:bg-zinc-900/50"
                      >
                        {/* QUOTE */}
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {quote.title || 'Untitled Quote'}
                            </p>

                            <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-600">
                              {quote.quoteNumber || quote.id}
                            </p>
                          </div>
                        </td>

                        {/* CLIENT */}
                        <td className="px-6 py-5">
                          {quote.client ? (
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                                {quote.client.name}
                              </p>

                              {quote.client.company && (
                                <p className="text-xs text-slate-400 dark:text-zinc-600">
                                  {quote.client.company}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400 dark:text-zinc-600">
                              No client
                            </span>
                          )}
                        </td>

                        {/* PROJECT */}
                        <td className="px-6 py-5 text-sm text-slate-600 dark:text-zinc-400">
                          {quote.projectName || '—'}
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-5">
                          <div className="flex flex-col items-start gap-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider ${
                                statusStyles[status] ||
                                statusStyles.draft
                              }`}
                            >
                              {formatStatus(status)}
                            </span>

                            {hasInvoice && (
                              <Link
                                href={`/admin/invoices/${quote.invoiceId}`}
                                className="Button Button--secondary"
                              >
                                View Invoice →
                              </Link>
                            )}
                          </div>
                        </td>

                        {/* CREATED */}
                        <td className="px-6 py-5 text-sm text-slate-500 dark:text-zinc-500">
                          {formatDate(quote.createdAt)}
                        </td>

                        {/* TOTAL */}
                        <td className="px-6 py-5 text-right font-medium text-slate-900 dark:text-white">
                          {formatAmount(
                            quote.total,
                            quote.currency
                          )}
                        </td>

                        {/* ACTION */}
                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/admin/quotes/${quote.id}`}
                            className="Button Button--secondary"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import TableFilterBar from '@/components/admin/TableFilterBar';

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
  const router = useRouter();
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

        const params = new URLSearchParams();
        params.set('search', search);
        params.set('status', statusFilter);

        const response = await fetch(`/api/quotes?${params.toString()}`, {
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
  }, [search, statusFilter]);

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

          <Button
            onClick={() => router.push('/admin/quotes/new')}
            variant="primary"
            className="text-xs font-sans uppercase tracking-widest"
          >
            <Plus className="h-3.5 w-3.5" />
            New Quote
          </Button>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="ui-stat-card">
            <p className="ui-stat-label">Total Quotes</p>
            <p className="ui-stat-value">{quotes.length}</p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Accepted</p>
            <p className="ui-stat-value text-emerald-600 dark:text-emerald-400">
              {acceptedQuotes}
            </p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Invoiced</p>
            <p className="ui-stat-value text-cyan-600 dark:text-cyan-400">
              {invoicedQuotes}
            </p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Pipeline Value</p>
            <p className="ui-stat-value">
              {formatAmount(totalValue, 'KES')}
            </p>
          </div>
        </div>

        {/* Table Filter Bar */}
        <TableFilterBar
          search={search}
          onSearchChange={setSearch}
          filters={{ status: statusFilter }}
          onFiltersChange={(filters) => {
            setSearch(filters.search ?? '');
            setStatusFilter(filters.status ?? 'all');
          }}
          onAddItem={() => {
            router.push('/admin/quotes/new');
          }}
          filterOptions={[
            {
              label: 'Status',
              value: 'status',
              options: [
                { label: 'All statuses', value: 'all' },
                { label: 'Draft', value: 'draft' },
                { label: 'Sent', value: 'sent' },
                { label: 'Viewed', value: 'viewed' },
                { label: 'Accepted', value: 'accepted' },
                { label: 'Invoiced', value: 'invoiced' },
                { label: 'Declined', value: 'declined' },
                { label: 'Expired', value: 'expired' },
              ]
            }
          ]}
          itemLabel="Quote"
        />

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
              <p className="text-xs font-sans uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                Loading quotes...
              </p>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="ui-empty-state">
              <div className="ui-empty-icon">
                <Plus className="h-6 w-6" />
              </div>

              <h2 className="ui-section-title">
                {quotes.length === 0
                  ? 'No quotes yet'
                  : 'No matching quotes'}
              </h2>

              <p className="ui-body">
                {quotes.length === 0
                  ? 'Create your first production quote to start building your sales pipeline.'
                  : 'Try changing your search or status filter.'}
              </p>

              {quotes.length === 0 && (
                <Button
                  onClick={() => router.push('/admin/quotes/new')}
                  variant="primary"
                  className="mt-6"
                >
                  Create First Quote
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="ui-table">
                <thead>
                  <tr>
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
                        className="ui-table-row"
                      >
                        {/* QUOTE */}
                        <td className="ui-table-cell">
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {quote.title || 'Untitled Quote'}
                            </p>

                            <p className="ui-meta">
                              {quote.quoteNumber || quote.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </td>

                        {/* CLIENT */}
                        <td className="ui-table-cell">
                          {quote.client ? (
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                                {quote.client.name}
                              </p>

                              {quote.client.company && (
                                <p className="ui-caption">
                                  {quote.client.company}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="ui-caption">
                              No client
                            </span>
                          )}
                        </td>

                        {/* PROJECT */}
                        <td className="ui-table-cell">
                          {quote.projectName || '—'}
                        </td>

                        {/* STATUS */}
                        <td className="ui-table-cell">
                          <div className="flex flex-col items-start gap-2">
                            <span
                              className={`ui-badge ${status === 'accepted' ? 'ui-badge-success' :
                                status === 'declined' ? 'ui-badge-danger' :
                                  status === 'sent' || status === 'viewed' ? 'ui-badge-accent' :
                                    'ui-badge'
                                }`}
                            >
                              {formatStatus(status)}
                            </span>

                            {hasInvoice && (
                              <Button
                                onClick={() => router.push(`/admin/invoices/${quote.invoiceId}`)}
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 normal-case tracking-normal"
                              >
                                View Invoice →
                              </Button>
                            )}
                          </div>
                        </td>

                        {/* CREATED */}
                        <td className="ui-table-cell">
                          {formatDate(quote.createdAt)}
                        </td>

                        {/* TOTAL */}
                        <td className="ui-table-cell text-right font-medium text-slate-900 dark:text-white">
                          {formatAmount(
                            quote.total,
                            quote.currency
                          )}
                        </td>

                        {/* ACTION */}
                        <td className="ui-table-cell text-right">
                          <Button
                            onClick={() => router.push(`/admin/quotes/${quote.id}`)}
                            variant="secondary"
                            size="sm"
                          >
                            View
                            <ArrowRight className="h-3 w-3" />
                          </Button>
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

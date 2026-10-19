'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TableFilterBar from '@/components/admin/TableFilterBar';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import EmptyState from '@/components/admin/EmptyState';
import StatusBadge from '@/components/admin/StatusBadge';

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
    <div className="ui-page ui-page-padded">
      <div className="ui-shell">
        {/* HEADER */}
        <AdminPageHeader
          title="Quotes"
          description="Production estimates and client proposals."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          primaryAction={<Button onClick={() => router.push('/admin/quotes/new')}><Plus aria-hidden="true" />New quote</Button>}
        />

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="ui-stat-card">
            <p className="ui-stat-label">Total Quotes</p>
            <p className="ui-stat-value">{quotes.length}</p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Accepted</p>
            <p className="ui-stat-value">
              {acceptedQuotes}
            </p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Invoiced</p>
            <p className="ui-stat-value">
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
        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" role="alert">{error}</div>}
        <div className="ui-card">
          {loading ? (
            <div className="admin-empty-state" role="status"><p>Loading quotes…</p></div>
          ) : filteredQuotes.length === 0 ? (
            <EmptyState icon={<Plus />} title={quotes.length === 0 ? 'No quotes yet' : 'No matching quotes'} description={quotes.length === 0 ? 'Create your first production quote to start building your sales pipeline.' : 'Try changing your search or status filter.'} filtered={quotes.length > 0} action={quotes.length === 0 ? <Button onClick={() => router.push('/admin/quotes/new')}>Create first quote</Button> : undefined} />
          ) : (
            <div className="admin-content-block">
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
                          <div className="admin-content-block">
                            <p className="admin-content-block">
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
                            <div className="admin-content-block">
                              <p className="admin-content-block">
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
                          <div className="admin-content-block">
                          <StatusBadge status={status} />

                            {hasInvoice && (
                              <Button
                                onClick={() => router.push(`/admin/invoices/${quote.invoiceId}`)}
                                variant="ghost"
                                size="sm"
                                className="normal-case"
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
                        <td className="ui-table-cell">
                          {formatAmount(
                            quote.total,
                            quote.currency
                          )}
                        </td>

                        {/* ACTION */}
                        <td className="ui-table-cell">
                          <Button
                            onClick={() => router.push(`/admin/quotes/${quote.id}`)}
                            variant="secondary"
                            size="sm"
                          >
                            View
                            <ArrowRight className="admin-content-block" />
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

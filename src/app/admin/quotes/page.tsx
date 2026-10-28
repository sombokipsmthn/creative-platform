'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRight, ArrowsClockwise as RefreshCw } from "@phosphor-icons/react";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { AdminResourceToolbar, type AdminFilterConfig, type AdminToolbarAction } from '@/components/admin/AdminResourceToolbar';
import StatusBadge from '@/components/admin/StatusBadge';
import StatCards from '@/components/admin/StatCards';

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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadQuotes = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
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

      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load quotes:', err);
      setError('Unable to load quotes. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    void loadQuotes();
  }, [loadQuotes]);

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
    <div className="admin-data-page">
      <div className="admin-data-page__content space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Sales & Production</p>
            <h1 className="text-3xl font-semibold tracking-tight">Quotes</h1>

            <p className="text-sm text-muted-foreground">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <StatCards
            stats={[
              { label: 'Total Quotes', value: String(quotes.length), detail: 'New this period: 0', color: 'default' },
              { label: 'Accepted', value: String(acceptedQuotes), detail: '', color: 'success' },
              { label: 'Invoiced', value: String(invoicedQuotes), detail: '', color: 'info' },
              { label: 'Pipeline Value', value: formatAmount(totalValue, 'KES'), detail: '', color: 'default' },
            ]}
            columns={4}
          />
        </div>

        {/* Admin Resource Toolbar */}
        <AdminResourceToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search quotes by title, client, number…"
          filters={[
            {
              id: 'status',
              label: 'Status',
              value: statusFilter,
              options: [
                { label: 'All statuses', value: 'all' },
                { label: 'Draft', value: 'draft' },
                { label: 'Sent', value: 'sent' },
                { label: 'Viewed', value: 'viewed' },
                { label: 'Accepted', value: 'accepted' },
                { label: 'Invoiced', value: 'invoiced' },
                { label: 'Declined', value: 'declined' },
                { label: 'Expired', value: 'expired' },
              ],
            },
          ] as AdminFilterConfig[]}
          onFilterChange={(id, value) => {
            if (id === 'status') setStatusFilter(value ?? 'all');
          }}
          onClearAll={() => {
            setSearch('');
            setStatusFilter('all');
          }}
          secondaryActions={[
            {
              label: 'Refresh',
              onClick: () => void loadQuotes(true),
              variant: 'ghost',
              size: 'icon',
              icon: <RefreshCw className="h-4 w-4" />,
            } as AdminToolbarAction,
          ]}
          resultCount={quotes.length}
          filteredCount={filteredQuotes.length}
          resultLabel="Quotes"
          loading={loading}
        />

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* TABLE */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          {loading ? (
            <div className="space-y-4 p-6" role="status" aria-label="Loading quotes">
              <span className="sr-only">Loading quotes…</span>
              {[0, 1, 2, 3, 4].map((row) => <div key={row} className="flex gap-4">{[0, 1, 2, 3, 4].map((column) => <Skeleton key={column} className="h-8 flex-1" />)}</div>)}
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Plus className="h-6 w-6" />
              </div>

              <h2 className="text-2xl font-semibold tracking-tight">
                {quotes.length === 0
                  ? 'No quotes yet'
                  : 'No matching quotes'}
              </h2>

              <p className="text-sm text-muted-foreground">
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
            <AdminDataTable
              rows={filteredQuotes}
              getRowLabel={(quote) => quote.title || quote.quoteNumber || quote.id}
              columns={[
                { id: 'quote', header: 'Quote', cell: (quote) => <div><p className="font-medium">{quote.title || 'Untitled Quote'}</p><p className="text-xs text-muted-foreground">{quote.quoteNumber || quote.id.slice(0, 8).toUpperCase()}</p></div>, accessor: (quote) => quote.title, sortable: true },
                { id: 'client', header: 'Client', cell: (quote) => quote.client ? <div><p className="font-medium">{quote.client.name}</p>{quote.client.company && <p className="text-xs text-muted-foreground">{quote.client.company}</p>}</div> : <span className="text-muted-foreground">No client</span>, accessor: (quote) => quote.client?.name },
                { id: 'project', header: 'Project', accessor: (quote) => quote.projectName || '—', hideOnMobile: true },
                { id: 'status', header: 'Status', cell: (quote) => <StatusBadge status={quote.status} />, accessor: (quote) => quote.status },
                { id: 'created', header: 'Created', cell: (quote) => formatDate(quote.createdAt), accessor: (quote) => quote.createdAt, hideOnMobile: true },
                { id: 'total', header: 'Total', align: 'right', cell: (quote) => formatAmount(quote.total, quote.currency), accessor: (quote) => quote.total },
              ]}
              rowActions={[
                { label: 'View', onSelect: (quote) => router.push(`/admin/quotes/${quote.id}`) },
                { label: 'View invoice', hidden: (quote) => !quote.invoiceId, onSelect: (quote) => router.push(`/admin/invoices/${quote.invoiceId}`) },
              ]}
              mobileCard={(quote, actions) => (
                <div className="min-w-0 space-y-3">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-medium">{quote.title || 'Untitled Quote'}</p>
                      <p className="break-all text-xs text-muted-foreground">{quote.quoteNumber || quote.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    {actions}
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
                    <span className="min-w-0 break-words">{quote.client?.name || 'No client'}</span>
                    <StatusBadge status={quote.status} />
                  </div>
                  <p className="break-words text-right text-sm font-semibold tabular-nums">{formatAmount(quote.total, quote.currency)}</p>
                </div>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TableFilterBar from '@/components/admin/TableFilterBar';
import AdminDataTable from '@/components/admin/AdminDataTable';

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Total Quotes</p>
            <p className="text-2xl font-bold">{quotes.length}</p>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Accepted</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {acceptedQuotes}
            </p>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Invoiced</p>
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
              {invoicedQuotes}
            </p>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
            <p className="text-2xl font-bold">
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
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* TABLE */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          {loading ? (
            <div className="px-6 py-16 text-center">
              <p className="text-xs font-sans uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                Loading quotes...
              </p>
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
                { id: 'status', header: 'Status', cell: (quote) => <span className={`ui-badge ${quote.status === 'accepted' ? 'ui-badge-success' : quote.status === 'declined' ? 'ui-badge-danger' : quote.status === 'sent' || quote.status === 'viewed' ? 'ui-badge-accent' : ''}`}>{formatStatus(quote.status || 'draft')}</span>, accessor: (quote) => quote.status },
                { id: 'created', header: 'Created', cell: (quote) => formatDate(quote.createdAt), accessor: (quote) => quote.createdAt, hideOnMobile: true },
                { id: 'total', header: 'Total', align: 'right', cell: (quote) => formatAmount(quote.total, quote.currency), accessor: (quote) => quote.total },
              ]}
              rowActions={[
                { label: 'View', onSelect: (quote) => router.push(`/admin/quotes/${quote.id}`) },
                { label: 'View invoice', hidden: (quote) => !quote.invoiceId, onSelect: (quote) => router.push(`/admin/invoices/${quote.invoiceId}`) },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}

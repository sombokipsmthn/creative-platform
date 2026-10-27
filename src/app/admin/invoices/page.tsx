'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FilePlus,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { AdminResourceToolbar, type AdminFilterConfig, type AdminToolbarAction } from '@/components/admin/AdminResourceToolbar';
import StatusBadge from '@/components/admin/StatusBadge';
import StatCards from '@/components/admin/StatCards';

type Client = {
  id: string;
  name?: string | null;
  company?: string | null;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  title: string;
  status: string;
  total: number;
  currency: string;
  issueDate: string;
  dueDate?: string | null;
  client?: Client | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type InvoiceResponse = {
  data: Invoice[];
  pagination: Pagination;
};

const STATUSES: string[] = [
  'all',
  'draft',
  'sent',
  'viewed',
  'paid',
  'overdue',
  'cancelled',
];

const CURRENCIES: { label: string; value: string }[] = [
  { label: 'All currencies', value: 'all' },
  { label: 'KES', value: 'KES' },
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
];

function formatMoney(value: number, currency: string) {
  return `${currency} ${Number(value || 0).toLocaleString('en-KE')}`;
}

function formatDate(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusLabel(status: string) {
  if (!status) return 'Draft';

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function getStatusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'ui-badge ui-badge-success';
    case 'sent':
      return 'ui-badge ui-badge-accent';
    case 'viewed':
      return 'ui-badge ui-badge-accent';
    case 'overdue':
      return 'ui-badge ui-badge-danger';
    case 'cancelled':
      return 'ui-badge ui-badge-danger';
    case 'draft':
    default:
      return 'ui-badge';
  }
}

function getClientName(client?: Client | null) {
  if (!client) {
    return 'No client';
  }

  return client.company || client.name || 'No client';
}

function getInitials(client?: Client | null) {
  const value = getClientName(client);

  if (value === 'No client') {
    return '—';
  }

  const parts = value
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [currency, setCurrency] = useState('all');
  const [clientId, setClientId] = useState('all');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadInvoices = useCallback(async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const params = new URLSearchParams();

      params.set('page', String(page));
      params.set('limit', '20');

      if (status !== 'all') {
        params.set('status', status);
      }

      if (currency !== 'all') {
        params.set('currency', currency);
      }

      if (clientId !== 'all') {
        params.set('clientId', clientId);
      }

      const response = await fetch(`/api/invoices?${params.toString()}`, {
        cache: 'no-store',
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to load invoices');
      }

      const data = result as InvoiceResponse;

      setInvoices(Array.isArray(data.data) ? data.data : []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error('Failed to load invoices:', err);

      setError(
        err instanceof Error ? err.message : 'Unable to load invoices.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, status, currency, clientId]);

  useEffect(() => {
    const load = window.setTimeout(() => {
      void loadInvoices();
    }, 0);
    return () => window.clearTimeout(load);
  }, [loadInvoices]);

  const clients = useMemo(() => {
    const map = new Map<string, Client>();

    invoices.forEach((invoice) => {
      if (invoice.client?.id) {
        map.set(invoice.client.id, invoice.client);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const aName = getClientName(a).toLowerCase();
      const bName = getClientName(b).toLowerCase();

      return aName.localeCompare(bName);
    });
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return invoices;
    }

    return invoices.filter((invoice) => {
      return [
        invoice.invoiceNumber,
        invoice.title,
        invoice.client?.name,
        invoice.client?.company,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [invoices, search]);

  const summary = useMemo(() => {
    const draft = invoices.filter(
      (invoice) => invoice.status.toLowerCase() === 'draft'
    ).length;

    const paid = invoices.filter(
      (invoice) => invoice.status.toLowerCase() === 'paid'
    ).length;

    const outstanding = invoices
      .filter((invoice) => {
        const invoiceStatus = invoice.status.toLowerCase();

        return invoiceStatus !== 'paid' && invoiceStatus !== 'cancelled';
      })
      .reduce(
        (total, invoice) => total + Number(invoice.total || 0),
        0
      );

    return {
      total: pagination?.total ?? invoices.length,
      draft,
      paid,
      outstanding,
    };
  }, [invoices, pagination]);

  function resetFilters() {
    setSearch('');
    setStatus('all');
    setCurrency('all');
    setClientId('all');
    setPage(1);
  }

  const hasFilters =
    search.trim() !== '' ||
    status !== 'all' ||
    currency !== 'all' ||
    clientId !== 'all';

  return (
    <div className="min-h-screen px-4 py-8 font-sans transition-colors duration-300 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminPageHeader
          title="Invoices"
          description="Manage invoices, monitor payments and keep track of client billing."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          primaryAction={
            <Button
              type="button"
              onClick={() => router.push('/admin/invoices/new')}
              variant="primary"
              className="text-xs font-sans uppercase tracking-widest"
            >
              <Plus className="h-3.5 w-3.5" />
              New Invoice
            </Button>
          }
        />

        {error && !loading && (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <StatCards
            stats={[
              { label: 'Total Invoices', value: String(summary.total), detail: '', color: 'default' },
              { label: 'Draft', value: String(summary.draft), detail: '', color: 'default' },
              { label: 'Paid', value: String(summary.paid), detail: '', color: 'success' },
              { label: 'Outstanding', value: formatMoney(summary.outstanding, 'KES'), detail: '', color: 'warning' },
            ]}
            columns={4}
          />
        </div>

        {/* Admin Resource Toolbar */}
        <AdminResourceToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search invoices by number, title, client…"
          filters={[
            {
              id: 'status',
              label: 'Status',
              value: status,
              options: STATUSES.map((s) => ({
                label: s === 'all' ? 'All statuses' : getStatusLabel(s),
                value: s,
              })),
            },
            {
              id: 'currency',
              label: 'Currency',
              value: currency,
              options: CURRENCIES,
            },
            {
              id: 'clientId',
              label: 'Client',
              value: clientId,
              options: [
                { label: 'All clients', value: 'all' },
                ...clients.map((c) => ({
                  label: getClientName(c),
                  value: c.id,
                })),
              ],
              type: 'pills',
            },
          ] as AdminFilterConfig[]}
          onFilterChange={(id, value) => {
            setPage(1);
            if (id === 'status') setStatus(value ?? 'all');
            if (id === 'currency') setCurrency(value ?? 'all');
            if (id === 'clientId') setClientId(value ?? 'all');
          }}
          onClearAll={resetFilters}
          secondaryActions={[
            {
              label: 'Refresh',
              onClick: () => void loadInvoices(true),
              variant: 'ghost',
              size: 'icon',
              icon: <RefreshCw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />,
              disabled: refreshing,
            } as AdminToolbarAction,
          ]}
          resultCount={summary.total}
          filteredCount={filteredInvoices.length}
          resultLabel="Invoices"
          loading={loading}
        />

        {/* TABLE */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          {loading ? (
            <div className="space-y-4 p-6" role="status" aria-label="Loading invoices">
              <span className="sr-only">Loading invoices…</span>
              {[0, 1, 2, 3, 4].map((row) => <div key={row} className="flex gap-4">{[0, 1, 2, 3, 4].map((column) => <Skeleton key={column} className="h-8 flex-1" />)}</div>)}
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center p-12">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FileText className="h-6 w-6" />
              </div>

              <h2 className="text-2xl font-semibold tracking-tight">No invoices found</h2>

              <p className="text-sm text-muted-foreground">
                {hasFilters
                  ? 'Try changing your filters or search terms.'
                  : 'Invoices will appear here once they are created.'}
              </p>

              <div className="flex justify-center mt-4">
                <Button
                  variant="primary"
                  className="mt-6"
                >
                  Create First Invoice
                </Button>
              </div>
            </div>
          ) : (
            <AdminDataTable
              rows={filteredInvoices}
              getRowLabel={(invoice) => invoice.title || invoice.invoiceNumber}
              columns={[
                { id: 'invoice', header: 'Invoice', cell: (invoice) => <div><p className="font-medium">{invoice.title || 'Untitled Invoice'}</p><p className="text-xs text-muted-foreground">{invoice.invoiceNumber || invoice.id.slice(0, 8).toUpperCase()}</p></div>, accessor: (invoice) => invoice.title, sortable: true },
                { id: 'client', header: 'Client', accessor: (invoice) => getClientName(invoice.client) },
                { id: 'status', header: 'Status', cell: (invoice) => <StatusBadge status={invoice.status} />, accessor: (invoice) => invoice.status },
                { id: 'issued', header: 'Issued', cell: (invoice) => formatDate(invoice.issueDate), accessor: (invoice) => invoice.issueDate, hideOnMobile: true },
                { id: 'due', header: 'Due', cell: (invoice) => formatDate(invoice.dueDate), accessor: (invoice) => invoice.dueDate, hideOnMobile: true },
                { id: 'total', header: 'Total', align: 'right', cell: (invoice) => formatMoney(invoice.total, invoice.currency), accessor: (invoice) => invoice.total },
              ]}
              rowActions={[
                { label: 'View', onSelect: (invoice) => window.location.assign(`/admin/invoices/${invoice.id}`) },
                { label: 'Edit', onSelect: (invoice) => window.location.assign(`/admin/invoices/${invoice.id}/edit`) },
                { label: 'Send', hidden: (invoice) => invoice.status !== 'draft', onSelect: (invoice) => window.location.assign(`/admin/invoices/${invoice.id}/send`) },
                { label: 'Duplicate', hidden: (invoice) => invoice.status !== 'draft', onSelect: (invoice) => window.location.assign(`/admin/invoices/${invoice.id}/duplicate`) },
                { label: 'Delete', destructive: true, onSelect: () => window.location.reload() },
              ]}
              mobileCard={(invoice, actions) => (
                <div className="min-w-0 space-y-3">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-medium">{invoice.title || 'Untitled Invoice'}</p>
                      <p className="break-all text-xs text-muted-foreground">{invoice.invoiceNumber || invoice.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    {actions}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
                    <span className="min-w-0 break-words text-muted-foreground">{getClientName(invoice.client)}</span>
                    <StatusBadge status={invoice.status} />
                  </div>
                  <p className="break-words text-right text-sm font-semibold tabular-nums">{formatMoney(invoice.total, invoice.currency)}</p>
                </div>
              )}
            />
          )}
        </div>

        {/* PAGINATION */}
        {pagination && pagination.totalPages > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              {pagination.total === 0
                ? 'No invoices'
                : `Showing page ${pagination.page} of ${pagination.totalPages}`}
            </p>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={pagination.page <= 1}
                variant="secondary"
                className="text-xs font-sans uppercase tracking-widest"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>

              <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-900 px-2 text-[10px] font-sans text-white dark:bg-zinc-800">
                {pagination.page}
              </div>

              <Button
                onClick={() =>
                  setPage((current) =>
                    Math.min(pagination.totalPages, current + 1))
                }
                disabled={pagination.page >= pagination.totalPages}
                variant="secondary"
                className="text-xs font-sans uppercase tracking-widest"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

import { Button } from '@/components/ui/Button';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import TableFilterBar from '@/components/admin/TableFilterBar';

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
              variant="primary"
              className="text-xs font-sans uppercase tracking-widest"
            >
              <Plus className="h-3.5 w-3.5" />
              New Invoice
            </Button>
          }
        />

        {error && !loading && (
          <div className="ui-card p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="ui-stat-card">
            <p className="ui-stat-label">Total Invoices</p>
            <p className="ui-stat-value">{summary.total}</p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Draft</p>
            <p className="ui-stat-value text-amber-600 dark:text-amber-400">
              {summary.draft}
            </p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Paid</p>
            <p className="ui-stat-value text-emerald-600 dark:text-emerald-400">
              {summary.paid}
            </p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Outstanding</p>
            <p className="ui-stat-value text-slate-900 dark:text-white">
              {formatMoney(summary.outstanding, 'KES')}
            </p>
          </div>
        </div>

        {/* Table Filter Bar */}
        <TableFilterBar
          search={search}
          onSearchChange={setSearch}
          filters={{ status, currency, clientId }}
          onFiltersChange={(filters) => {
            setPage(1);
            setStatus(filters.status ?? 'all');
            setCurrency(filters.currency ?? 'all');
            setClientId(filters.clientId ?? 'all');
          }}
          onAddItem={() => {
            // Navigate to new invoice page - we'll need to create this route
          }}
          filterOptions={ [
            {
              label: 'Status',
              value: 'status',
              options: STATUSES.map(s => ({
                label: s === 'all' ? 'All statuses' : getStatusLabel(s),
                value: s
              }))
            },
            {
              label: 'Currency',
              value: 'currency',
              options: CURRENCIES
            },
            {
              label: 'Client',
              value: 'clientId',
              options: [
                { label: 'All clients', value: 'all' },
                ...clients.map(c => ({
                  label: getClientName(c),
                  value: c.id
                }))
              ],
              type: 'pills'
            }
          ] }
          itemLabel="Invoice"
        />

        {hasFilters && (
          <div className="flex items-center justify-between px-2">
            <p className="ui-meta">Showing filtered results</p>
            <Button
              onClick={resetFilters}
              variant="ghost"
              className="text-xs font-sans uppercase tracking-widest"
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* TABLE */}
        <div className="ui-card">
          {loading ? (
            <div className="ui-loading-state p-12">
              <p className="text-xs font-sans uppercase tracking-widest">
                Loading invoices...
              </p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="ui-empty-state p-12">
              <div className="ui-empty-icon">
                <FileText className="h-6 w-6" />
              </div>

              <h2 className="ui-section-title">No invoices found</h2>

              <p className="ui-body">
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
            <div className="overflow-x-auto">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th className="ui-table-header">Invoice</th>
                    <th className="ui-table-header">Client</th>
                    <th className="ui-table-header">Status</th>
                    <th className="ui-table-header">Issued</th>
                    <th className="ui-table-header">Total</th>
                    <th className="ui-table-header" />
                  </tr>
                </thead>

                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="ui-table-row"
                    >
                      {/* INVOICE */}
                      <td className="ui-table-cell">
                        <div className="space-y-1">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {invoice.title || 'Untitled Invoice'}
                            </p>
                            <p className="ui-meta text-xs text-slate-500 dark:text-zinc-600">
                              {invoice.invoiceNumber || invoice.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CLIENT */}
                      <td className="ui-table-cell">
                        <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                          {getClientName(invoice.client)}
                        </p>
                      </td>

                      {/* STATUS */}
                      <td className="ui-table-cell">
                        <div className="flex flex-col items-start gap-2">
                          <span
                            className={`${getStatusBadgeClass(invoice.status)}`}
                          >
                            {getStatusLabel(invoice.status)}
                          </span>
                        </div>
                      </td>

                      {/* ISSUED */}
                      <td className="ui-table-cell">
                        <p className="text-sm text-slate-500 dark:text-zinc-600">
                          {formatDate(invoice.issueDate)}
                        </p>
                      </td>

                      {/* TOTAL */}
                      <td className="ui-table-cell text-right font-medium text-slate-900 dark:text-white">
                        {formatMoney(invoice.total, invoice.currency)}
                      </td>

                      {/* ACTION */}
                      <td className="ui-table-cell text-right">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/invoices/${invoice.id}`}
                            className="ui-button ui-button-secondary text-sm font-sans"
                          >
                            View
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                          <Link
                            href={`/admin/invoices/${invoice.id}/edit`}
                            className="ui-button ui-button-secondary text-sm font-sans"
                          >
                            Edit
                            <Plus className="h-3 w-3" />
                          </Link>
                          {invoice.status === 'draft' && (
                            <>
                              <Link
                                href={`/admin/invoices/${invoice.id}/send`}
                                className="ui-button ui-button-success text-sm font-sans"
                              >
                                Send
                                <CheckCircle2 className="h-3 w-3" />
                              </Link>
                              <Link
                                href={`/admin/invoices/${invoice.id}/duplicate`}
                                className="ui-button ui-button-secondary text-sm font-sans"
                              >
                                Duplicate
                                <FilePlus className="h-3 w-3" />
                              </Link>
                            </>
                          )}
                          <button
                            onClick={() => {
                              if (!window.confirm('Delete this invoice?')) return;
                              // Delete logic would go here - keeping inline for now
                              window.location.reload(); // Placeholder
                            }}
                            className="ui-button ui-button-destructive text-sm font-sans"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {pagination && pagination.totalPages > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <p className="ui-meta">
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
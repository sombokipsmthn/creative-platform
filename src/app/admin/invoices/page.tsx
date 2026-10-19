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
    <div className="">
      <div className="">
        <AdminPageHeader
          title="Invoices"
          description="Manage invoices, monitor payments and keep track of client billing."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          primaryAction={
            <Button
              variant="primary"
              className=""
            >
              <Plus className="" />
              New Invoice
            </Button>
          }
        />

        {error && !loading && (
          <div className="ui-card">
            <p className="">{error}</p>
          </div>
        )}

        {/* SUMMARY */}
        <div className="">
          <div className="ui-stat-card">
            <p className="ui-stat-label">Total Invoices</p>
            <p className="ui-stat-value">{summary.total}</p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Draft</p>
            <p className="ui-stat-value">
              {summary.draft}
            </p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Paid</p>
            <p className="ui-stat-value">
              {summary.paid}
            </p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Outstanding</p>
            <p className="ui-stat-value">
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
          <div className="">
            <p className="ui-meta">Showing filtered results</p>
            <Button
              onClick={resetFilters}
              variant="ghost"
              className=""
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* TABLE */}
        <div className="ui-card">
          {loading ? (
            <div className="ui-loading-state">
              <p className="">
                Loading invoices...
              </p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="ui-empty-state">
              <div className="ui-empty-icon">
                <FileText className="" />
              </div>

              <h2 className="ui-section-title">No invoices found</h2>

              <p className="ui-body">
                {hasFilters
                  ? 'Try changing your filters or search terms.'
                  : 'Invoices will appear here once they are created.'}
              </p>

              <div className="">
                <Button
                  variant="primary"
                  className=""
                >
                  Create First Invoice
                </Button>
              </div>
            </div>
          ) : (
            <div className="">
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
                        <div className="">
                          <div className="">
                            <FileText className="" />
                          </div>
                          <div className="">
                            <p className="">
                              {invoice.title || 'Untitled Invoice'}
                            </p>
                            <p className="ui-meta">
                              {invoice.invoiceNumber || invoice.id.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CLIENT */}
                      <td className="ui-table-cell">
                        <p className="">
                          {getClientName(invoice.client)}
                        </p>
                      </td>

                      {/* STATUS */}
                      <td className="ui-table-cell">
                        <div className="">
                          <span
                            className={`${getStatusBadgeClass(invoice.status)}`}
                          >
                            {getStatusLabel(invoice.status)}
                          </span>
                        </div>
                      </td>

                      {/* ISSUED */}
                      <td className="ui-table-cell">
                        <p className="">
                          {formatDate(invoice.issueDate)}
                        </p>
                      </td>

                      {/* TOTAL */}
                      <td className="ui-table-cell">
                        {formatMoney(invoice.total, invoice.currency)}
                      </td>

                      {/* ACTION */}
                      <td className="ui-table-cell">
                        <div className="">
                          <Link
                            href={`/admin/invoices/${invoice.id}`}
                            className="ui-button ui-button-secondary"
                          >
                            View
                            <ArrowUpRight className="" />
                          </Link>
                          <Link
                            href={`/admin/invoices/${invoice.id}/edit`}
                            className="ui-button ui-button-secondary"
                          >
                            Edit
                            <Plus className="" />
                          </Link>
                          {invoice.status === 'draft' && (
                            <>
                              <Link
                                href={`/admin/invoices/${invoice.id}/send`}
                                className="ui-button ui-button-success"
                              >
                                Send
                                <CheckCircle2 className="" />
                              </Link>
                              <Link
                                href={`/admin/invoices/${invoice.id}/duplicate`}
                                className="ui-button ui-button-secondary"
                              >
                                Duplicate
                                <FilePlus className="" />
                              </Link>
                            </>
                          )}
                          <button
                            onClick={() => {
                              if (!window.confirm('Delete this invoice?')) return;
                              // Delete logic would go here - keeping inline for now
                              window.location.reload(); // Placeholder
                            }}
                            className="ui-button ui-button-destructive"
                          >
                            <Trash2 className="" />
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
          <div className="">
            <p className="ui-meta">
              {pagination.total === 0
                ? 'No invoices'
                : `Showing page ${pagination.page} of ${pagination.totalPages}`}
            </p>

            <div className="">
              <Button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={pagination.page <= 1}
                variant="secondary"
                className=""
              >
                <ChevronLeft className="" />
                Previous
              </Button>

              <div className="">
                {pagination.page}
              </div>

              <Button
                onClick={() =>
                  setPage((current) =>
                    Math.min(pagination.totalPages, current + 1))
                }
                disabled={pagination.page >= pagination.totalPages}
                variant="secondary"
                className=""
              >
                Next
                <ChevronRight className="" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

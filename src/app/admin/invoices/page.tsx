'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCw,
  Search,
} from 'lucide-react';

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

const STATUSES = [
  'all',
  'draft',
  'sent',
  'viewed',
  'paid',
  'overdue',
  'cancelled',
] as const;

const PURPLE = '#6D5DFB';

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

function getStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';

    case 'sent':
      return 'border-blue-200 bg-blue-50 text-blue-700';

    case 'viewed':
      return 'border-violet-200 bg-violet-50 text-violet-700';

    case 'overdue':
      return 'border-red-200 bg-red-50 text-red-700';

    case 'cancelled':
      return 'border-slate-200 bg-slate-100 text-slate-500';

    case 'draft':
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700';
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
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  async function loadInvoices(showRefreshState = false) {
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
  }

  useEffect(() => {
    void loadInvoices();
  }, [page, status, currency, clientId]);

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
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HEADER */}
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p
              className="text-[10px] font-mono uppercase tracking-[0.22em]"
              style={{ color: PURPLE }}
            >
              Billing & Payments
            </p>

            <h1 className="mt-2 text-4xl font-light tracking-tight text-slate-950 sm:text-5xl">
              Invoices
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Manage invoices, monitor payments and keep track of client
              billing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadInvoices(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  refreshing ? 'animate-spin' : ''
                }`}
              />
              Refresh
            </button>

            <Link
              href="/admin/quotes/new"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-widest text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: PURPLE }}
            >
              New Quote
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
              Total invoices
            </p>

            <p className="mt-3 text-3xl font-light tracking-tight text-slate-950">
              {summary.total}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Across all invoice statuses
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
              Draft
            </p>

            <p className="mt-3 text-3xl font-light tracking-tight text-slate-950">
              {summary.draft}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Not yet sent
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
              Paid
            </p>

            <p className="mt-3 text-3xl font-light tracking-tight text-slate-950">
              {summary.paid}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Completed invoices
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
              Outstanding
            </p>

            <p className="mt-3 text-2xl font-light tracking-tight text-slate-950">
              {formatMoney(summary.outstanding, 'KES')}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Current page total
            </p>
          </div>
        </section>

        {/* FILTERS */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                placeholder="Search invoices, clients or projects..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex lg:w-auto">
              <select
                value={status}
                onChange={(event) => {
                  setPage(1);
                  setStatus(event.target.value);
                }}
                className="h-11 min-w-[145px] rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono uppercase tracking-wider text-slate-600 outline-none focus:border-purple-400"
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item === 'all'
                      ? 'All statuses'
                      : getStatusLabel(item)}
                  </option>
                ))}
              </select>

              <select
                value={currency}
                onChange={(event) => {
                  setPage(1);
                  setCurrency(event.target.value);
                }}
                className="h-11 min-w-[135px] rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono uppercase tracking-wider text-slate-600 outline-none focus:border-purple-400"
              >
                <option value="all">All currencies</option>
                <option value="KES">KES</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>

              <select
                value={clientId}
                onChange={(event) => {
                  setPage(1);
                  setClientId(event.target.value);
                }}
                className="h-11 min-w-[170px] rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-purple-400"
              >
                <option value="all">All clients</option>

                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {getClientName(client)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasFilters && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-400">
                Showing filtered results
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="text-[10px] font-mono uppercase tracking-widest text-slate-500 transition hover:text-slate-900"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* INVOICE LIST */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="px-5 py-4 text-left text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
                    Invoice
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
                    Client
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
                    Issued
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
                    Total
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-20 text-center">
                      <div
                        className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200"
                        style={{
                          borderTopColor: PURPLE,
                        }}
                      />

                      <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                        Loading invoices
                      </p>
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-20 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                        <FileText className="h-5 w-5 text-slate-400" />
                      </div>

                      <h2 className="mt-5 text-sm font-medium text-slate-900">
                        No invoices found
                      </h2>

                      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-400">
                        {hasFilters
                          ? 'Try changing your filters or search terms.'
                          : 'Invoices will appear here once they are created.'}
                      </p>

                      {hasFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-5 text-[10px] font-mono uppercase tracking-widest"
                          style={{ color: PURPLE }}
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="group border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-5">
                        <Link
                          href={`/admin/invoices/${invoice.id}`}
                          className="block"
                        >
                          <p className="text-sm font-medium text-slate-900 transition group-hover:text-purple-600">
                            {invoice.title || 'Untitled invoice'}
                          </p>

                          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                            {invoice.invoiceNumber ||
                              invoice.id.slice(0, 8).toUpperCase()}
                          </p>
                        </Link>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[9px] font-mono font-semibold"
                            style={{
                              backgroundColor: `${PURPLE}12`,
                              color: PURPLE,
                            }}
                          >
                            {getInitials(invoice.client)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm text-slate-700">
                              {getClientName(invoice.client)}
                            </p>

                            {invoice.client?.company &&
                              invoice.client?.name && (
                                <p className="mt-0.5 truncate text-xs text-slate-400">
                                  {invoice.client.name}
                                </p>
                              )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest ${getStatusClass(
                            invoice.status
                          )}`}
                        >
                          {getStatusLabel(invoice.status)}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm text-slate-600">
                          {formatDate(invoice.issueDate)}
                        </p>

                        {invoice.dueDate && (
                          <p className="mt-1 text-[10px] text-slate-400">
                            Due {formatDate(invoice.dueDate)}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-5 text-right">
                        <p className="font-mono text-sm font-medium text-slate-900">
                          {formatMoney(invoice.total, invoice.currency)}
                        </p>
                      </td>

                      <td className="px-5 py-5 text-right">
                        <Link
                          href={`/admin/invoices/${invoice.id}`}
                          className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 transition hover:text-purple-600"
                        >
                          View
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            {loading ? (
              <div className="px-5 py-20 text-center">
                <div
                  className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200"
                  style={{
                    borderTopColor: PURPLE,
                  }}
                />

                <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                  Loading invoices
                </p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="px-5 py-20 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>

                <h2 className="mt-5 text-sm font-medium text-slate-900">
                  No invoices found
                </h2>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {hasFilters
                    ? 'Try changing your filters.'
                    : 'Invoices will appear here once created.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredInvoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/admin/invoices/${invoice.id}`}
                    className="block p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {invoice.title || 'Untitled invoice'}
                        </p>

                        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                          {invoice.invoiceNumber ||
                            invoice.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2 py-1 text-[8px] font-mono uppercase tracking-widest ${getStatusClass(
                          invoice.status
                        )}`}
                      >
                        {getStatusLabel(invoice.status)}
                      </span>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                          Client
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {getClientName(invoice.client)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                          Total
                        </p>

                        <p className="mt-1 font-mono text-sm font-medium text-slate-900">
                          {formatMoney(invoice.total, invoice.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <p className="text-[10px] text-slate-400">
                        Issued {formatDate(invoice.issueDate)}
                      </p>

                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest"
                        style={{ color: PURPLE }}
                      >
                        View
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* PAGINATION */}
        {pagination && pagination.totalPages > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">
              {pagination.total === 0
                ? 'No invoices'
                : `Showing page ${pagination.page} of ${pagination.totalPages}`}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>

              <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-900 px-2 text-[10px] font-mono text-white">
                {pagination.page}
              </div>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(pagination.totalPages, current + 1)
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
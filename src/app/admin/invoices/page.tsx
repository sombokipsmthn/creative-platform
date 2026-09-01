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
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300';

    case 'sent':
      return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300';

    case 'viewed':
      return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300';

    case 'overdue':
      return 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300';

    case 'cancelled':
      return 'border-slate-200 bg-slate-100 text-slate-500 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400';

    case 'draft':
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300';
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
              Manage invoices, monitor payments and keep track of client billing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void loadInvoices(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-mono uppercase tracking-widest text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
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
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-xs font-mono font-semibold uppercase tracking-widest text-white transition hover:bg-purple-700 shadow-sm"
            >
              New Quote
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
              Total Invoices
            </p>

            <p className="mt-2 text-3xl font-light text-slate-900 dark:text-white">
              {summary.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
              Draft
            </p>

            <p className="mt-2 text-3xl font-light text-amber-600 dark:text-amber-400">
              {summary.draft}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
              Paid
            </p>

            <p className="mt-2 text-3xl font-light text-emerald-600 dark:text-emerald-400">
              {summary.paid}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
              Outstanding
            </p>

            <p className="mt-2 text-2xl font-light text-slate-900 dark:text-white">
              {formatMoney(summary.outstanding, 'KES')}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search invoices, clients or projects..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item === 'all' ? 'All statuses' : getStatusLabel(item)}
              </option>
            ))}
          </select>

          <select
            value={currency}
            onChange={(event) => {
              setPage(1);
              setCurrency(event.target.value);
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
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
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          >
            <option value="all">All clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {getClientName(client)}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between px-2">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Showing filtered results
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-mono text-purple-600 dark:text-purple-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/50 dark:bg-red-950/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
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
                    Issued
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                    Total
                  </th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <p className="text-xs font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                        Loading invoices...
                      </p>
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/10 text-xl text-purple-600 dark:text-purple-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <h2 className="mt-5 text-lg font-medium text-slate-900 dark:text-white">
                        No invoices found
                      </h2>
                      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-zinc-500">
                        {hasFilters
                          ? 'Try changing your filters or search terms.'
                          : 'Invoices will appear here once they are created.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50 dark:border-zinc-900 dark:hover:bg-zinc-900/50"
                    >
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {invoice.title || 'Untitled Invoice'}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-600">
                            {invoice.invoiceNumber || invoice.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-600/10 text-[9px] font-mono font-semibold text-purple-600 dark:text-purple-400">
                            {getInitials(invoice.client)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 dark:text-zinc-300 truncate">
                              {getClientName(invoice.client)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider ${getStatusClass(
                            invoice.status
                          )}`}
                        >
                          {getStatusLabel(invoice.status)}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500 dark:text-zinc-500">
                        {formatDate(invoice.issueDate)}
                      </td>

                      <td className="px-6 py-5 text-right font-medium text-slate-900 dark:text-white">
                        {formatMoney(invoice.total, invoice.currency)}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/admin/invoices/${invoice.id}`}
                          className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
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
        </div>

        {/* PAGINATION */}
        {pagination && pagination.totalPages > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <p className="text-xs text-slate-400">
              {pagination.total === 0
                ? 'No invoices'
                : `Showing page ${pagination.page} of ${pagination.totalPages}`}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>

              <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-slate-900 px-2 text-[10px] font-mono text-white dark:bg-zinc-800">
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

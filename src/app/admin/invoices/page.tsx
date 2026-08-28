'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

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

const statuses = [
  'all',
  'draft',
  'sent',
  'viewed',
  'paid',
  'overdue',
  'cancelled',
];

function formatMoney(value: number, currency: string) {
  return `${currency} ${Number(value || 0).toLocaleString('en-KE')}`;
}

function formatDate(value?: string | null) {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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

  async function loadInvoices() {
    try {
      setLoading(true);
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

      const response = await fetch(
        `/api/invoices?${params.toString()}`,
        {
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load invoices');
      }

      const result: InvoiceResponse =
        await response.json();

      setInvoices(result.data || []);
      setPagination(result.pagination || null);

    } catch (err) {
      console.error(err);
      setError('Unable to load invoices.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, [
    page,
    status,
    currency,
    clientId,
  ]);


  const clients = useMemo(() => {
    const map = new Map<string, Client>();

    invoices.forEach((invoice) => {
      if (invoice.client?.id) {
        map.set(
          invoice.client.id,
          invoice.client
        );
      }
    });

    return Array.from(map.values());

  }, [invoices]);


  const filteredInvoices =
    invoices.filter((invoice) => {
      const query =
        search.toLowerCase();

      if (!query) {
        return true;
      }

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


  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">

        <header>
          <p className="text-[10px] font-mono uppercase tracking-widest text-purple-600">
            Billing & Payments
          </p>

          <h1 className="mt-3 text-4xl font-light">
            Invoices
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage invoices, payments and client billing.
          </p>
        </header>


        <section className="grid gap-3 md:grid-cols-4">

          <input
            placeholder="Search invoices..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            className="rounded-xl border px-4 py-3"
          />


          <select
            value={status}
            onChange={(e)=>{
              setPage(1);
              setStatus(e.target.value);
            }}
            className="rounded-xl border px-4 py-3"
          >
            {statuses.map(item=>(
              <option key={item}>
                {item}
              </option>
            ))}
          </select>


          <select
            value={currency}
            onChange={(e)=>{
              setPage(1);
              setCurrency(e.target.value);
            }}
            className="rounded-xl border px-4 py-3"
          >
            <option value="all">
              All currencies
            </option>
            <option value="KES">
              KES
            </option>
            <option value="USD">
              USD
            </option>
          </select>


          <select
            value={clientId}
            onChange={(e)=>{
              setPage(1);
              setClientId(e.target.value);
            }}
            className="rounded-xl border px-4 py-3"
          >
            <option value="all">
              All clients
            </option>

            {clients.map(client=>(
              <option
                key={client.id}
                value={client.id}
              >
                {client.name ||
                  client.company}
              </option>
            ))}
          </select>

        </section>


        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}


        <section className="overflow-hidden rounded-2xl border bg-white">

          {loading ? (

            <div className="p-12 text-center">
              Loading invoices...
            </div>

          ) : (

            <table className="w-full">

              <thead>
                <tr className="border-b text-left text-xs uppercase">
                  <th className="p-5">
                    Invoice
                  </th>

                  <th className="p-5">
                    Client
                  </th>

                  <th className="p-5">
                    Status
                  </th>

                  <th className="p-5">
                    Date
                  </th>

                  <th className="p-5 text-right">
                    Total
                  </th>

                  <th />
                </tr>
              </thead>


              <tbody>

                {filteredInvoices.map(invoice=>(

                  <tr
                    key={invoice.id}
                    className="border-b"
                  >

                    <td className="p-5">
                      <p className="font-medium">
                        {invoice.title}
                      </p>

                      <p className="text-xs text-slate-500">
                        {invoice.invoiceNumber}
                      </p>
                    </td>


                    <td className="p-5">
                      {invoice.client?.name ||
                        invoice.client?.company ||
                        'No client'}
                    </td>


                    <td className="p-5 capitalize">
                      {invoice.status}
                    </td>


                    <td className="p-5">
                      {formatDate(
                        invoice.issueDate
                      )}
                    </td>


                    <td className="p-5 text-right">
                      {formatMoney(
                        invoice.total,
                        invoice.currency
                      )}
                    </td>


                    <td className="p-5 text-right">
                      <Link
                        href={`/admin/invoices/${invoice.id}`}
                        className="text-purple-600"
                      >
                        View →
                      </Link>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </section>


        {pagination && (

          <div className="flex items-center justify-between">

            <button
              disabled={
                pagination.page <= 1
              }
              onClick={() =>
                setPage(page - 1)
              }
              className="rounded-lg border px-4 py-2 disabled:opacity-50"
            >
              Previous
            </button>


            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>


            <button
              disabled={
                pagination.page >=
                pagination.totalPages
              }
              onClick={() =>
                setPage(page + 1)
              }
              className="rounded-lg border px-4 py-2 disabled:opacity-50"
            >
              Next
            </button>

          </div>

        )}

      </div>
    </main>
  );
}
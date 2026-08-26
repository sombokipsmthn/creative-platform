'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/* =========================================================
   TYPES
========================================================= */

type Client = {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  kraPin?: string | null;
};

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

type Invoice = {
  id: string;
  invoiceNumber?: string | null;
  title: string;
  status: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  issueDate?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  quoteId?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client | null;
  items?: InvoiceItem[];
};

/* =========================================================
   CONSTANTS
========================================================= */

const PURPLE = '#6D5DFB';

const NEXT_STATUS: Record<string, { label: string; value: string; color: string } | null> = {
  draft: { label: 'Mark as Sent', value: 'sent', color: 'bg-blue-600 hover:bg-blue-700' },
  sent: { label: 'Mark as Paid', value: 'paid', color: 'bg-emerald-600 hover:bg-emerald-700' },
  overdue: { label: 'Mark as Paid', value: 'paid', color: 'bg-emerald-600 hover:bg-emerald-700' },
  paid: null,
  cancelled: null,
};

/* =========================================================
   HELPERS
========================================================= */

function fmt(amount: number, currency = 'KES') {
  return `${currency} ${Number(amount || 0).toLocaleString('en-KE')}`;
}

function fmtDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700';
    case 'sent':
      return 'bg-blue-500/15 border-blue-500/30 text-blue-700';
    case 'overdue':
      return 'bg-red-500/15 border-red-500/30 text-red-700';
    case 'cancelled':
      return 'bg-slate-200 border-slate-300 text-slate-500';
    default:
      return 'bg-amber-500/15 border-amber-500/30 text-amber-700';
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const invoiceId = params?.id;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!invoiceId) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/invoices/${invoiceId}`, { cache: 'no-store' });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || 'Failed to load invoice');
        if (!cancelled) setInvoice(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load invoice.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [invoiceId]);

  async function updateStatus(nextStatus: string) {
    if (!invoice) return;
    try {
      setUpdating(true);
      setError('');
      setSuccess('');
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Failed to update invoice');
      setInvoice(data);
      setSuccess(`Invoice marked as ${nextStatus}.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice.');
    } finally {
      setUpdating(false);
    }
  }

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200"
            style={{ borderTopColor: PURPLE }}
          />
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Loading invoice…</p>
        </div>
      </div>
    );
  }

  /* ---- Not found ---- */
  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <Link href="/admin/invoices" className="text-xs font-mono uppercase tracking-widest text-purple-600">
            ← Back to Invoices
          </Link>
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <h1 className="text-xl font-semibold text-red-700">Invoice not found</h1>
            <p className="mt-2 text-sm text-red-600">{error || 'The requested invoice could not be loaded.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const status = invoice.status?.toLowerCase() || 'draft';
  const nextAction = NEXT_STATUS[status] ?? null;
  const currency = invoice.currency || 'KES';
  const items = invoice.items ?? [];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 print:bg-white print:p-0">

      {/* TOOLBAR */}
      <div className="mx-auto mb-6 max-w-5xl print:hidden">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/invoices"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600"
              aria-label="Back to invoices"
            >
              ←
            </Link>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-purple-500">Invoice</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {invoice.invoiceNumber || invoice.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-widest ${statusBadgeClass(status)}`}>
              {status}
            </span>

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Print / PDF
            </button>

            {invoice.quoteId && (
              <Link
                href={`/admin/quotes/${invoice.quoteId}`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-slate-600 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600"
              >
                View Quote
              </Link>
            )}

            {nextAction && (
              <button
                type="button"
                disabled={updating}
                onClick={() => updateStatus(nextAction.value)}
                className={`rounded-xl px-5 py-2.5 text-xs font-mono font-semibold uppercase tracking-widest text-white transition disabled:opacity-50 ${nextAction.color}`}
              >
                {updating ? 'Updating…' : nextAction.label}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>
        )}
        {success && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">{success}</div>
        )}
      </div>

      {/* INVOICE DOCUMENT */}
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm print:shadow-none print:border-0">

          {/* HEADER */}
          <div className="border-b border-slate-100 px-8 py-8 sm:px-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 h-1 w-10 rounded" style={{ backgroundColor: PURPLE }} />
                <h1 className="text-3xl font-light tracking-tight text-slate-900">{invoice.title}</h1>
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate-400">
                  {invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8).toUpperCase()}`}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-slate-500">
                  <span className="font-mono uppercase tracking-widest text-slate-400">Issued: </span>
                  {fmtDate(invoice.issueDate)}
                </p>
                {invoice.dueDate && (
                  <p className="text-xs text-slate-500">
                    <span className="font-mono uppercase tracking-widest text-slate-400">Due: </span>
                    {fmtDate(invoice.dueDate)}
                  </p>
                )}
                <div className="pt-1">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-widest ${statusBadgeClass(status)}`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CLIENT */}
          <div className="border-b border-slate-100 px-8 py-6 sm:px-10">
            <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Billed To</p>
            {invoice.client ? (
              <div className="space-y-0.5">
                {invoice.client.company && (
                  <p className="font-semibold text-slate-900">{invoice.client.company}</p>
                )}
                <p className={invoice.client.company ? 'text-sm text-slate-600' : 'font-semibold text-slate-900'}>
                  {invoice.client.name}
                </p>
                {invoice.client.email && <p className="text-sm text-slate-500">{invoice.client.email}</p>}
                {invoice.client.phone && <p className="text-sm text-slate-500">{invoice.client.phone}</p>}
                {invoice.client.kraPin && (
                  <p className="pt-1 text-xs font-mono text-slate-400">KRA PIN: {invoice.client.kraPin}</p>
                )}
              </div>
            ) : (
              <p className="italic text-sm text-slate-400">No client attached</p>
            )}
          </div>

          {/* LINE ITEMS */}
          <div className="px-8 py-6 sm:px-10">
            <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Line Items</p>
            {items.length === 0 ? (
              <p className="py-8 text-center italic text-sm text-slate-400">No line items on this invoice.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-2 pr-4 text-left text-[10px] font-mono uppercase tracking-widest text-slate-400">Description</th>
                      <th className="py-2 pr-4 text-right text-[10px] font-mono uppercase tracking-widest text-slate-400">Qty</th>
                      <th className="py-2 pr-4 text-right text-[10px] font-mono uppercase tracking-widest text-slate-400">Unit Price</th>
                      <th className="py-2 text-right text-[10px] font-mono uppercase tracking-widest text-slate-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-slate-900">{item.description || '—'}</p>
                        </td>
                        <td className="py-3 pr-4 text-right font-mono text-slate-700">{item.quantity}</td>
                        <td className="py-3 pr-4 text-right font-mono text-slate-700">{fmt(item.unitPrice, currency)}</td>
                        <td className="py-3 text-right font-mono font-medium text-slate-900">{fmt(item.amount, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* TOTALS */}
          <div className="border-t border-slate-100 px-8 py-6 sm:px-10">
            <div className="ml-auto max-w-xs space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono">{fmt(invoice.subtotal ?? 0, currency)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax</span>
                <span className="font-mono">{fmt(invoice.tax ?? 0, currency)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                <span>Total</span>
                <span className="font-mono" style={{ color: PURPLE }}>{fmt(invoice.total ?? 0, currency)}</span>
              </div>
            </div>
          </div>

          {/* NOTES */}
          {invoice.notes && (
            <div className="border-t border-slate-100 px-8 py-6 sm:px-10">
              <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">Notes</p>
              <p className="whitespace-pre-wrap text-sm text-slate-600">{invoice.notes}</p>
            </div>
          )}

          {/* FOOTER */}
          <div className="border-t border-slate-100 px-8 py-5 sm:px-10 print:hidden">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] font-mono text-slate-300">
                Created {fmtDate(invoice.createdAt)} · Updated {fmtDate(invoice.updatedAt)}
              </p>
              <p className="text-[10px] font-mono text-slate-300">ID: {invoice.id}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

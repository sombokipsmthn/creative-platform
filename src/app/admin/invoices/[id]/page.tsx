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
      return 'bg-blue-500/15 lue-500/30 text-blue-700';
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
      <div className="">
        <div className="">
          <div
            className=""

          />
          <p className="">Loading invoice…</p>
        </div>
      </div>
    );
  }

  /* ---- Not found ---- */
  if (!invoice) {
    return (
      <div className="">
        <div className="">
          <Link href="/admin/invoices" className="">
            ← Back to Invoices
          </Link>
          <div className="">
            <h1 className="">Invoice not found</h1>
            <p className="">{error || 'The requested invoice could not be loaded.'}</p>
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
    <div className="">

      {/* TOOLBAR */}
      <div className="">
        <div className="">
          <div className="">
            <Link
              href="/admin/invoices"
              className=""
              aria-label="Back to invoices"
            >
              ←
            </Link>
            <div>
              <p className="">Invoice</p>
              <p className="">
                {invoice.invoiceNumber || invoice.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="">
            <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-sans uppercase tracking-widest ${statusBadgeClass(status)}`}>
              {status}
            </span>

            <button
              type="button"
              onClick={() => window.print()}
              className=""
            >
              Print / PDF
            </button>

            {invoice.quoteId && (
              <Link
                href={`/admin/quotes/${invoice.quoteId}`}
                className=""
              >
                View Quote
              </Link>
            )}

            {nextAction && (
              <button
                type="button"
                disabled={updating}
                onClick={() => updateStatus(nextAction.value)}
                className={`rounded-xl px-5 py-2.5 text-xs font-sans font-semibold uppercase tracking-widest text-white transition disabled:opacity-50 ${nextAction.color}`}
              >
                {updating ? 'Updating…' : nextAction.label}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="">{error}</div>
        )}
        {success && (
          <div className="">{success}</div>
        )}
      </div>

      {/* INVOICE DOCUMENT */}
      <div className="">
        <div className="">

          {/* HEADER */}
          <div className="">
            <div className="">
              <div>
                <div className="" />
                <h1 className="">{invoice.title}</h1>
                <p className="">
                  {invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8).toUpperCase()}`}
                </p>
              </div>
              <div className="">
                <p className="">
                  <span className="">Issued: </span>
                  {fmtDate(invoice.issueDate)}
                </p>
                {invoice.dueDate && (
                  <p className="">
                    <span className="">Due: </span>
                    {fmtDate(invoice.dueDate)}
                  </p>
                )}
                <div className="">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-sans uppercase tracking-widest print:border-0 print:px-0 ${statusBadgeClass(status)}`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CLIENT */}
          <div className="">
            <p className="">Billed To</p>
            {invoice.client ? (
              <div className="">
                {invoice.client.company && (
                  <p className="">{invoice.client.company}</p>
                )}
                <p className={invoice.client.company ? 'text-sm text-slate-600' : 'font-semibold text-slate-900'}>
                  {invoice.client.name}
                </p>
                {invoice.client.email && <p className="">{invoice.client.email}</p>}
                {invoice.client.phone && <p className="">{invoice.client.phone}</p>}
                {invoice.client.kraPin && (
                  <p className="">KRA PIN: {invoice.client.kraPin}</p>
                )}
              </div>
            ) : (
              <p className="">No client attached</p>
            )}
          </div>

          {/* LINE ITEMS */}
          <div className="">
            <p className="">Line Items</p>
            {items.length === 0 ? (
              <p className="">No line items on this invoice.</p>
            ) : (
              <div className="">
                <table className="">
                  <thead>
                    <tr className="">
                      <th className="">Description</th>
                      <th className="">Qty</th>
                      <th className="">Unit Price</th>
                      <th className="">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="">
                          <p className="">{item.description || '—'}</p>
                        </td>
                        <td className="">{item.quantity}</td>
                        <td className="">{fmt(item.unitPrice, currency)}</td>
                        <td className="">{fmt(item.amount, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* TOTALS */}
          <div className="">
            <div className="">
              <div className="">
                <span>Subtotal</span>
                <span className="">{fmt(invoice.subtotal ?? 0, currency)}</span>
              </div>
              <div className="">
                <span>Tax</span>
                <span className="">{fmt(invoice.tax ?? 0, currency)}</span>
              </div>
              <div className="">
                <span>Total</span>
                <span className="">{fmt(invoice.total ?? 0, currency)}</span>
              </div>
            </div>
          </div>

          {/* NOTES */}
          {invoice.notes && (
            <div className="">
              <p className="">Notes</p>
              <p className="">{invoice.notes}</p>
            </div>
          )}

          {/* FOOTER */}
          <div className="">
            <div className="">
              <p className="">
                Created {fmtDate(invoice.createdAt)} · Updated {fmtDate(invoice.updatedAt)}
              </p>
              <p className="">ID: {invoice.id}</p>
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm 14mm;
          }

          html,
          body {
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          input,
          textarea,
          select,
          button {
            box-shadow: none !important;
          }

          .print\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

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

type Schedule = { id: string; label: string; amount: number; currency: string; dueDate: string; milestone?: string | null; status: string; notes?: string | null };
type TermAmendment = { id: string; previousTerms?: string | null; newTerms: string; agreementDate: string; evidenceReference?: string | null; notes?: string | null };
type AuditItem = { audit: { eventType: string; metadata: Record<string, unknown>; createdAt: string }; payment: { id: string; reference: string; amount: number; currency: string } };

type PaymentSummary = {
  confirmedAmount: number;
  pendingAmount: number;
  outstanding: number;
  progress: number;
  paymentStatus: string;
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

function ScheduleForm({ invoiceId, currency }: { invoiceId: string; currency: string }) { return <form className="mt-4 grid gap-2" onSubmit={async event => { event.preventDefault(); const response = await fetch(`/api/invoices/${invoiceId}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'schedule', invoiceId, currency, ...Object.fromEntries(new FormData(event.currentTarget).entries()) }) }); if (response.ok) window.location.reload(); }}><input name="label" required placeholder="Deposit or milestone" className="rounded-xl border border-slate-200 px-3 py-2 text-xs" /><input name="amount" type="number" min="1" required placeholder="Amount in minor units" className="rounded-xl border border-slate-200 px-3 py-2 text-xs" /><input name="dueDate" type="date" required className="rounded-xl border border-slate-200 px-3 py-2 text-xs" /><button className="rounded-xl bg-slate-900 px-3 py-2 text-xs uppercase tracking-widest text-white">Add schedule</button></form>; }
function TermForm({ invoiceId }: { invoiceId: string }) { return <form className="mt-4 grid gap-2" onSubmit={async event => { event.preventDefault(); const response = await fetch(`/api/invoices/${invoiceId}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'term_amendment', invoiceId, ...Object.fromEntries(new FormData(event.currentTarget).entries()) }) }); if (response.ok) window.location.reload(); }}><textarea name="newTerms" required placeholder="Agreed payment terms" className="min-h-20 rounded-xl border border-slate-200 px-3 py-2 text-xs" /><input name="agreementDate" type="date" required className="rounded-xl border border-slate-200 px-3 py-2 text-xs" /><button className="rounded-xl bg-slate-900 px-3 py-2 text-xs uppercase tracking-widest text-white">Add amendment</button></form>; }

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
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [amendments, setAmendments] = useState<TermAmendment[]>([]);
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);

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
        if (!cancelled) {
          setInvoice(data);
          const paymentResponse = await fetch(`/api/invoices/${invoiceId}/payments`, { cache: 'no-store' });
          if (paymentResponse.ok) setPaymentSummary(await paymentResponse.json());
          const [scheduleResponse, termResponse, auditResponse] = await Promise.all([
            fetch(`/api/invoices/${invoiceId}/payments?view=schedules`, { cache: 'no-store' }),
            fetch(`/api/invoices/${invoiceId}/payments?view=terms`, { cache: 'no-store' }),
            fetch(`/api/invoices/${invoiceId}/payments?view=audit`, { cache: 'no-store' }),
          ]);
          if (scheduleResponse.ok) setSchedules(await scheduleResponse.json());
          if (termResponse.ok) setAmendments(await termResponse.json());
          if (auditResponse.ok) setAuditItems(await auditResponse.json());
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load invoice.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [invoiceId]);

  async function recordPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invoice) return;
    setPaymentSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form.entries())) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Payment could not be recorded');
      setPaymentOpen(false);
      const refreshed = await fetch(`/api/invoices/${invoice.id}/payments`, { cache: 'no-store' });
      if (refreshed.ok) setPaymentSummary(await refreshed.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment could not be recorded.');
    } finally {
      setPaymentSaving(false);
    }
  }

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
          <p className="text-xs font-sans uppercase tracking-widest text-slate-400">Loading invoice…</p>
        </div>
      </div>
    );
  }

  /* ---- Not found ---- */
  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <Link href="/admin/invoices" className="text-xs font-sans uppercase tracking-widest text-purple-600">
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
              <p className="text-[10px] font-sans uppercase tracking-widest text-purple-500">Invoice</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {invoice.invoiceNumber || invoice.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-sans uppercase tracking-widest ${statusBadgeClass(status)}`}>
              {status}
            </span>

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-sans uppercase tracking-widest text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Print / PDF
            </button>

            {invoice.quoteId && (
              <Link
                href={`/admin/quotes/${invoice.quoteId}`}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-sans uppercase tracking-widest text-slate-600 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600"
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
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>
        )}
        {success && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">{success}</div>
        )}
      </div>

      {/* FINANCIAL SUMMARY */}
      {paymentSummary && (
        <section className="mb-6 grid gap-4 sm:grid-cols-4" aria-label="Payment summary">
          <div className="ui-stat-card"><p className="ui-stat-label">Invoice total</p><p className="ui-stat-value">{fmt(invoice.total, currency)}</p></div>
          <div className="ui-stat-card"><p className="ui-stat-label">Confirmed paid</p><p className="ui-stat-value">{fmt(paymentSummary.confirmedAmount, currency)}</p></div>
          <div className="ui-stat-card"><p className="ui-stat-label">Outstanding</p><p className="ui-stat-value">{fmt(paymentSummary.outstanding, currency)}</p></div>
          <div className="ui-stat-card"><p className="ui-stat-label">Payment status</p><p className="ui-stat-value text-base capitalize">{paymentSummary.paymentStatus.replace('_', ' ')}</p><p className="ui-stat-detail">{paymentSummary.progress}% confirmed</p></div>
        </section>
      )}

      {paymentSummary && <div className="mx-auto mb-6 max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">Payment ledger</p><p className="text-xs text-slate-500">Confirmed: {fmt(paymentSummary.confirmedAmount, currency)} · Outstanding: {fmt(paymentSummary.outstanding, currency)}</p></div><button type="button" onClick={() => setPaymentOpen((value) => !value)} className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white">Record payment</button></div>{paymentOpen && <form onSubmit={recordPayment} className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2"><input type="hidden" name="invoiceId" value={invoice.id} /><input type="hidden" name="currency" value={currency} /><label className="grid gap-1 text-xs"><span>Amount in minor units</span><input name="amount" type="number" min="1" defaultValue={paymentSummary.outstanding} required className="rounded-xl border border-slate-200 px-3 py-2" /></label><label className="grid gap-1 text-xs"><span>Method</span><select name="method" defaultValue="bank_transfer" className="rounded-xl border border-slate-200 px-3 py-2"><option value="mpesa">M-Pesa</option><option value="bank_transfer">Bank transfer</option><option value="cash">Cash</option><option value="card">Card</option><option value="cheque">Cheque</option><option value="other">Other</option></select></label><label className="grid gap-1 text-xs"><span>Paid date</span><input name="paidAt" type="date" required className="rounded-xl border border-slate-200 px-3 py-2" /></label><label className="grid gap-1 text-xs"><span>Verification</span><select name="status" defaultValue="pending_verification" className="rounded-xl border border-slate-200 px-3 py-2"><option value="pending_verification">Pending verification</option><option value="confirmed">Confirmed received</option></select></label><label className="grid gap-1 text-xs sm:col-span-2"><span>Transaction reference</span><input name="transactionReference" className="rounded-xl border border-slate-200 px-3 py-2" /></label><div className="flex gap-2 sm:col-span-2"><button type="submit" disabled={paymentSaving} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white">{paymentSaving ? 'Saving…' : 'Save payment'}</button><button type="button" onClick={() => setPaymentOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs uppercase tracking-widest">Cancel</button></div></form>}</div>}

      <div className="mx-auto mb-6 grid max-w-5xl gap-6 lg:grid-cols-2 print:hidden"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-semibold text-slate-900">Payment schedule</h2>{schedules.length ? <div className="mt-3 space-y-2">{schedules.map(schedule => <div key={schedule.id} className="flex justify-between border-b border-slate-100 pb-2 text-xs"><span>{schedule.label}<br /><span className="text-slate-400">Due {fmtDate(schedule.dueDate)}</span></span><span className="font-medium">{fmt(schedule.amount, schedule.currency)}</span></div>)}</div> : <p className="mt-3 text-xs text-slate-500">No scheduled instalments recorded.</p>}<ScheduleForm invoiceId={invoice.id} currency={currency} /></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-semibold text-slate-900">Payment terms history</h2>{amendments.length ? <div className="mt-3 space-y-3">{amendments.map(item => <div key={item.id} className="border-b border-slate-100 pb-2 text-xs"><p className="font-medium">{item.newTerms}</p><p className="text-slate-400">Agreed {fmtDate(item.agreementDate)}</p></div>)}</div> : <p className="mt-3 text-xs text-slate-500">No term amendments recorded.</p>}<TermForm invoiceId={invoice.id} /></section></div><section className="mx-auto mb-6 max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden"><h2 className="text-sm font-semibold text-slate-900">Payment audit history</h2>{auditItems.length ? <div className="mt-3 space-y-2">{auditItems.map(item => <div key={`${item.audit.createdAt}-${item.payment.id}`} className="flex justify-between border-b border-slate-100 pb-2 text-xs"><span>{item.audit.eventType} · {item.payment.reference}</span><span className="text-slate-400">{fmtDate(item.audit.createdAt)}</span></div>)}</div> : <p className="mt-3 text-xs text-slate-500">No audit events recorded.</p>}</section>

      {/* INVOICE DOCUMENT */}
      <div className="mx-auto max-w-5xl print:max-w-none">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">

          {/* HEADER */}
          <div className="border-b border-slate-100 px-8 py-8 sm:px-10 print:px-0 print:py-0 print:pb-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 h-1 w-10 print:hidden" style={{ backgroundColor: PURPLE }} />
                <h1 className="text-3xl font-light tracking-tight text-slate-900">{invoice.title}</h1>
                <p className="mt-1 font-sans text-xs uppercase tracking-widest text-slate-400">
                  {invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8).toUpperCase()}`}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs text-slate-500">
                  <span className="font-sans uppercase tracking-widest text-slate-400">Issued: </span>
                  {fmtDate(invoice.issueDate)}
                </p>
                {invoice.dueDate && (
                  <p className="text-xs text-slate-500">
                    <span className="font-sans uppercase tracking-widest text-slate-400">Due: </span>
                    {fmtDate(invoice.dueDate)}
                  </p>
                )}
                <div className="pt-1">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-sans uppercase tracking-widest print:border-0 print:px-0 ${statusBadgeClass(status)}`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CLIENT */}
          <div className="border-b border-slate-100 px-8 py-6 sm:px-10 print:px-0">
            <p className="mb-3 text-[10px] font-sans uppercase tracking-[0.2em] text-slate-400">Billed To</p>
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
                  <p className="pt-1 text-xs font-sans text-slate-400">KRA PIN: {invoice.client.kraPin}</p>
                )}
              </div>
            ) : (
              <p className="italic text-sm text-slate-400">No client attached</p>
            )}
          </div>

          {/* LINE ITEMS */}
          <div className="px-8 py-6 sm:px-10 print:px-0">
            <p className="mb-4 text-[10px] font-sans uppercase tracking-[0.2em] text-slate-400">Line Items</p>
            {items.length === 0 ? (
              <p className="py-8 text-center italic text-sm text-slate-400">No line items on this invoice.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-2 pr-4 text-left text-[10px] font-sans uppercase tracking-widest text-slate-400">Description</th>
                      <th className="py-2 pr-4 text-right text-[10px] font-sans uppercase tracking-widest text-slate-400">Qty</th>
                      <th className="py-2 pr-4 text-right text-[10px] font-sans uppercase tracking-widest text-slate-400">Unit Price</th>
                      <th className="py-2 text-right text-[10px] font-sans uppercase tracking-widest text-slate-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 pr-4">
                          <p className="font-medium text-slate-900">{item.description || '—'}</p>
                        </td>
                        <td className="py-3 pr-4 text-right font-sans text-slate-700">{item.quantity}</td>
                        <td className="py-3 pr-4 text-right font-sans text-slate-700">{fmt(item.unitPrice, currency)}</td>
                        <td className="py-3 text-right font-sans font-medium text-slate-900">{fmt(item.amount, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* TOTALS */}
          <div className="border-t border-slate-100 px-8 py-6 sm:px-10 print:px-0">
            <div className="ml-auto max-w-xs space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-sans">{fmt(invoice.subtotal ?? 0, currency)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax</span>
                <span className="font-sans">{fmt(invoice.tax ?? 0, currency)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                <span>Total</span>
                <span className="font-sans" style={{ color: PURPLE }}>{fmt(invoice.total ?? 0, currency)}</span>
              </div>
            </div>
          </div>

          {/* NOTES */}
          {invoice.notes && (
            <div className="border-t border-slate-100 px-8 py-6 sm:px-10 print:px-0">
              <p className="mb-2 text-[10px] font-sans uppercase tracking-[0.2em] text-slate-400">Notes</p>
              <p className="whitespace-pre-wrap text-sm text-slate-600">{invoice.notes}</p>
            </div>
          )}

          {/* FOOTER */}
          <div className="border-t border-slate-100 px-8 py-5 sm:px-10 print:hidden">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] font-sans text-slate-300">
                Created {fmtDate(invoice.createdAt)} · Updated {fmtDate(invoice.updatedAt)}
              </p>
              <p className="text-[10px] font-sans text-slate-300">ID: {invoice.id}</p>
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

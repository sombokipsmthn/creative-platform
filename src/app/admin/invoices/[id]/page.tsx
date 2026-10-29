'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { BUILT_IN_SERVICE_OPTIONS } from '@/lib/production-service-options';

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
  category?: string;
};

type InvoiceCatalogOption = {
  id: string;
  name: string;
  category: string;
  subcategory?: string | null;
  brand?: string | null;
  specs?: string | null;
  rate: number;
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

const PRIMARY = 'hsl(var(--primary))';

const INVOICE_CATEGORIES = [
  'Equipment', 'Camera', 'Audio', 'Lighting', 'Grip',
  'Crew', 'Production', 'Post Production', 'Transport', 'Other',
];

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
  const [catalog, setCatalog] = useState<InvoiceCatalogOption[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [editingItems, setEditingItems] = useState(false);
  const [draftItems, setDraftItems] = useState<InvoiceItem[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [itemsSaving, setItemsSaving] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    async function loadCatalog() {
      try {
        setCatalogLoading(true);
        const [equipmentResponse, servicesResponse] = await Promise.all([
          fetch('/api/equipment', { cache: 'no-store' }),
          fetch('/api/services', { cache: 'no-store' }),
        ]);
        const equipmentData = await equipmentResponse.json().catch(() => null);
        const servicesData = await servicesResponse.json().catch(() => null);
        const equipmentRows = Array.isArray(equipmentData)
          ? equipmentData
          : Array.isArray(equipmentData?.equipment) ? equipmentData.equipment : [];
        const serviceRows = Array.isArray(servicesData)
          ? servicesData
          : Array.isArray(servicesData?.services) ? servicesData.services : [];
        const equipmentOptions: InvoiceCatalogOption[] = equipmentRows
          .filter((item: any) => item && typeof item.id === 'string' && typeof item.name === 'string')
          .map((item: any) => ({
            id: `equipment-${item.id}`,
            name: item.name,
            category: String(item.category || 'Equipment'),
            subcategory: item.subcategory || null,
            brand: item.brand || null,
            specs: item.specs || null,
            rate: Math.max(0, Number(item.dailyRate) || 0),
          }));
        const savedServices: InvoiceCatalogOption[] = serviceRows
          .filter((item: any) => item && typeof item.id === 'string' && typeof (item.name || item.label) === 'string')
          .map((item: any) => ({
            id: `service-${item.id}`,
            name: String(item.name || item.label),
            category: String(item.category || 'Other'),
            subcategory: item.description || null,
            rate: Math.max(0, Number(item.defaultRate ?? item.rate) || 0),
          }));
        const builtInServices: InvoiceCatalogOption[] = BUILT_IN_SERVICE_OPTIONS.map((item, index) => ({
          id: `suggested-${item.category.toLowerCase().replace(/\s+/g, '-')}-${index}`,
          name: item.label,
          category: item.category,
          subcategory: item.category,
          rate: 0,
        }));
        if (!cancelled) setCatalog([...equipmentOptions, ...savedServices, ...builtInServices]);
      } catch (err) {
        console.error('Failed to load invoice item suggestions:', err);
        if (!cancelled) setCatalog([]);
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    }
    void loadCatalog();
    return () => { cancelled = true; };
  }, []);

  function beginEditingItems() {
    setDraftItems((invoice?.items || []).map((item) => ({ ...item, unitPrice: Math.max(0, Number(item.amount) || 0) / Math.max(1, Number(item.quantity) || 1), category: item.category || 'Equipment' })));
    setEditingItems(true);
    setError('');
    setSuccess('');
  }

  function updateDraftItem(itemId: string, field: keyof InvoiceItem, value: string | number) {
    setDraftItems((current) => current.map((item) => {
      if (item.id !== itemId) return item;
      const next = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        next.amount = Math.max(1, Number(next.quantity) || 1) * Math.max(0, Number(next.unitPrice) || 0);
      }
      return next;
    }));
  }

  function addDraftItem() {
    const id = `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setDraftItems((current) => [...current, { id, description: '', quantity: 1, unitPrice: 0, amount: 0, category: 'Equipment' }]);
    setOpenItemId(id);
    setItemSearch('');
  }

  function addCustomDraftItem() {
    const id = `new-custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setDraftItems((current) => [...current, { id, description: '', quantity: 1, unitPrice: 0, amount: 0, category: 'Other' }]);
    setOpenItemId(id);
    setItemSearch('');
  }

  function selectInvoiceCatalogItem(itemId: string, option: InvoiceCatalogOption) {
    setDraftItems((current) => current.map((item) => item.id === itemId
      ? { ...item, description: option.name, unitPrice: option.rate, amount: Math.max(1, Number(item.quantity) || 1) * option.rate }
      : item));
    setOpenItemId(null);
    setItemSearch('');
  }

  function categoryForSuggestion(category: string) {
    const value = category.trim().toLowerCase().replace(/[_-]+/g, ' ');
    if (['professional', 'professional fees', 'crew'].includes(value)) return 'Crew';
    if (['logistics', 'travel', 'travel logistics', 'transport'].includes(value)) return 'Transport';
    if (['editing', 'postproduction', 'post production'].includes(value)) return 'Post Production';
    if (['camera', 'cameras'].includes(value)) return 'Camera';
    if (['audio', 'sound'].includes(value)) return 'Audio';
    if (value === 'lighting') return 'Lighting';
    if (['grip', 'motion'].includes(value)) return 'Grip';
    return category;
  }

  function invoiceCategoryMatches(option: InvoiceCatalogOption, category: string) {
    const wanted = category.toLowerCase();
    const values = [option.category, option.subcategory, option.name, option.brand, option.specs]
      .filter(Boolean).map((value) => String(value).toLowerCase());
    if (wanted === 'equipment') return !['crew', 'production', 'post production', 'transport', 'other'].includes(categoryForSuggestion(option.category).toLowerCase());
    if (['crew', 'production', 'post production', 'transport', 'other'].includes(wanted)) {
      return categoryForSuggestion(option.category).toLowerCase() === wanted;
    }
    if (wanted === 'camera') return values.some((value) => value.includes('camera'));
    if (wanted === 'audio') return values.some((value) => value.includes('audio') || value.includes('sound') || value.includes('microphone'));
    if (wanted === 'lighting') return values.some((value) => value.includes('light') || value.includes('led'));
    if (wanted === 'grip') return values.some((value) => value.includes('grip') || value.includes('tripod') || value.includes('gimbal') || value.includes('dolly') || value.includes('stand'));
    return values.some((value) => value.includes(wanted));
  }

  async function saveInvoiceItems() {
    if (!invoice) return;
    if (draftItems.length === 0) {
      setError('Add at least one invoice item before saving.');
      return;
    }
    if (draftItems.some((item) => !item.description.trim())) {
      setError('Every invoice item needs a description. Use the custom description option if needed.');
      return;
    }
    try {
      setItemsSaving(true);
      setError('');
      setSuccess('');
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: draftItems.map((item) => ({
            description: item.description.trim(),
            quantity: Math.max(1, Number(item.quantity) || 1),
            unitPrice: Math.max(0, Number(item.unitPrice) || 0),
          })),
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Unable to save invoice items.');
      setInvoice(data);
      setDraftItems([]);
      setEditingItems(false);
      setOpenItemId(null);
      setSuccess('Invoice line items saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save invoice items.');
    } finally {
      setItemsSaving(false);
    }
  }

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
            style={{ borderTopColor: PRIMARY }}
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
          <Link href="/admin/invoices" className="text-xs font-sans uppercase tracking-widest text-primary">
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
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-primary hover:bg-primary/10 hover:text-primary"
              aria-label="Back to invoices"
            >
              ←
            </Link>
            <div>
              <p className="text-[10px] font-sans uppercase tracking-widest text-primary">Invoice</p>
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
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-sans uppercase tracking-widest text-slate-600 transition hover:border-primary hover:bg-primary/10 hover:text-primary"
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

      {paymentSummary && <div className="mx-auto mb-6 max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">Payment ledger</p><p className="text-xs text-slate-500">Confirmed: {fmt(paymentSummary.confirmedAmount, currency)} · Outstanding: {fmt(paymentSummary.outstanding, currency)}</p></div><button type="button" onClick={() => setPaymentOpen((value) => !value)} className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white">Record payment</button></div>{paymentOpen && <form onSubmit={recordPayment} className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2"><input type="hidden" name="invoiceId" value={invoice.id} /><input type="hidden" name="currency" value={currency} /><label className="grid gap-1 text-xs"><span>Amount in minor units</span><input name="amount" type="number" min="1" defaultValue={paymentSummary.outstanding} required className="rounded-xl border border-slate-200 px-3 py-2" /></label><label className="grid gap-1 text-xs"><span>Method</span><select name="method" defaultValue="bank_transfer" className="rounded-xl border border-slate-200 px-3 py-2"><option value="mpesa">M-Pesa</option><option value="bank_transfer">Bank transfer</option><option value="cash">Cash</option><option value="card">Card</option><option value="cheque">Cheque</option><option value="other">Other</option></select></label><label className="grid gap-1 text-xs"><span>Paid date</span><input name="paidAt" type="date" required className="rounded-xl border border-slate-200 px-3 py-2" /></label><label className="grid gap-1 text-xs"><span>Verification</span><select name="status" defaultValue="pending_verification" className="rounded-xl border border-slate-200 px-3 py-2"><option value="pending_verification">Pending verification</option><option value="confirmed">Confirmed received</option></select></label><label className="grid gap-1 text-xs sm:col-span-2"><span>Transaction reference</span><input name="transactionReference" className="rounded-xl border border-slate-200 px-3 py-2" /></label><div className="flex gap-2 sm:col-span-2"><button type="submit" disabled={paymentSaving} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white">{paymentSaving ? 'Saving…' : 'Save payment'}</button><button type="button" onClick={() => setPaymentOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs uppercase tracking-widest">Cancel</button></div></form>}</div>}

      <div className="mx-auto mb-6 grid max-w-5xl gap-6 lg:grid-cols-2 print:hidden"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-semibold text-slate-900">Payment schedule</h2>{schedules.length ? <div className="mt-3 space-y-2">{schedules.map(schedule => <div key={schedule.id} className="flex justify-between border-b border-slate-100 pb-2 text-xs"><span>{schedule.label}<br /><span className="text-slate-400">Due {fmtDate(schedule.dueDate)}</span></span><span className="font-medium">{fmt(schedule.amount, schedule.currency)}</span></div>)}</div> : <p className="mt-3 text-xs text-slate-500">No scheduled instalments recorded.</p>}<ScheduleForm invoiceId={invoice.id} currency={currency} /></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-semibold text-slate-900">Payment terms history</h2>{amendments.length ? <div className="mt-3 space-y-3">{amendments.map(item => <div key={item.id} className="border-b border-slate-100 pb-2 text-xs"><p className="font-medium">{item.newTerms}</p><p className="text-slate-400">Agreed {fmtDate(item.agreementDate)}</p></div>)}</div> : <p className="mt-3 text-xs text-slate-500">No term amendments recorded.</p>}<TermForm invoiceId={invoice.id} /></section></div><section className="mx-auto mb-6 max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden"><h2 className="text-sm font-semibold text-slate-900">Payment audit history</h2>{auditItems.length ? <div className="mt-3 space-y-2">{auditItems.map(item => <div key={`${item.audit.createdAt}-${item.payment.id}`} className="flex justify-between border-b border-slate-100 pb-2 text-xs"><span>{item.audit.eventType} · {item.payment.reference}</span><span className="text-slate-400">{fmtDate(item.audit.createdAt)}</span></div>)}</div> : <p className="mt-3 text-xs text-slate-500">No audit events recorded.</p>}</section>

      {/* INVOICE DOCUMENT */}
      <div className="mx-auto max-w-5xl print:max-w-none">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">

          {/* HEADER */}
          <div className="border-b border-slate-100 px-8 py-8 sm:px-10 print:px-0 print:py-0 print:pb-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 h-1 w-10 print:hidden" style={{ backgroundColor: PRIMARY }} />
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
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-slate-400">Line Items</p>
                <p className="mt-1 text-xs text-slate-500">Edit descriptions, specifications or dimensions, quantities and prices.</p>
              </div>
              {!editingItems ? (
                <button type="button" onClick={beginEditingItems} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-700 print:hidden">Edit items</button>
              ) : (
                <div className="flex flex-wrap gap-2 print:hidden">
                  <button type="button" onClick={addDraftItem} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-widest text-slate-700">+ Catalogue item</button>
                  <button type="button" onClick={addCustomDraftItem} className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-primary">+ Custom item</button>
                  <button type="button" onClick={() => { setEditingItems(false); setDraftItems([]); setOpenItemId(null); setError(''); }} className="rounded-xl border border-slate-200 px-3 py-2 text-xs uppercase tracking-widest text-slate-500">Cancel</button>
                  <button type="button" onClick={() => void saveInvoiceItems()} disabled={itemsSaving} className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white disabled:opacity-50">{itemsSaving ? 'Saving…' : 'Save items'}</button>
                </div>
              )}
            </div>
            {editingItems ? (
              <div className="space-y-4 print:hidden">
                {draftItems.map((item) => {
                  const query = itemSearch.trim().toLowerCase();
                  const suggestions = catalog.filter((option) => invoiceCategoryMatches(option, item.category || 'Equipment'))
                    .filter((option) => !query || [option.name, option.category, option.subcategory, option.brand, option.specs].filter(Boolean).some((value) => String(value).toLowerCase().includes(query)))
                    .slice(0, 60);
                  return (
                    <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_100px_140px_40px] md:items-start">
                        <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          Category
                          <select value={item.category || 'Equipment'} onChange={(event) => updateDraftItem(item.id, 'category', event.target.value)} className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-normal normal-case tracking-normal text-slate-800">
                            {INVOICE_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                          </select>
                        </label>
                        <div className="relative grid gap-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          Description / specifications
                          <input value={item.description || ''} onChange={(event) => updateDraftItem(item.id, 'description', event.target.value)} onFocus={() => { setOpenItemId(item.id); setItemSearch(''); }} placeholder="Edit description, dimensions or specifications" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-slate-800" />
                          {openItemId === item.id && (
                            <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[280px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                              <input value={itemSearch} onChange={(event) => setItemSearch(event.target.value)} placeholder={`Search ${item.category || 'items'}...`} className="mb-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-normal normal-case tracking-normal text-slate-800" />
                              {itemSearch.trim() && <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { updateDraftItem(item.id, 'description', itemSearch.trim()); setOpenItemId(null); setItemSearch(''); }} className="mb-2 w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-left text-xs font-medium normal-case tracking-normal text-slate-800">Use custom description: {itemSearch.trim()}</button>}
                              <div className="max-h-56 overflow-y-auto">
                                {catalogLoading && <p className="px-3 py-4 text-xs font-normal normal-case tracking-normal text-slate-400">Loading catalogue…</p>}
                                {!catalogLoading && suggestions.map((option) => <button key={option.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => selectInvoiceCatalogItem(item.id, option)} className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50"><span className="min-w-0"><span className="block truncate text-xs font-medium normal-case tracking-normal text-slate-800">{option.name}</span><span className="block text-[10px] font-normal normal-case tracking-normal text-slate-400">{option.category}{option.subcategory ? ` · ${option.subcategory}` : ''}</span></span><span className="shrink-0 text-xs font-normal normal-case tracking-normal text-slate-600">{fmt(option.rate, currency)}</span></button>)}
                                {!catalogLoading && suggestions.length === 0 && <p className="px-3 py-4 text-center text-xs font-normal normal-case tracking-normal text-slate-400">No matches. Use custom description above.</p>}
                              </div>
                            </div>
                          )}
                        </div>
                        <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Qty<input type="number" min="1" value={item.quantity ?? 1} onChange={(event) => updateDraftItem(item.id, 'quantity', Math.max(1, Number(event.target.value) || 1))} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-slate-800" /></label>
                        <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Unit price<input type="number" min="0" value={item.unitPrice ?? 0} onChange={(event) => updateDraftItem(item.id, 'unitPrice', Math.max(0, Number(event.target.value) || 0))} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-slate-800" /></label>
                        <button type="button" onClick={() => setDraftItems((current) => current.filter((candidate) => candidate.id !== item.id))} aria-label="Remove invoice item" className="mt-5 rounded-lg px-2 py-2 text-lg text-slate-400 hover:bg-red-50 hover:text-red-600">×</button>
                      </div>
                      <p className="mt-3 text-right text-xs text-slate-500">Line total: <span className="font-semibold text-slate-800">{fmt(Math.max(1, Number(item.quantity) || 1) * Math.max(0, Number(item.unitPrice) || 0), currency)}</span></p>
                    </div>
                  );
                })}
                {draftItems.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">No items yet. Add a catalogue item or a custom line.</p>}
              </div>
            ) : items.length === 0 ? (
              <p className="py-8 text-center italic text-sm text-slate-400">No line items on this invoice.</p>
            ) : (
              <AdminDataTable
                rows={items}
                getRowLabel={(item) => item.description || 'Invoice item'}
                className="rounded-xl border-slate-200 print:border-0"
                columns={[
                  { id: 'description', header: 'Description', cell: (item) => <span className="font-medium text-slate-900">{item.description || '—'}</span>, accessor: (item) => item.description },
                  { id: 'quantity', header: 'Qty', align: 'right', cell: (item) => item.quantity, accessor: (item) => item.quantity },
                  { id: 'unitPrice', header: 'Unit price', align: 'right', cell: (item) => fmt(item.unitPrice, currency), accessor: (item) => item.unitPrice, hideOnMobile: true },
                  { id: 'amount', header: 'Amount', align: 'right', cell: (item) => <span className="font-medium text-slate-900">{fmt(item.amount, currency)}</span>, accessor: (item) => item.amount },
                ]}
                mobileCard={(item) => <div className="flex items-start justify-between gap-4"><div><p className="font-medium text-slate-900">{item.description || '—'}</p><p className="mt-1 text-xs text-slate-500">Qty {item.quantity} · Unit {fmt(item.unitPrice, currency)}</p></div><span className="font-medium text-slate-900">{fmt(item.amount, currency)}</span></div>}
              />
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
                <span className="font-sans" style={{ color: PRIMARY }}>{fmt(invoice.total ?? 0, currency)}</span>
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

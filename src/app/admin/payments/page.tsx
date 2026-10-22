'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, CreditCard, Filter, Loader2, Plus, Search, Wallet, X } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/admin/StatusBadge';
import AdminDataTable from '@/components/admin/AdminDataTable';

type Client = { id: string; name: string; company?: string | null };
type Project = { id: string; name: string; clientId?: string | null };
type Invoice = { id: string; invoiceNumber: string; title: string; total: number; currency: string; clientId: string };
type PaymentRow = { payment: { id: string; amount: number; currency: string; method: string; status: string; paidAt: string; reference: string; transactionReference?: string | null }; invoice?: Invoice | null; client: Client };
type Row = PaymentRow & { id: string };
type Summary = { receivedThisMonth: Record<string, number>; outstandingByCurrency: Record<string, number>; awaitingPayment: number; paymentsRecorded: number; currencies: string[] };

const methods = [{ value: 'mpesa', label: 'M-Pesa' }, { value: 'bank_transfer', label: 'Bank transfer' }, { value: 'cash', label: 'Cash' }, { value: 'card', label: 'Card recorded externally' }, { value: 'cheque', label: 'Cheque' }, { value: 'other', label: 'Other' }];
const statuses = [{ value: 'confirmed', label: 'Received' }, { value: 'pending_verification', label: 'Pending verification' }, { value: 'failed', label: 'Failed' }, { value: 'refunded', label: 'Refunded' }, { value: 'reversed', label: 'Reversed' }];

function money(value: number, currency: string) { return `${currency} ${value.toLocaleString('en-KE')}`; }
function label(value: string) { return value.replaceAll('_', ' ').replace(/\b\w/g, (part) => part.toUpperCase()); }
function responseData<T>(value: unknown): T[] { if (Array.isArray(value)) return value as T[]; const record = value as { data?: T[]; items?: T[] } | null; return record?.data ?? record?.items ?? []; }
function paymentRows(value: unknown): Row[] { return responseData<PaymentRow>(value).map((row) => ({ ...row, id: row.payment.id })); }

export default function PaymentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ clientId: '', projectId: '', invoiceId: '', amount: '', currency: 'KES', paidAt: new Date().toISOString().slice(0, 10), method: 'mpesa', status: 'confirmed', transactionReference: '', notes: '' });
  const [filters, setFilters] = useState({ search: '', method: '', status: '', from: '', to: '' });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const query = new URLSearchParams({ ...filters, ...(filters.method ? { method: filters.method } : {}), ...(filters.status ? { status: filters.status } : {}) });
      Object.keys(filters).forEach((key) => { if (!filters[key as keyof typeof filters]) query.delete(key); });
      const [paymentsResponse, summaryResponse, clientsResponse, projectsResponse, invoicesResponse] = await Promise.all([
        fetch(`/api/payments?${query.toString()}`, { cache: 'no-store' }), fetch('/api/payments?view=summary', { cache: 'no-store' }), fetch('/api/clients', { cache: 'no-store' }), fetch('/api/projects', { cache: 'no-store' }), fetch('/api/invoices?limit=1000', { cache: 'no-store' }),
      ]);
      const responses = [paymentsResponse, summaryResponse, clientsResponse, projectsResponse, invoicesResponse];
      if (responses.some((response) => !response.ok)) throw new Error('Payment workspace data could not be loaded.');
      const [paymentData, summaryData, clientData, projectData, invoiceData] = await Promise.all(responses.map((response) => response.json()));
      setRows(paymentRows(paymentData)); setSummary(summaryData); setClients(responseData<Client>(clientData)); setProjects(responseData<Project>(projectData));
      const invoiceRows = responseData<{ invoice?: Invoice; client?: Client }>(invoiceData).map((item) => ('invoice' in item ? item.invoice : item)).filter((item): item is Invoice => Boolean(item && 'id' in item));
      setInvoices(invoiceRows);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Payment workspace data could not be loaded.'); } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { void load(); }, [load]);
  const clientInvoices = useMemo(() => invoices.filter((invoice) => invoice.clientId === form.clientId), [invoices, form.clientId]);
  const selectedInvoice = clientInvoices.find((invoice) => invoice.id === form.invoiceId);
  const currencies = summary?.currencies ?? ['KES'];

  function openForm() { setFormError(''); setFormOpen(true); }
  function updateForm(key: string, value: string) { setForm((current) => ({ ...current, [key]: value, ...(key === 'clientId' ? { invoiceId: '', projectId: '' } : {}), ...(key === 'invoiceId' && selectedInvoice ? { currency: selectedInvoice.currency } : {}) })); }
  async function paymentAction(id: string, action: 'verify' | 'refund' | 'reverse') {
    const reason = action === 'verify' ? undefined : window.prompt(`Reason for ${action}`);
    if (action !== 'verify' && !reason?.trim()) return;
    const response = await fetch(`/api/payments/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...(reason ? { reason } : {}) }) });
    if (!response.ok) { const data = await response.json().catch(() => null); setError(data?.error || `Payment could not be ${action}d.`); return; }
    await load();
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setFormError('');
    try { const response = await fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, amount: Math.round(Number(form.amount)) }) }); const data = await response.json().catch(() => null); if (!response.ok) throw new Error(data?.error || 'Payment could not be recorded.'); setFormOpen(false); await load(); }
    catch (cause) { setFormError(cause instanceof Error ? cause.message : 'Payment could not be recorded.'); } finally { setSaving(false); }
  }

  return <div className="ui-page"><div className="ui-shell">
    <AdminPageHeader title="Payments" description="Track incoming payments, monitor outstanding balances and keep every client transaction organized." breadcrumb={{ label: 'Dashboard', href: '/admin' }} primaryAction={<Button type="button" onClick={openForm}><Plus className="mr-2 h-4 w-4" />Record payment</Button>} />
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={<Wallet className="h-4 w-4" />} label="Received this month" values={currencies.map((currency) => money(summary?.receivedThisMonth?.[currency] ?? 0, currency))} />
      <Metric icon={<CreditCard className="h-4 w-4" />} label="Outstanding balance" values={currencies.map((currency) => money(summary?.outstandingByCurrency?.[currency] ?? 0, currency))} />
      <Metric icon={<CalendarDays className="h-4 w-4" />} label="Awaiting payment" values={[`${summary?.awaitingPayment ?? 0} invoice${summary?.awaitingPayment === 1 ? '' : 's'}`]} />
      <Metric icon={<CheckCircle2 className="h-4 w-4" />} label="Payments recorded" values={[`${summary?.paymentsRecorded ?? 0} this month`]} />
    </div>
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search client, invoice or transaction reference" className="pl-10" /></div>
      <select aria-label="Payment method" value={filters.method} onChange={(event) => setFilters({ ...filters, method: event.target.value })} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">All methods</option>{methods.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
      <select aria-label="Payment status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">All statuses</option>{statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
      <Input aria-label="Payments from date" type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} className="w-auto" /><Input aria-label="Payments to date" type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} className="w-auto" /><Filter className="hidden h-4 w-4 text-muted-foreground lg:block" />
    </div>
    <Card><CardContent className="p-0">{loading ? <div className="grid gap-3 p-6"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div> : error ? <div className="p-10 text-center"><p className="font-medium">Payments unavailable</p><p className="mt-1 text-sm text-muted-foreground">{error}</p><Button variant="secondary" className="mt-4" onClick={() => void load()}>Retry</Button></div> : rows.length === 0 ? <div className="p-12 text-center"><Wallet className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-4 text-lg font-semibold">Start tracking payments</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Record payments received through M-Pesa, bank transfer, cash or another channel. The ledger keeps confirmed receipts separate from payments awaiting verification.</p><Button className="mt-5" onClick={openForm}><Plus className="mr-2 h-4 w-4" />Record payment</Button></div>  : <AdminDataTable<Row>
          rows={rows}
          getRowLabel={({ payment }) => payment.reference}
          columns={[
            { id: 'date', header: 'Date', cell: ({ payment }) => new Date(payment.paidAt).toLocaleDateString('en-KE'), accessor: ({ payment }) => payment.paidAt },
            { id: 'client', header: 'Client', cell: ({ client }) => client.company || client.name, accessor: ({ client }) => client.company || client.name },
            { id: 'invoice', header: 'Invoice', cell: ({ invoice }) => invoice ? invoice.invoiceNumber : <span className="text-muted-foreground">Standalone</span> },
            { id: 'method', header: 'Method', cell: ({ payment }) => label(payment.method), accessor: ({ payment }) => payment.method },
            { id: 'reference', header: 'Reference', cell: ({ payment }) => payment.transactionReference || payment.reference, hideOnMobile: true },
            { id: 'amount', header: 'Amount', align: 'right', cell: ({ payment }) => money(payment.amount, payment.currency), accessor: ({ payment }) => payment.amount },
            { id: 'status', header: 'Status', cell: ({ payment }) => <StatusBadge status={payment.status} /> },
          ]}
          rowActions={[
            { label: 'Verify', hidden: ({ payment }) => payment.status !== 'pending_verification', onSelect: ({ payment }) => void paymentAction(payment.id, 'verify') },
            { label: 'Refund', hidden: ({ payment }) => payment.status !== 'confirmed', onSelect: ({ payment }) => void paymentAction(payment.id, 'refund') },
            { label: 'Reverse', hidden: ({ payment }) => payment.status !== 'confirmed', onSelect: ({ payment }) => void paymentAction(payment.id, 'reverse') },
          ]}
        />}</CardContent></Card>
    {formOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="record-payment-title"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-background p-6 shadow-xl"><div className="flex items-start justify-between"><div><h2 id="record-payment-title" className="text-xl font-semibold">Record payment</h2><p className="mt-1 text-sm text-muted-foreground">Manual tracking only. No transaction is initiated.</p></div><Button variant="ghost" size="icon" onClick={() => setFormOpen(false)} aria-label="Close"><X className="h-4 w-4" /></Button></div><form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
      <Field label="Client" required><select required value={form.clientId} onChange={(event) => updateForm('clientId', event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Select client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.company ? `${client.company} · ${client.name}` : client.name}</option>)}</select></Field>
      <Field label="Amount received" required><Input required min="1" step="1" type="number" value={form.amount} onChange={(event) => updateForm('amount', event.target.value)} placeholder="Amount in minor units" /></Field>
      <Field label="Currency" required><select required value={form.currency} onChange={(event) => updateForm('currency', event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="KES">KES</option>{currencies.filter((currency) => currency !== 'KES').map((currency) => <option key={currency} value={currency}>{currency}</option>)}</select></Field>
      <Field label="Payment date" required><Input required type="date" value={form.paidAt} onChange={(event) => updateForm('paidAt', event.target.value)} /></Field>
      <Field label="Payment method" required><select required value={form.method} onChange={(event) => updateForm('method', event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">{methods.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
      <Field label="Status" required><select required value={form.status} onChange={(event) => updateForm('status', event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="confirmed">Received</option><option value="pending_verification">Pending verification</option></select></Field>
      <Field label="Related invoice"><select value={form.invoiceId} onChange={(event) => updateForm('invoiceId', event.target.value)} disabled={!form.clientId} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Standalone payment</option>{clientInvoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoiceNumber} · {money(invoice.total, invoice.currency)}</option>)}</select>{selectedInvoice && <span className="mt-1 block text-xs text-muted-foreground">Invoice total {money(selectedInvoice.total, selectedInvoice.currency)}. Confirmed balance is validated on the server.</span>}</Field>
      <Field label="Related project"><select value={form.projectId} onChange={(event) => updateForm('projectId', event.target.value)} disabled={!form.clientId} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">No project</option>{projects.filter((project) => !project.clientId || project.clientId === form.clientId).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></Field>
      <Field label="Transaction reference"><Input value={form.transactionReference} onChange={(event) => updateForm('transactionReference', event.target.value)} placeholder="M-Pesa code or bank reference" /></Field><Field label="Notes"><Input value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} placeholder="Optional context" /></Field>
      {formError && <p className="sm:col-span-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{formError}</p>}<div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{saving ? 'Saving…' : 'Save payment'}</Button></div>
    </form></div></div>}
  </div></div>;
}
function Field({ label: fieldLabel, required, children }: { label: string; required?: boolean; children: React.ReactNode }) { return <label className="grid gap-1.5 text-sm"><span className="font-medium">{fieldLabel}{required && <span className="text-destructive"> *</span>}</span>{children}</label>; }
function Metric({ icon, label: metricLabel, values }: { icon: React.ReactNode; label: string; values: string[] }) { return <Card><CardContent className="p-5"><div className="flex items-center gap-2 text-muted-foreground"><span className="rounded-lg bg-muted p-2">{icon}</span><span className="text-xs font-medium uppercase tracking-wider">{metricLabel}</span></div><div className="mt-4 space-y-1">{values.map((value) => <p key={value} className="text-xl font-semibold tabular-nums">{value}</p>)}</div></CardContent></Card>; }

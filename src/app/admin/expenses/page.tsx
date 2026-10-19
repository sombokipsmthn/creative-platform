'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, ReceiptText, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StandardCreationDialog } from '@/components/admin/StandardCreationDialog';
import EmptyState from '@/components/admin/EmptyState';

type Expense = { id: string; description: string; supplier: string | null; category: string; amount: number; currency: string; expenseDate: string; paymentMethod: string | null; taxAmount: number; notes: string | null; project?: { id: string; name: string } | null };
type Form = { description: string; category: string; amount: string; expenseDate: string; supplier: string; paymentMethod: string; taxAmount: string; notes: string };
const initialForm: Form = { description: '', category: '', amount: '', expenseDate: new Date().toISOString().slice(0, 10), supplier: '', paymentMethod: '', taxAmount: '0', notes: '' };

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState<Form>(initialForm);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError('');
      const response = await fetch('/api/expenses', { cache: 'no-store' });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Unable to load expenses.');
      setExpenses(Array.isArray(data) ? data : []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to load expenses.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const total = useMemo(() => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0), [expenses]);
  const taxTotal = useMemo(() => expenses.reduce((sum, item) => sum + Number(item.taxAmount || 0), 0), [expenses]);

  function startCreate() { setForm({ ...initialForm, expenseDate: new Date().toISOString().slice(0, 10) }); setError(''); setOpen(true); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true); setError('');
      const response = await fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, amount: Number(form.amount), taxAmount: Number(form.taxAmount || 0) }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Unable to record expense.');
      setExpenses((current) => [data, ...current]); setOpen(false); setForm(initialForm);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to record expense.'); }
    finally { setSaving(false); }
  }

  return <div className="ui-page ui-page-padded"><div className="ui-shell">
    <AdminPageHeader title="Expenses" description="Record production costs and retain a tenant-scoped expense history." breadcrumb={{ label: 'Dashboard', href: '/admin' }} primaryAction={<Button type="button" onClick={startCreate}><Plus aria-hidden="true" />Record expense</Button>} />
    {error && !open && <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300" role="alert">{error}</div>}
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2"><div className="ui-stat-card"><p className="ui-stat-label">Recorded expenses</p><p className="ui-stat-value">{expenses.length}</p></div><div className="ui-stat-card"><p className="ui-stat-label">Total recorded</p><p className="ui-stat-value">KES {total.toLocaleString('en-KE')}</p><p className="ui-meta">Tax recorded: KES {taxTotal.toLocaleString('en-KE')}</p></div></div>
    <section className="ui-card space-y-5"><div className="flex items-center justify-between"><div><h2 className="ui-section-title">Expense history</h2><p className="ui-meta">Records are private to your creator workspace.</p></div><Button type="button" variant="outline" size="sm" onClick={() => void load(true)} disabled={refreshing}><RefreshCw aria-hidden="true" className={refreshing ? 'animate-spin' : ''} />Refresh</Button></div>
      {loading ? <div className="admin-empty-state" role="status"><Loader2 aria-hidden="true" className="animate-spin" /><p>Loading expenses…</p></div> : expenses.length === 0 ? <EmptyState icon={<ReceiptText />} title="No expenses recorded" description="Record the first production expense with its amount, date, and category." action={<Button type="button" onClick={startCreate}>Record first expense</Button>} /> : <div className="divide-y divide-border">{expenses.map((item) => <div key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{item.description}</p><p className="text-sm text-muted-foreground">{item.category}{item.supplier ? ` · ${item.supplier}` : ''} · {new Date(item.expenseDate).toLocaleDateString('en-KE')}</p></div><p className="font-semibold">{item.currency} {Number(item.amount).toLocaleString('en-KE')}</p></div>)}</div>}
    </section>
    <StandardCreationDialog open={open} onOpenChange={(next) => { if (!saving) setOpen(next); }} title="Record expense" description="Capture the minimum information needed for a private expense record.">
      <div className="space-y-1 pr-8"><p className="ui-eyebrow">EXPENSES</p><h2 className="ui-section-title">Record expense</h2><p className="text-sm text-muted-foreground">Required fields are marked. Tax values are recorded as entered and do not create a tax claim automatically.</p></div>
      {error && <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300" role="alert">{error}</div>}
      <form onSubmit={submit} className="mt-6 space-y-5"><div className="space-y-2"><label htmlFor="expense-description" className="ui-label">Description <span aria-hidden="true" className="text-red-600">*</span></label><Input id="expense-description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Location transport" /></div><div className="grid grid-cols-1 gap-5 sm:grid-cols-2"><div className="space-y-2"><label htmlFor="expense-category" className="ui-label">Category <span aria-hidden="true" className="text-red-600">*</span></label><Input id="expense-category" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Travel" /></div><div className="space-y-2"><label htmlFor="expense-amount" className="ui-label">Amount (KES) <span aria-hidden="true" className="text-red-600">*</span></label><Input id="expense-amount" required min="1" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" /></div></div><div className="grid grid-cols-1 gap-5 sm:grid-cols-2"><div className="space-y-2"><label htmlFor="expense-date" className="ui-label">Expense date <span aria-hidden="true" className="text-red-600">*</span></label><Input id="expense-date" required type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} /></div><div className="space-y-2"><label htmlFor="expense-tax" className="ui-label">Tax amount (KES) <span className="font-normal text-muted-foreground">(optional)</span></label><Input id="expense-tax" min="0" type="number" value={form.taxAmount} onChange={(e) => setForm({ ...form, taxAmount: e.target.value })} /></div></div><div className="grid grid-cols-1 gap-5 sm:grid-cols-2"><div className="space-y-2"><label htmlFor="expense-supplier" className="ui-label">Supplier <span className="font-normal text-muted-foreground">(optional)</span></label><Input id="expense-supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div><div className="space-y-2"><label htmlFor="expense-payment" className="ui-label">Payment method <span className="font-normal text-muted-foreground">(optional)</span></label><Input id="expense-payment" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} placeholder="e.g. M-Pesa" /></div></div><div className="space-y-2"><label htmlFor="expense-notes" className="ui-label">Notes <span className="font-normal text-muted-foreground">(optional)</span></label><textarea id="expense-notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="ui-textarea" /></div><div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end"><Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Recording expense…' : 'Record expense'}</Button></div></form>
    </StandardCreationDialog>
  </div></div>;
}

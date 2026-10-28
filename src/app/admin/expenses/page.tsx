'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WarningCircle as AlertCircle, CircleNotch as Loader2, Plus, ArrowsClockwise as RefreshCw } from "@phosphor-icons/react";
import { AdminResourceToolbar, type AdminFilterConfig, type AdminToolbarAction } from '@/components/admin/AdminResourceToolbar';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import StatCards from '@/components/admin/StatCards';

type ExpenseRecord = {
  id: string;
  description: string;
  supplier: string | null;
  category: string;
  amount: number;
  currency: string;
  expenseDate: string;
  taxAmount: number;
  notes: string | null;
  project?: { id: string; name: string } | null;
};

type ExpenseView = ExpenseRecord & {
  merchant: string;
  merchantKraPin: string;
  date: string;
};

const CATEGORY_OPTIONS = [
  { label: 'Camera & Production Gear', value: 'GEAR' },
  { label: 'Production Travel & Transport', value: 'TRAVEL' },
  { label: 'Software & Cloud Subscriptions', value: 'SOFTWARE' },
  { label: 'Crew & Technical Assistant Fees', value: 'CREW' },
  { label: 'Studio & Venue Hire', value: 'VENUE' },
];
const DEFAULT_RECEIPT_PREVIEW = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80';
const PIN_NOTE_PREFIX = 'Merchant KRA PIN: ';

function categoryLabel(category: string) {
  return CATEGORY_OPTIONS.find((item) => item.value === category)?.label ?? category;
}

function formatMoney(amount: number, currency = 'KES') {
  return `${currency} ${amount.toLocaleString('en-KE')}`;
}

function fromApiRecord(record: ExpenseRecord): ExpenseView {
  const noteLines = (record.notes ?? '').split('\n');
  const pinNote = noteLines.find((line) => line.startsWith(PIN_NOTE_PREFIX));
  const remainingNotes = noteLines.filter((line) => !line.startsWith(PIN_NOTE_PREFIX)).join('\n').trim();
  const parsedDate = new Date(record.expenseDate);
  return {
    ...record,
    notes: remainingNotes || null,
    merchant: record.supplier || record.description,
    merchantKraPin: pinNote?.slice(PIN_NOTE_PREFIX.length) ?? '',
    date: Number.isNaN(parsedDate.getTime()) ? String(record.expenseDate).slice(0, 10) : parsedDate.toISOString().slice(0, 10),
    amount: Number(record.amount) || 0,
    taxAmount: Number(record.taxAmount) || 0,
  };
}

function toApiNotes(pin: string, notes: string) {
  return [pin.trim() ? `${PIN_NOTE_PREFIX}${pin.trim()}` : '', notes.trim()].filter(Boolean).join('\n') || null;
}

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseView[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [merchant, setMerchant] = useState('');
  const [merchantKraPin, setMerchantKraPin] = useState('');
  const [category, setCategory] = useState('GEAR');
  const [amountKes, setAmountKes] = useState('');
  const [vatAmountKes, setVatAmountKes] = useState('0');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadExpenses = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setLoadError('');
    try {
      const response = await fetch('/api/expenses', { cache: 'no-store' });
      const result = await response.json().catch(() => null) as ExpenseRecord[] | { error?: string } | null;
      if (!response.ok) {
        const error = result && !Array.isArray(result) ? result.error : undefined;
        throw new Error(error || 'Expenses could not be loaded.');
      }
      setExpenses(Array.isArray(result) ? result.map(fromApiRecord) : []);
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : 'Expenses could not be loaded.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  const fillSampleDetails = () => {
    setMerchant('Sony Kenya Official Store');
    setMerchantKraPin('P051778899K');
    setCategory('GEAR');
    setAmountKes('180000');
    setVatAmountKes('24800');
    setDate(new Date().toISOString().slice(0, 10));
    setNotes('Sample values prefilled for convenience. Review before recording.');
    setMessage('Sample receipt details filled in. No expense has been saved yet.');
  };

  const handleAddExpense = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(amountKes);
    const taxAmount = Number(vatAmountKes || 0);
    if (!merchant.trim() || !Number.isFinite(amount) || amount <= 0 || !Number.isFinite(taxAmount) || taxAmount < 0) {
      setMessage('Enter a merchant name, a positive amount, and a non-negative VAT amount.');
      return;
    }

    setSaving(true);
    setMessage('Saving expense…');
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: `${merchant.trim()} — ${categoryLabel(category)}`,
          supplier: merchant.trim(),
          category,
          amount: Math.round(amount),
          currency: 'KES',
          expenseDate: date,
          taxAmount: Math.round(taxAmount),
          notes: toApiNotes(merchantKraPin, notes),
        }),
      });
      const result = await response.json().catch(() => null) as unknown;
      if (!response.ok || !result || typeof result !== 'object' || !('id' in result)) {
        const error = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string'
          ? result.error
          : 'Expense could not be recorded.';
        throw new Error(error);
      }
      const savedExpense = result as ExpenseRecord;
      setExpenses((current) => [fromApiRecord(savedExpense), ...current.filter((expense) => expense.id !== savedExpense.id)]);
      setMerchant('');
      setMerchantKraPin('');
      setCategory('GEAR');
      setAmountKes('');
      setVatAmountKes('0');
      setDate(new Date().toISOString().slice(0, 10));
      setNotes('');
      setMessage('Expense recorded. It is saved to your account.');
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Expense could not be recorded.');
    } finally {
      setSaving(false);
    }
  };

  const filteredExpenses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return expenses.filter((expense) => {
      const matchesSearch = !normalizedSearch || [expense.merchant, expense.merchantKraPin, categoryLabel(expense.category), expense.date, expense.description, expense.notes ?? '']
        .join(' ').toLowerCase().includes(normalizedSearch);
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, categoryFilter]);

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalTaxAmount = expenses.reduce((sum, expense) => sum + expense.taxAmount, 0);
  const hasFilters = search.trim() !== '' || categoryFilter !== 'all';
  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
  };

  return (
    <div className="admin-data-page font-sans transition-colors duration-300">
      <div className="admin-data-page__content space-y-6">
        <AdminPageHeader
          title="Expenses & receipt claims"
          description="Record and review creator-owned expense entries. Receipt files and verification status are not part of the current expense record model."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          primaryAction={
            <Button type="button" variant="outline" onClick={fillSampleDetails} disabled={saving}>
              <Plus className="h-4 w-4" aria-hidden="true" />Fill sample details
            </Button>
          }
        />

        <section aria-label="Expense summary">
          <StatCards stats={[
            { label: 'Expenses recorded', value: String(expenses.length), detail: 'Creator-owned records', color: 'default' },
            { label: 'Expense total', value: formatMoney(totalAmount), detail: 'Across recorded expenses', color: 'accent' },
            { label: 'Tax recorded', value: formatMoney(totalTaxAmount), detail: 'Stored tax amount total', color: 'info' },
          ]} columns={3} />
        </section>

        <section className="overflow-hidden rounded-xl border bg-card shadow-sm" aria-labelledby="receipt-entry-title">
          <div className="border-b px-4 py-4 sm:px-6">
            <h2 id="receipt-entry-title" className="text-lg font-semibold tracking-tight">Record an expense</h2>
            <p className="mt-1 text-sm text-muted-foreground">The sample button only prefills fields. Save creates a persisted expense record. The merchant PIN is kept in its notes because the database has no dedicated PIN field.</p>
          </div>
          <div className="p-4 sm:p-6">
            <form onSubmit={handleAddExpense} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="grid min-w-0 gap-1.5 text-sm"><span className="font-medium">Merchant name <span className="text-destructive">*</span></span><Input required value={merchant} onChange={(event) => setMerchant(event.target.value)} placeholder="e.g. Sony Kenya" /></label>
              <label className="grid min-w-0 gap-1.5 text-sm"><span className="font-medium">Merchant KRA PIN</span><Input value={merchantKraPin} onChange={(event) => setMerchantKraPin(event.target.value)} placeholder="e.g. P051123456Z" /></label>
              <label className="grid min-w-0 gap-1.5 text-sm"><span className="font-medium">Category</span><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORY_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></label>
              <label className="grid min-w-0 gap-1.5 text-sm"><span className="font-medium">Total amount (KES) <span className="text-destructive">*</span></span><Input required min="1" type="number" value={amountKes} onChange={(event) => setAmountKes(event.target.value)} placeholder="e.g. 180000" /></label>
              <label className="grid min-w-0 gap-1.5 text-sm"><span className="font-medium">VAT / tax amount (KES)</span><Input min="0" type="number" value={vatAmountKes} onChange={(event) => setVatAmountKes(event.target.value)} placeholder="e.g. 24800" /></label>
              <label className="grid min-w-0 gap-1.5 text-sm"><span className="font-medium">Expense date</span><Input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
              <label className="grid min-w-0 gap-1.5 text-sm sm:col-span-2 lg:col-span-3"><span className="font-medium">Notes</span><Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional expense context" /></label>
              <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-3 sm:flex-row sm:items-center sm:justify-between">
                <p role="status" aria-live="polite" className="text-sm text-muted-foreground">{message || 'Receipt image upload is not supported by the current expense API.'}</p>
                <Button type="submit" className="w-full sm:w-auto" disabled={saving || loading}>{saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}{saving ? 'Saving…' : 'Save expense'}</Button>
              </div>
            </form>
          </div>
        </section>

        <AdminResourceToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search expenses by merchant, category, date…"
          filters={[{ id: 'category', label: 'Category', value: categoryFilter, options: [{ label: 'All categories', value: 'all' }, ...CATEGORY_OPTIONS] }] as AdminFilterConfig[]}
          onFilterChange={(id, value) => { if (id === 'category') setCategoryFilter(value ?? 'all'); }}
          onClearAll={clearFilters}
          secondaryActions={[{ label: 'Refresh', onClick: () => void loadExpenses(true), variant: 'ghost', size: 'icon', icon: <RefreshCw className="h-4 w-4" aria-hidden="true" /> } as AdminToolbarAction]}
          resultCount={expenses.length}
          filteredCount={filteredExpenses.length}
          resultLabel="Expenses"
          loading={loading || refreshing || saving}
        />

        {loadError && !loading && (
          <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <div className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" /><p className="text-sm text-destructive">{loadError}</p></div>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadExpenses()}>Retry</Button>
          </div>
        )}

        <section className="overflow-hidden rounded-xl border bg-card shadow-sm" aria-labelledby="expenses-list-title">
          <div className="flex flex-col gap-2 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0"><h2 id="expenses-list-title" className="text-lg font-semibold tracking-tight">Recorded expenses</h2><p className="mt-1 text-sm text-muted-foreground">{filteredExpenses.length} of {expenses.length} record{expenses.length === 1 ? '' : 's'}</p></div>
          </div>
          {loading ? (
            <div className="space-y-3 p-4 sm:p-6" role="status" aria-label="Loading expenses">{[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-lg bg-muted" />)}</div>
          ) : loadError && expenses.length === 0 ? (
            <div className="px-5 py-12 text-center"><p className="text-sm text-muted-foreground">Retry loading expenses to view this list.</p><Button type="button" variant="outline" className="mt-4" onClick={() => void loadExpenses()}>Retry</Button></div>
          ) : filteredExpenses.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <h3 className="text-base font-semibold">{expenses.length ? 'No matching expenses' : 'No expenses recorded yet'}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{expenses.length ? 'Try another search or clear the selected filters.' : 'Enter an expense above to create your first saved record.'}</p>
              {hasFilters && <Button type="button" variant="outline" className="mt-4" onClick={clearFilters}>Clear filters</Button>}
            </div>
          ) : (
            <ul className="divide-y">
              {filteredExpenses.map((expense) => (
                <li key={expense.id} className="flex min-w-0 flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground sm:h-16 sm:w-16" aria-hidden="true">No image</div>
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2"><StatusBadge status="Recorded" /><span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{categoryLabel(expense.category)}</span></div>
                      <h3 className="break-words text-sm font-medium sm:text-base">{expense.merchant}</h3>
                      <p className="break-words text-xs text-muted-foreground">{expense.merchantKraPin && <>Merchant KRA PIN: <span className="font-medium text-foreground">{expense.merchantKraPin}</span><span aria-hidden="true"> · </span></>}Date: {expense.date}</p>
                      {expense.notes && <p className="break-words text-xs text-muted-foreground">{expense.notes}</p>}
                    </div>
                  </div>
                  <div className="min-w-0 border-t pt-3 text-left sm:shrink-0 sm:border-0 sm:pt-0 sm:text-right">
                    <p className="break-words text-lg font-semibold tabular-nums">{formatMoney(expense.amount, expense.currency)}</p>
                    <p className="text-sm text-muted-foreground">Tax amount: {formatMoney(expense.taxAmount, expense.currency)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

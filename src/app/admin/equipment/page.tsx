'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, PackagePlus, Plus, RefreshCw, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StandardCreationDialog } from '@/components/admin/StandardCreationDialog';
import EmptyState from '@/components/admin/EmptyState';
import AdminDataTable, { type AdminColumn } from '@/components/admin/AdminDataTable';
import { AdminResourceToolbar, type AdminFilterConfig, type AdminToolbarAction } from '@/components/admin/AdminResourceToolbar';

type Equipment = {
  id: string;
  name: string;
  dailyRate: number;
  category: string;
  subcategory?: string | null;
  brand?: string | null;
  specs?: string | null;
};

type EquipmentForm = {
  name: string;
  category: string;
  dailyRate: string;
  subcategory: string;
  brand: string;
  specs: string;
};

const emptyForm: EquipmentForm = {
  name: '',
  category: '',
  dailyRate: '',
  subcategory: '',
  brand: '',
  specs: '',
};

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EquipmentForm>(emptyForm);
  const [error, setError] = useState('');

  const loadEquipment = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError('');
      const response = await fetch('/api/equipment', { cache: 'no-store' });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Unable to load equipment.');
      setEquipment(Array.isArray(data) ? data : data?.equipment || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load equipment.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadEquipment(); }, [loadEquipment]);

  const filteredEquipment = equipment.filter((item) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return [item.name, item.category, item.subcategory, item.brand, item.specs]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(needle);
  });

  function openCreate() {
    setForm(emptyForm);
    setError('');
    setOpen(true);
  }

  async function createEquipment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.category.trim()) {
      setError('Name and category are required.');
      return;
    }
    const dailyRate = Number(form.dailyRate);
    if (!Number.isFinite(dailyRate) || dailyRate < 0) {
      setError('Daily rate must be zero or greater.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, dailyRate }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Unable to create equipment.');
      setEquipment((current) => [data, ...current]);
      setOpen(false);
      setForm(emptyForm);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create equipment.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ui-page ui-page-padded">
      <div className="ui-shell">
        <AdminPageHeader
          title="Equipment"
          description="Manage equipment rates used by the quotation catalogue."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          /* Primary action removed - belongs in page header */
        />

        {error && !open && <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300" role="alert">{error}</div>}

        <section className="ui-card space-y-5" aria-labelledby="equipment-list-title">
          <AdminResourceToolbar
            search={query}
            onSearchChange={setQuery}
            searchPlaceholder="Search equipment, category, brand…"
            filters={[]}
            onFilterChange={() => {}}
            onClearAll={() => setQuery('')}
            secondaryActions={[
              {
                label: 'Refresh',
                onClick: () => void loadEquipment(true),
                variant: 'ghost',
                size: 'icon',
                icon: <RefreshCw aria-hidden="true" className={refreshing ? 'animate-spin h-4 w-4' : 'h-4 w-4'} />,
                disabled: refreshing,
              } as AdminToolbarAction,
            ]}
            resultCount={equipment.length}
            filteredCount={filteredEquipment.length}
            resultLabel="Equipment"
            loading={loading}
          />

          {loading ? (
            <div className="admin-empty-state" role="status" aria-live="polite"><Loader2 aria-hidden="true" className="animate-spin" /><p>Loading equipment…</p></div>
          ) : filteredEquipment.length === 0 ? (
            <EmptyState icon={<PackagePlus />} title={equipment.length === 0 ? 'No equipment yet' : 'No matching equipment'} description={equipment.length === 0 ? 'Add your first catalogue item so it can be selected in quote line items.' : 'Try a different search term.'} action={equipment.length === 0 ? <Button type="button" onClick={openCreate}>Add first equipment item</Button> : undefined} />
          ) : (
            <AdminDataTable
              rows={filteredEquipment}
              getRowLabel={(item) => item.name}
              columns={[
                { id: 'equipment', header: 'Equipment', cell: (item) => <div><p className="font-medium">{item.name}</p>{item.specs && <p className="mt-1 max-w-md text-xs text-muted-foreground">{item.specs}</p>}</div>, sortable: true, accessor: (item) => item.name },
                { id: 'category', header: 'Category', cell: (item) => <div>{item.category}{item.subcategory && <span className="block text-xs text-muted-foreground">{item.subcategory}</span>}</div>, sortable: true, accessor: (item) => item.category },
                { id: 'brand', header: 'Brand', accessor: (item) => item.brand || '—', hideOnMobile: true },
                { id: 'dailyRate', header: 'Daily rate', align: 'right', cell: (item) => `KES ${Number(item.dailyRate || 0).toLocaleString('en-KE')}`, accessor: (item) => item.dailyRate },
              ] as AdminColumn<Equipment>[]}
            />
          )}
        </section>

        <StandardCreationDialog open={open} onOpenChange={(nextOpen) => { if (!saving) setOpen(nextOpen); }} title="Add equipment" description="Add the minimum catalogue details used by quote builders.">
          <div className="space-y-1 pr-8"><p className="ui-eyebrow">QUOTATION CATALOGUE</p><h2 className="ui-section-title">Add equipment</h2><p className="text-sm text-muted-foreground">Required fields are marked. You can add specifications to help your team choose the right item later.</p></div>
          {error && <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300" role="alert">{error}</div>}
          <form onSubmit={createEquipment} className="mt-6 space-y-5">
            <div className="space-y-2"><label htmlFor="equipment-name" className="ui-label">Equipment name <span aria-hidden="true" className="text-red-600">*</span><span className="sr-only">required</span></label><Input id="equipment-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Sony FX3 Cinema Camera" /></div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2"><div className="space-y-2"><label htmlFor="equipment-category" className="ui-label">Category <span aria-hidden="true" className="text-red-600">*</span><span className="sr-only">required</span></label><Input id="equipment-category" required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="e.g. Cameras" /></div><div className="space-y-2"><label htmlFor="equipment-rate" className="ui-label">Daily rate (KES) <span aria-hidden="true" className="text-red-600">*</span><span className="sr-only">required</span></label><Input id="equipment-rate" required min="0" type="number" value={form.dailyRate} onChange={(event) => setForm({ ...form, dailyRate: event.target.value })} placeholder="0" /></div></div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2"><div className="space-y-2"><label htmlFor="equipment-brand" className="ui-label">Brand <span className="font-normal text-muted-foreground">(optional)</span></label><Input id="equipment-brand" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} placeholder="e.g. Sony" /></div><div className="space-y-2"><label htmlFor="equipment-subcategory" className="ui-label">Subcategory <span className="font-normal text-muted-foreground">(optional)</span></label><Input id="equipment-subcategory" value={form.subcategory} onChange={(event) => setForm({ ...form, subcategory: event.target.value })} placeholder="e.g. Full-frame cinema" /></div></div>
            <div className="space-y-2"><label htmlFor="equipment-specs" className="ui-label">Specifications <span className="font-normal text-muted-foreground">(optional)</span></label><textarea id="equipment-specs" rows={3} value={form.specs} onChange={(event) => setForm({ ...form, specs: event.target.value })} placeholder="Key details for quote selection" className="ui-textarea" /></div>
            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end"><Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Adding equipment…' : 'Add equipment'}</Button></div>
          </form>
        </StandardCreationDialog>
      </div>
    </div>
  );
}

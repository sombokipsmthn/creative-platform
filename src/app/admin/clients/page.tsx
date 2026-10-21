'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Mail, MapPin, Phone, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { AdminResourceToolbar, type AdminFilterConfig, type AdminToolbarAction } from '@/components/admin/AdminResourceToolbar';

type ClientStatus = 'active' | 'inactive' | 'archived';

type Client = {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  kraPin?: string | null;
  website?: string | null;
  notes?: string | null;
  status: ClientStatus | string;
  createdAt: string;
  updatedAt: string;
};

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  phoneCountry: '+254',
  company: '',
  kraPin: '',
  website: '',
  location: '',
  notes: '',
  status: 'active' as ClientStatus,
};

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function statusLabel(status: string) {
  return status.replace(/_/g, ' ');
}

function getInitials(client: Pick<Client, 'name' | 'company'>) {
  const value = client.company || client.name;
  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}


export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | ClientStatus>('ALL');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadClients = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError('');

      const response = await fetch('/api/clients', { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Failed to load clients');
      }

      const data = await response.json();

      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load clients:', err);
      setError('Unable to load clients. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesSearch =
        !query ||
        [client.name, client.company, client.email, client.phone, client.website]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        filterStatus === 'ALL' || client.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [clients, filterStatus, searchQuery]);

  const activeCount = clients.filter((client) => client.status === 'active').length;
  const inactiveCount = clients.filter((client) => client.status === 'inactive').length;
  const archivedCount = clients.filter((client) => client.status === 'archived').length;

  function openCreateModal() {
    // Prefill Kenyan country code for the phone field and default phone value
    setForm({ ...emptyForm, phoneCountry: '+254', phone: '+254 ' });
    setError('');
    setIsAddClientOpen(true);
  }

  function closeCreateModal() {
    if (!saving) {
      setIsAddClientOpen(false);
      setForm(emptyForm);
    }
  }

  function handlePhoneCountryChange(code: string) {
    setForm((prev) => {
      const current = prev.phone || '';
      // Remove any existing leading +<digits> and optional spacing/dashes
      const stripped = current.replace(/^\+?[\d\s-]*/, '').trim();
      const newPhone = code + (stripped ? ' ' + stripped : ' ');
      return { ...prev, phoneCountry: code, phone: newPhone };
    });
  }

  async function handleCreateClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('Client name is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create client');
      }

      setClients((current) => [data, ...current]);
      setIsAddClientOpen(false);
      setForm(emptyForm);
    } catch (err) {
      console.error('Failed to create client:', err);
      setError(err instanceof Error ? err.message : 'Failed to create client.');
    } finally {
      setSaving(false);
    }
  }

  async function updateClientStatus(status: ClientStatus) {
    if (!selectedClient) return;

    try {
      setUpdating(true);
      setError('');

      const response = await fetch(`/api/clients/${selectedClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update client');
      }

      setClients((current) =>
        current.map((client) => (client.id === data.id ? data : client))
      );
      setSelectedClient(data);
    } catch (err) {
      console.error('Failed to update client:', err);
      setError(err instanceof Error ? err.message : 'Failed to update client.');
    } finally {
      setUpdating(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Portal Link
  |--------------------------------------------------------------------------
  |
  | The current clients schema does not contain
  | gallery/token fields. Therefore the old
  | hard-coded gallery functionality is intentionally
  | not fabricated here.
  |
  */

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen px-4 py-8 font-sans transition-colors duration-300 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminPageHeader
          title="Client CRM"
          description="Database-backed client records and workflow status."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
        />

        {error && !isAddClientOpen && !selectedClient && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            ['Total Clients', clients.length, 'text-slate-500 dark:text-zinc-400'],
            ['Active', activeCount, 'text-emerald-600 dark:text-emerald-400'],
            ['Inactive', inactiveCount, 'text-amber-600 dark:text-amber-400'],
            ['Archived', archivedCount, 'text-slate-500 dark:text-zinc-400'],
          ].map(([label, count, color]) => (
            <div key={String(label)} className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm min-h-[6.5rem]">
              <p className={`text-sm font-medium text-muted-foreground ${color}`}>{label}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          ))}
        </div>

        {/* Admin Resource Toolbar */}
        <AdminResourceToolbar
          search={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search clients by name, company, email, phone…"
          filters={[
            {
              id: 'status',
              label: 'Status',
              value: filterStatus.toLowerCase(),
              options: [
                { label: 'All', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Archived', value: 'archived' },
              ],
            },
          ] as AdminFilterConfig[]}
          onFilterChange={(id, value) => {
            if (id === 'status') {
              setFilterStatus(value === 'all' ? 'ALL' : (value as ClientStatus));
            }
          }}
          onClearAll={() => {
            setSearchQuery('');
            setFilterStatus('ALL');
          }}
          secondaryActions={[
            {
              label: 'Refresh',
              onClick: () => void loadClients(true),
              variant: 'ghost',
              size: 'icon',
              icon: <RefreshCw className="h-4 w-4" />,
            } as AdminToolbarAction,
          ]}
          resultCount={clients.length}
          filteredCount={filteredClients.length}
          resultLabel="Clients"
          loading={loading}
        />

        <AdminDataTable
          rows={filteredClients}
          loading={loading}
          error={error && !isAddClientOpen && !selectedClient ? error : null}
          emptyTitle="No clients found"
          emptyDescription="Register your first client to begin managing relationships."
          emptyAction={<Button type="button" onClick={openCreateModal}>Register your first client</Button>}
          selectable
          getRowLabel={(client) => client.name}
          onRowClick={(client) => { setError(''); setSelectedClient(client); }}
          mobileCard={(client, actions) => <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-medium">{client.name}</p><p className="text-sm text-muted-foreground">{client.company || 'Independent client'}</p><p className="mt-2 text-xs text-muted-foreground">{client.email || client.phone || client.location || 'No contact details'}</p><div className="mt-2"><Badge variant={client.status === 'active' ? 'success' : client.status === 'archived' ? 'secondary' : 'warning'}>{statusLabel(client.status)}</Badge></div></div>{actions}</div>}
          columns={[
            { id: 'client', header: 'Client', cell: (client) => <div className="flex items-center gap-3"><span className="ui-avatar ui-avatar-sm">{getInitials(client)}</span><div><p className="font-medium">{client.name}</p><p className="text-xs text-muted-foreground">{client.company || 'Independent client'}</p></div></div>, accessor: (client) => client.name, sortable: true },
            { id: 'contact', header: 'Contact', cell: (client) => <div><p>{client.email || '—'}</p><p className="text-xs text-muted-foreground">{client.phone || client.location || ''}</p></div>, hideOnMobile: true },
            { id: 'status', header: 'Status', cell: (client) => <Badge variant={client.status === 'active' ? 'success' : client.status === 'archived' ? 'secondary' : 'warning'}>{statusLabel(client.status)}</Badge>, accessor: (client) => client.status },
            { id: 'created', header: 'Added', cell: (client) => formatDate(client.createdAt), accessor: (client) => client.createdAt, hideOnMobile: true },
          ]}
          rowActions={[{ label: 'View client', onSelect: (client) => { setError(''); setSelectedClient(client); } }]}
        />

        {isAddClientOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6 text-slate-900 dark:text-white">
            <div className="max-w-xl w-full p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
              <Button
                onClick={closeCreateModal}
                variant="ghost"
                size="icon"
                className="absolute top-6 right-6 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-50"
              >
                ✕
              </Button>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">CRM</p>
                <h2 className="text-2xl font-semibold tracking-tight">Register New Client</h2>
              </div>

              {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-700 dark:text-red-300">{error}</div>}

              <form onSubmit={handleCreateClient} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Contact Name *</label>
                  <Input required type="text" placeholder="e.g. Jane Wanjiku" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Email</label>
                    <Input type="email" placeholder="jane@company.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Phone</label>
                    <div className="flex items-center gap-2">
                      <Select value={form.phoneCountry} onValueChange={handlePhoneCountryChange}>
                        <SelectTrigger className="w-auto max-w-[9rem] shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+254">🇰🇪 +254 (Kenya)</SelectItem>
                          <SelectItem value="+1">🇺🇸 +1 (USA)</SelectItem>
                          <SelectItem value="+44">🇬🇧 +44 (UK)</SelectItem>
                          <SelectItem value="+27">🇿🇦 +27 (South Africa)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="text" placeholder="700 000 000" value={form.phone?.startsWith(form.phoneCountry || '') ? form.phone.slice((form.phoneCountry || '').length).trimStart() : form.phone} onChange={(event) => setForm({ ...form, phone: (form.phoneCountry || '') + ' ' + event.target.value })} className="min-w-0 flex-1" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium leading-none">Location</label>
                      <Input type="text" placeholder="e.g. Nairobi, Kenya" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Company / Organization</label>
                    <Input type="text" placeholder="e.g. Safaricom" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Website</label>
                    <Input 
                      type="url" 
                      placeholder="https://company.com" 
                      value={form.website} 
                      onChange={(event) => setForm({ ...form, website: event.target.value })} 
                      onFocus={() => {
                        if (!form.website || form.website.trim() === '') {
                          setForm({ ...form, website: 'https://' });
                        }
                      }}
                      onBlur={(e) => {
                        let val = e.target.value.trim();
                        if (val && !/^https?:\/\//i.test(val)) {
                          val = 'https://' + val;
                          setForm({ ...form, website: val });
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">KRA PIN</label>
                    <Input type="text" placeholder="e.g. A000000000Z" value={form.kraPin} onChange={(event) => setForm({ ...form, kraPin: event.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Status</label>
                    <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as ClientStatus })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Internal Notes</label>
                  <Textarea rows={3} placeholder="Project, billing, or relationship notes..." value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
                </div>

                <Button type="submit" disabled={saving} variant="primary" className="w-full">
                  {saving ? 'Saving Client…' : '+ Add Client to CRM'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {selectedClient && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6 text-slate-900 dark:text-white">
            <div className="max-w-xl w-full p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
              <Button
                onClick={() => setSelectedClient(null)}
                variant="ghost"
                size="icon"
                className="absolute top-6 right-6 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </Button>

              <div className="space-y-2 border-b border-slate-200 dark:border-zinc-800 pb-5">
                {selectedClient.company && <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-sans bg-primary/10 text-primary dark:text-primary rounded-full">{selectedClient.company}</span>}
                <h2 className="text-2xl font-light">{selectedClient.name}</h2>
                <p className="text-xs font-sans text-slate-600 dark:text-zinc-400 break-words">
                  {[selectedClient.email, selectedClient.phone, selectedClient.website].filter(Boolean).join(' • ') || 'No contact details'}
                </p>
                {selectedClient.kraPin && (
                  <p className="text-xs font-sans text-slate-500 dark:text-zinc-500 mt-1">
                    KRA PIN: {selectedClient.kraPin}
                  </p>
                )}

              </div>

              {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-700 dark:text-red-300">{error}</div>}

              <div className="p-6 bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-4">
                <div>
                  <p className="text-sm font-medium leading-none">Client Status</p>
                  <p className="text-sm text-muted-foreground">Changes are saved directly to the database.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['active', 'inactive', 'archived'] as ClientStatus[]).map((status) => (
                    <Button
                      key={status}
                      variant={selectedClient.status === status ? 'primary' : 'secondary'}
                      disabled={updating || selectedClient.status === status}
                      onClick={() => updateClientStatus(status)}
                      className="text-[10px] font-sans uppercase transition-all disabled:opacity-50"
                    >
                      {statusLabel(status)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium leading-none">Internal Notes</p>
                <p className="text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-wrap">{selectedClient.notes || 'No internal notes.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800 text-[10px] font-sans uppercase text-slate-400 dark:text-zinc-600">
                <div>Created {formatDate(selectedClient.createdAt)}</div>
                <div className="text-right">Updated {formatDate(selectedClient.updatedAt)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

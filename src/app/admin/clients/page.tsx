'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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

function statusClass(status: string) {
  if (status === 'active') {
    return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300';
  }

  if (status === 'archived') {
    return 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400';
  }

  return 'bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300';
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

  useEffect(() => {
    let cancelled = false;

    async function loadClients() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/clients', { cache: 'no-store' });

        if (!response.ok) {
          throw new Error('Failed to load clients');
        }

        const data = await response.json();

        if (!cancelled) {
          setClients(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load clients:', err);
        if (!cancelled) {
          setError('Unable to load clients. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadClients();

    return () => {
      cancelled = true;
    };
  }, []);

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
          <div>
            <Link href="/admin" className="text-xs font-sans text-purple-600 dark:text-purple-400 hover:underline">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white mt-1">Client CRM</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-500 font-sans mt-2">
              Database-backed client records and workflow status.
            </p>
          </div>

          <Button
            onClick={openCreateModal}
            variant="primary"
            className="text-xs font-sans uppercase tracking-widest"
          >
            + Register New Client
          </Button>
        </div>

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
            <div key={String(label)} className="ui-stat-card min-h-[6.5rem]">
              <p className={`ui-stat-label ${color}`}>{label}</p>
              <p className="ui-stat-value">{count}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-stretch gap-4 rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search clients by name, company, email, phone..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="ui-input w-full md:w-96"
          />

          <div className="flex flex-wrap gap-2 text-xs font-sans">
            {(
              [
                ['ALL', clients.length],
                ['active', activeCount],
                ['inactive', inactiveCount],
                ['archived', archivedCount],
              ] as const
            ).map(([status, count]) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'primary' : 'secondary'}
                onClick={() => setFilterStatus(status)}
                className="text-xs font-sans uppercase tracking-widest"
              >
                {status === 'ALL' ? 'All' : statusLabel(status)} ({count})
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950/40">
            <p className="text-xs font-sans text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Loading clients…</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-300 dark:border-zinc-800 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-zinc-400">No clients found.</p>
            <Button
              onClick={openCreateModal}
              variant="primary"
              className="text-xs font-sans rounded-lg"
            >
              Register your first client
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="ui-card ui-card-interactive group flex flex-col gap-5 p-5 shadow-sm transition-all hover:border-purple-600/50 dark:shadow-none sm:p-6 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-sm font-semibold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                    {getInitials(client)}
                  </div>

                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-lg font-semibold text-slate-900 transition-colors group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
                        {client.name}
                      </h3>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClass(client.status)}`}>
                        {statusLabel(client.status)}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                      {client.company || 'Independent client'}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-zinc-400">
                      {client.email && <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" />{client.email}</span>}
                      {client.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" />{client.phone}</span>}
                      {client.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />{client.location}</span>}
                    </div>

                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400 dark:text-zinc-600">
                      Added {formatDate(client.createdAt)}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setError('');
                    setSelectedClient(client);
                  }}
                  variant="secondary"
                  className="w-full shrink-0 rounded-xl text-xs font-sans lg:w-auto"
                >
                  View client
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

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
                <p className="ui-eyebrow">CRM</p>
                <h2 className="ui-section-title">Register New Client</h2>
              </div>

              {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-700 dark:text-red-300">{error}</div>}

              <form onSubmit={handleCreateClient} className="space-y-4">
                <div className="space-y-1">
                  <label className="ui-label">Contact Name *</label>
                  <input required type="text" placeholder="e.g. Jane Wanjiku" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="ui-input" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="ui-label">Email</label>
                    <input type="email" placeholder="jane@company.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="ui-input" />
                  </div>
                  <div className="space-y-1">
                    <label className="ui-label">Phone</label>
                    <div className="flex items-center gap-2">
                      <select value={form.phoneCountry} onChange={(e) => handlePhoneCountryChange(e.target.value)} className="ui-select">
                        <option value="+254">🇰🇪 +254 (Kenya)</option>
                        <option value="+1">🇺🇸 +1 (USA)</option>
                        <option value="+44">🇬🇧 +44 (UK)</option>
                        <option value="+27">🇿🇦 +27 (South Africa)</option>
                        <option value="+254">Other</option>
                      </select>
                      <input type="text" placeholder="700 000 000" value={form.phone?.replace(new RegExp('^' + (form.phoneCountry || '') + '\\s*'), '')} onChange={(event) => setForm({ ...form, phone: (form.phoneCountry || '') + ' ' + event.target.value })} className="ui-input" />
                    </div>
                    <div className="space-y-1">
                      <label className="ui-label">Location</label>
                      <input type="text" placeholder="e.g. Nairobi, Kenya" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="ui-input" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="ui-label">Company / Organization</label>
                    <input type="text" placeholder="e.g. Safaricom" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} className="ui-input" />
                  </div>
                  <div className="space-y-1">
                    <label className="ui-label">Website</label>
                    <input 
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
                      className="ui-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="ui-label">KRA PIN</label>
                    <input type="text" placeholder="e.g. A000000000Z" value={form.kraPin} onChange={(event) => setForm({ ...form, kraPin: event.target.value })} className="ui-input" />
                  </div>
                  <div className="space-y-1">
                    <label className="ui-label">Status</label>
                    <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ClientStatus })} className="ui-select">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="ui-label">Internal Notes</label>
                  <textarea rows={3} placeholder="Project, billing, or relationship notes..." value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="ui-textarea" />
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
                {selectedClient.company && <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-sans bg-purple-600/20 text-purple-700 dark:text-purple-300 rounded-full">{selectedClient.company}</span>}
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
                  <p className="ui-label">Client Status</p>
                  <p className="ui-meta">Changes are saved directly to the database.</p>
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
                <p className="ui-label">Internal Notes</p>
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

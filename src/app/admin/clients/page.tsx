// src/app/admin/clients/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type ClientStatus = 'active' | 'inactive' | 'archived';

type Client = {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
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
  company: '',
  website: '',
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
    setForm(emptyForm);
    setError('');
    setIsAddClientOpen(true);
  }

  function closeCreateModal() {
    if (!saving) {
      setIsAddClientOpen(false);
      setForm(emptyForm);
    }
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

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
          <div>
            <Link href="/admin" className="text-xs font-mono text-purple-600 dark:text-purple-400 hover:underline">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white mt-1">Client CRM</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-500 font-mono mt-2">
              Database-backed client records and workflow status.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 btn-primary text-xs font-mono uppercase tracking-widest rounded-lg flex items-center gap-2 shadow-sm"
          >
            <span>+ Register New Client</span>
          </button>
        </div>

        {error && !isAddClientOpen && !selectedClient && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            ['Total Clients', clients.length, 'text-slate-500 dark:text-zinc-400'],
            ['Active', activeCount, 'text-emerald-600 dark:text-emerald-400'],
            ['Inactive', inactiveCount, 'text-amber-600 dark:text-amber-400'],
            ['Archived', archivedCount, 'text-slate-500 dark:text-zinc-400'],
          ].map(([label, count, color]) => (
            <div key={String(label)} className="p-6 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 rounded-2xl shadow-sm dark:shadow-none">
              <p className={`text-xs ${color} font-mono uppercase`}>{label}</p>
              <p className="text-3xl font-light text-slate-900 dark:text-white mt-1">{count}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-100 dark:bg-zinc-900/40 p-4 border border-slate-200 dark:border-zinc-800/80 rounded-2xl">
          <input
            type="text"
            placeholder="Search clients by name, company, email, phone..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full md:w-96 px-4 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-xl focus:border-purple-600 focus:outline-none"
          />

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {(
              [
                ['ALL', clients.length],
                ['active', activeCount],
                ['inactive', inactiveCount],
                ['archived', archivedCount],
              ] as const
            ).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  filterStatus === status
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'btn-secondary'
                }`}
              >
                {status === 'ALL' ? 'All' : statusLabel(status)} ({count})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950/40">
            <p className="text-xs font-mono text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Loading clients…</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl">
            <p className="text-sm text-slate-600 dark:text-zinc-400">No clients found.</p>
            <button onClick={openCreateModal} className="mt-4 px-4 py-2 btn-primary text-xs font-mono rounded-lg">
              Register your first client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="p-6 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-purple-600/50 transition-all group shadow-sm dark:shadow-none"
              >
                <div className="space-y-3 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    {client.company && (
                      <span className="px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-[10px] font-mono rounded-full uppercase">
                        {client.company}
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 border text-[10px] font-mono rounded-full uppercase ${statusClass(client.status)}`}>
                      {statusLabel(client.status)}
                    </span>
                  </div>

                  <h3 className="text-xl font-medium text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {client.name}
                  </h3>

                  <div className="text-xs text-slate-600 dark:text-zinc-400 font-mono flex flex-wrap gap-x-2 gap-y-1">
                    {client.email && <span>{client.email}</span>}
                    {client.phone && <span>• {client.phone}</span>}
                    {client.website && <span>• {client.website}</span>}
                  </div>

                  {client.notes && (
                    <p className="text-xs text-slate-500 dark:text-zinc-500 font-light italic">“{client.notes}”</p>
                  )}

                  <p className="text-[10px] text-slate-400 dark:text-zinc-600 font-mono uppercase">
                    Added {formatDate(client.createdAt)}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setError('');
                    setSelectedClient(client);
                  }}
                  className="px-4 py-2.5 btn-secondary text-xs font-mono rounded-xl cursor-pointer"
                >
                  View / Edit
                </button>
              </div>
            ))}
          </div>
        )}

        {isAddClientOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6 text-slate-900 dark:text-white">
            <div className="max-w-xl w-full p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
              <button onClick={closeCreateModal} disabled={saving} className="absolute top-6 right-6 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-50">✕</button>

              <div className="space-y-1">
                <p className="text-xs font-mono uppercase text-purple-600 dark:text-purple-400 tracking-widest">CRM</p>
                <h2 className="text-2xl font-light">Register New Client</h2>
              </div>

              {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-700 dark:text-red-300">{error}</div>}

              <form onSubmit={handleCreateClient} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Contact Name *</label>
                  <input required type="text" placeholder="e.g. Jane Wanjiku" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono rounded-lg focus:border-purple-600 focus:outline-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Email</label>
                    <input type="email" placeholder="jane@company.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono rounded-lg focus:border-purple-600 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Phone</label>
                    <input type="text" placeholder="+254 700 000 000" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono rounded-lg focus:border-purple-600 focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Company / Organization</label>
                    <input type="text" placeholder="e.g. Safaricom" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono rounded-lg focus:border-purple-600 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Website</label>
                    <input type="url" placeholder="https://company.com" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono rounded-lg focus:border-purple-600 focus:outline-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Status</label>
                  <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ClientStatus })} className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono rounded-lg focus:border-purple-600 focus:outline-none">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Internal Notes</label>
                  <textarea rows={3} placeholder="Project, billing, or relationship notes..." value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="w-full px-4 py-2 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono rounded-lg focus:border-purple-600 focus:outline-none" />
                </div>

                <button type="submit" disabled={saving} className="w-full py-3.5 btn-primary text-xs font-mono uppercase tracking-widest rounded-lg transition-colors shadow-md disabled:opacity-50">
                  {saving ? 'Saving Client…' : '+ Add Client to CRM'}
                </button>
              </form>
            </div>
          </div>
        )}

        {selectedClient && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6 text-slate-900 dark:text-white">
            <div className="max-w-xl w-full p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
              <button onClick={() => setSelectedClient(null)} className="absolute top-6 right-6 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white">✕</button>

              <div className="space-y-2 border-b border-slate-200 dark:border-zinc-800 pb-5">
                {selectedClient.company && <span className="inline-flex px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-[10px] font-mono rounded-full uppercase">{selectedClient.company}</span>}
                <h2 className="text-2xl font-light">{selectedClient.name}</h2>
                <p className="text-xs font-mono text-slate-600 dark:text-zinc-400 break-words">
                  {[selectedClient.email, selectedClient.phone, selectedClient.website].filter(Boolean).join(' • ') || 'No contact details'}
                </p>
              </div>

              {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-700 dark:text-red-300">{error}</div>}

              <div className="p-6 bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-4">
                <div>
                  <p className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase">Client Status</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">Changes are saved directly to the database.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['active', 'inactive', 'archived'] as ClientStatus[]).map((status) => (
                    <button
                      key={status}
                      disabled={updating || selectedClient.status === status}
                      onClick={() => updateClientStatus(status)}
                      className={`px-3 py-2.5 border rounded-lg text-[10px] font-mono uppercase transition-all disabled:opacity-50 ${
                        selectedClient.status === status
                          ? statusClass(status)
                          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 hover:border-purple-500'
                      }`}
                    >
                      {statusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase">Internal Notes</p>
                <p className="text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-wrap">{selectedClient.notes || 'No internal notes.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800 text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-600">
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

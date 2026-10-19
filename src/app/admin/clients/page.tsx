'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';

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
    <div className="">
      <div className="">
        <AdminPageHeader
          title="Client CRM"
          description="Database-backed client records and workflow status."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          primaryAction={
            <Button
              onClick={openCreateModal}
              variant="primary"
              className=""
            >
              + Register New Client
            </Button>
          }
        />

        {error && !isAddClientOpen && !selectedClient && (
          <div className="">
            {error}
          </div>
        )}

        <div className="">
          {[
            ['Total Clients', clients.length, 'text-slate-500 dark:text-zinc-400'],
            ['Active', activeCount, 'text-emerald-600 dark:text-emerald-400'],
            ['Inactive', inactiveCount, 'text-amber-600 dark:text-amber-400'],
            ['Archived', archivedCount, 'text-slate-500 dark:text-zinc-400'],
          ].map(([label, count, color]) => (
            <div key={String(label)} className="ui-stat-card">
              <p className={`ui-stat-label ${color}`}>{label}</p>
              <p className="ui-stat-value">{count}</p>
            </div>
          ))}
        </div>

        <div className="">
          <input
            type="text"
            placeholder="Search clients by name, company, email, phone..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="ui-input"
          />

          <div className="">
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
                className=""
              >
                {status === 'ALL' ? 'All' : statusLabel(status)} ({count})
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="">
            <p className="">Loading clients…</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="">
            <p className="">No clients found.</p>
            <Button
              onClick={openCreateModal}
              variant="primary"
              className=""
            >
              Register your first client
            </Button>
          </div>
        ) : (
          <div className="">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="ui-card ui-card-interactive"
              >
                <div className="">
                  <div className="">
                    {getInitials(client)}
                  </div>

                  <div className="">
                    <div className="">
                      <h3 className="">
                        {client.name}
                      </h3>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClass(client.status)}`}>
                        {statusLabel(client.status)}
                      </span>
                    </div>

                    <p className="">
                      {client.company || 'Independent client'}
                    </p>

                    <div className="">
                      {client.email && <span className=""><Mail className="" />{client.email}</span>}
                      {client.phone && <span className=""><Phone className="" />{client.phone}</span>}
                      {client.location && <span className=""><MapPin className="" />{client.location}</span>}
                    </div>

                    <p className="">
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
                  className=""
                >
                  View client
                  <ArrowUpRight className="" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {isAddClientOpen && (
          <div className="">
            <div className="">
              <Button
                onClick={closeCreateModal}
                variant="ghost"
                size="icon"
                className=""
              >
                ✕
              </Button>

              <div className="">
                <p className="ui-eyebrow">CRM</p>
                <h2 className="ui-section-title">Register New Client</h2>
              </div>

              {error && <div className="">{error}</div>}

              <form onSubmit={handleCreateClient} className="">
                <div className="">
                  <label className="ui-label">Contact Name *</label>
                  <input required type="text" placeholder="e.g. Jane Wanjiku" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="ui-input" />
                </div>

                <div className="">
                  <div className="">
                    <label className="ui-label">Email</label>
                    <input type="email" placeholder="jane@company.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="ui-input" />
                  </div>
                  <div className="">
                    <label className="ui-label">Phone</label>
                    <div className="">
                      <select value={form.phoneCountry} onChange={(e) => handlePhoneCountryChange(e.target.value)} className="ui-select">
                        <option value="+254">🇰🇪 +254 (Kenya)</option>
                        <option value="+1">🇺🇸 +1 (USA)</option>
                        <option value="+44">🇬🇧 +44 (UK)</option>
                        <option value="+27">🇿🇦 +27 (South Africa)</option>
                        <option value="+254">Other</option>
                      </select>
                      <input type="text" placeholder="700 000 000" value={form.phone?.replace(new RegExp('^' + (form.phoneCountry || '') + '\\s*'), '')} onChange={(event) => setForm({ ...form, phone: (form.phoneCountry || '') + ' ' + event.target.value })} className="ui-input" />
                    </div>
                    <div className="">
                      <label className="ui-label">Location</label>
                      <input type="text" placeholder="e.g. Nairobi, Kenya" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="ui-input" />
                    </div>
                  </div>
                </div>

                <div className="">
                  <div className="">
                    <label className="ui-label">Company / Organization</label>
                    <input type="text" placeholder="e.g. Safaricom" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} className="ui-input" />
                  </div>
                  <div className="">
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

                <div className="">
                  <div className="">
                    <label className="ui-label">KRA PIN</label>
                    <input type="text" placeholder="e.g. A000000000Z" value={form.kraPin} onChange={(event) => setForm({ ...form, kraPin: event.target.value })} className="ui-input" />
                  </div>
                  <div className="">
                    <label className="ui-label">Status</label>
                    <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ClientStatus })} className="ui-select">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="">
                  <label className="ui-label">Internal Notes</label>
                  <textarea rows={3} placeholder="Project, billing, or relationship notes..." value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="ui-textarea" />
                </div>

                <Button type="submit" disabled={saving} variant="primary" className="">
                  {saving ? 'Saving Client…' : '+ Add Client to CRM'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {selectedClient && (
          <div className="">
            <div className="">
              <Button
                onClick={() => setSelectedClient(null)}
                variant="ghost"
                size="icon"
                className=""
              >
                ✕
              </Button>

              <div className="">
                {selectedClient.company && <span className="">{selectedClient.company}</span>}
                <h2 className="">{selectedClient.name}</h2>
                <p className="">
                  {[selectedClient.email, selectedClient.phone, selectedClient.website].filter(Boolean).join(' • ') || 'No contact details'}
                </p>
                {selectedClient.kraPin && (
                  <p className="">
                    KRA PIN: {selectedClient.kraPin}
                  </p>
                )}

              </div>

              {error && <div className="">{error}</div>}

              <div className="">
                <div>
                  <p className="ui-label">Client Status</p>
                  <p className="ui-meta">Changes are saved directly to the database.</p>
                </div>

                <div className="">
                  {(['active', 'inactive', 'archived'] as ClientStatus[]).map((status) => (
                    <Button
                      key={status}
                      variant={selectedClient.status === status ? 'primary' : 'secondary'}
                      disabled={updating || selectedClient.status === status}
                      onClick={() => updateClientStatus(status)}
                      className=""
                    >
                      {statusLabel(status)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="">
                <p className="ui-label">Internal Notes</p>
                <p className="">{selectedClient.notes || 'No internal notes.'}</p>
              </div>

              <div className="">
                <div>Created {formatDate(selectedClient.createdAt)}</div>
                <div className="">Updated {formatDate(selectedClient.updatedAt)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

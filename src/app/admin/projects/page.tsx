'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';

type ProjectStatus = 'active' | 'inactive' | 'completed' | 'on hold' | 'cancelled';

type Project = {
  id: string;
  name: string;
  description?: string | null;
  scopeOfWork?: string | null;
  deliverables?: string | null;
  totalAmount?: number | null;
  currency?: string | null;
  paymentTerms?: string | null;
  revisionsPolicy?: string | null;
  licensingTerms?: string | null;
  noticePeriod?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: ProjectStatus | string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
  } | null;
};

type Client = NonNullable<Project['client']>;

const emptyForm = {
  name: '',
  description: '',
  scopeOfWork: '',
  deliverables: '',
  totalAmount: '',
  currency: 'KES',
  paymentTerms: '',
  revisionsPolicy: '',
  licensingTerms: '',
  noticePeriod: '',
  status: 'active' as ProjectStatus,
  startDate: '',
  endDate: '',
  clientId: '',
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

function getInitials(project: Pick<Project, 'name'>) {
  const value = project.name;
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

  if (status === 'completed') {
    return 'bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300';
  }

  if (status === 'on hold') {
    return 'bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300';
  }

  if (status === 'cancelled') {
    return 'bg-red-500/20 border-red-500/30 text-red-700 dark:text-red-300';
  }

  return 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400';
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | ProjectStatus>('ALL');
  const [filterClient, setFilterClient] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError('');

        // Load clients for the client filter dropdown
        const clientsResponse = await fetch('/api/clients', { cache: 'no-store' });
        if (!clientsResponse.ok) {
          throw new Error('Failed to load clients');
        }
        const clientsData = await clientsResponse.json();

        // Load projects
        const params = new URLSearchParams();
        if (filterClient) {
          params.append('clientId', filterClient);
        }
        if (filterStatus && filterStatus !== 'ALL') {
          params.append('status', filterStatus);
        }

        const projectsResponse = await fetch(`/api/projects?${params.toString()}`, {
          cache: 'no-store',
        });

        if (!projectsResponse.ok) {
          throw new Error('Failed to load projects');
        }

        const projectsData = await projectsResponse.json();

        if (!cancelled) {
          setClients(Array.isArray(clientsData) ? clientsData : []);
          setProjects(
            projectsData.map((proj: Project) => ({
              ...proj,
              client: proj.client
                ? {
                    id: proj.client.id,
                    name: proj.client.name,
                    company: proj.client.company,
                    email: proj.client.email,
                    phone: proj.client.phone,
                    location: proj.client.location,
                  }
                : null,
            } as Project))
          );
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        if (!cancelled) {
          setError('Unable to load projects. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [filterClient, filterStatus]);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        [
          project.name,
          project.description,
          project.client?.name,
          project.client?.company,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        filterStatus === 'ALL' || project.status === filterStatus;

      const matchesClient =
        !filterClient || project.client?.id === filterClient;

      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [projects, filterClient, filterStatus, searchQuery]);

  const activeCount = projects.filter((p) => p.status === 'active').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const onHoldCount = projects.filter((p) => p.status === 'on hold').length;
  const cancelledCount = projects.filter((p) => p.status === 'cancelled').length;

  function openCreateModal(clientId?: string) {
    setForm({
      ...emptyForm,
      clientId: clientId || '',
    });
    setError('');
    setIsAddProjectOpen(true);
  }

  function closeCreateModal() {
    if (!saving) {
      setIsAddProjectOpen(false);
      setForm(emptyForm);
    }
  }

  async function handleCreateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('Project name is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          scopeOfWork: form.scopeOfWork,
          deliverables: form.deliverables,
          totalAmount: form.totalAmount ? Number(form.totalAmount) : null,
          currency: form.currency,
          paymentTerms: form.paymentTerms,
          revisionsPolicy: form.revisionsPolicy,
          licensingTerms: form.licensingTerms,
          noticePeriod: form.noticePeriod,
          status: form.status,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
          clientId: form.clientId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create project');
      }

      setProjects((current) => [data, ...current]);
      setIsAddProjectOpen(false);
      setForm(emptyForm);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project.');
    } finally {
      setSaving(false);
    }
  }

  async function updateProjectStatus(status: ProjectStatus) {
    if (!selectedProject) return;

    try {
      setUpdating(true);
      setError('');

      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update project');
      }

      setProjects((current) =>
        current.map((project) => (project.id === data.id ? data : project))
      );
      setSelectedProject(data);
    } catch (err) {
      console.error('Failed to update project:', err);
      setError(err instanceof Error ? err.message : 'Failed to update project.');
    } finally {
      setUpdating(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen px-4 py-8 font-sans transition-colors duration-300 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminPageHeader
          title="Projects"
          description="Track all client engagements and creative projects."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          primaryAction={
            <Button
              onClick={() => openCreateModal()}
              variant="primary"
              className="text-xs font-sans uppercase tracking-widest"
            >
              + New Project
            </Button>
          }
        />

        {error && !isAddProjectOpen && !selectedProject && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            ['Total Projects', projects.length, 'text-slate-500 dark:text-zinc-400'],
            ['Active', activeCount, 'text-emerald-600 dark:text-emerald-400'],
            ['Completed', completedCount, 'text-blue-600 dark:text-blue-400'],
            ['On Hold', onHoldCount, 'text-amber-600 dark:text-amber-400'],
            ['Cancelled', cancelledCount, 'text-red-600 dark:text-red-400'],
          ].map(([label, count, color]) => (
            <div key={String(label)} className="ui-stat-card min-h-[6.5rem]">
              <p className={`ui-stat-label ${color}`}>{label}</p>
              <p className="ui-stat-value">{count}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-stretch gap-4 rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="Search projects by name, description, client..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="ui-input w-full md:w-64"
            />

            <select
              value={filterClient ?? ''}
              onChange={(e) => setFilterClient(e.target.value || null)}
              className="ui-input w-full md:w-64"
            >
              <option value="">All Clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.company ? `(${client.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-sans">
            {(
              [
                ['ALL', projects.length],
                ['active', activeCount],
                ['completed', completedCount],
                ['on hold', onHoldCount],
                ['cancelled', cancelledCount],
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
            <p className="text-xs font-sans text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Loading projects…</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-300 dark:border-zinc-800 rounded-xl">
            <p className="text-sm text-slate-600 dark:text-zinc-400">No projects found.</p>
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => openCreateModal()}
                variant="primary"
                className="text-xs font-sans rounded-lg"
              >
                Create your first project
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="ui-card ui-card-interactive group flex flex-col gap-5 p-5 shadow-sm transition-all hover:border-purple-600/50 dark:shadow-none sm:p-6 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-sm font-semibold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                    {getInitials(project)}
                  </div>

                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-lg font-semibold text-slate-900 transition-colors group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
                        {project.name}
                      </h3>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClass(project.status)}`}>
                        {statusLabel(project.status)}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                      {project.client?.name || 'No client'}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-zinc-400">
                      {project.client?.email && (
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {project.client?.email}
                        </span>
                      )}
                      {project.client?.phone && (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {project.client?.phone}
                        </span>
                      )}
                      {project.client?.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {project.client?.location}
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400 dark:text-zinc-600">
                      Added {formatDate(project.createdAt)}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setError('');
                    setSelectedProject(project);
                  }}
                  variant="secondary"
                  className="w-full shrink-0 rounded-xl text-xs font-sans lg:w-auto"
                >
                  View project
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {isAddProjectOpen && (
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
                <p className="ui-eyebrow">PROJECTS</p>
                <h2 className="ui-section-title">New Project</h2>
              </div>

              {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-700 dark:text-red-300">{error}</div>}

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-1">
                  <label className="ui-label">Project Name *</label>
                  <input required type="text" placeholder="e.g. 2026 Brand Campaign" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="ui-input" />
                </div>

                <div className="space-y-1">
                  <label className="ui-label">Client</label>
                  <select
                    value={form.clientId}
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                    className="ui-input w-full"
                  >
                    <option value="">Select a client (optional)</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.company ? `(${client.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="ui-label">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Brief project description..."
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                      className="ui-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="ui-label">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
                      className="ui-input"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="on hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="ui-label">Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                      className="ui-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="ui-label">End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(event) => setForm({ ...form, endDate: event.target.value })}
                      className="ui-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="ui-label">Total Amount</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.totalAmount}
                      onChange={(event) => setForm({ ...form, totalAmount: event.target.value })}
                      className="ui-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="ui-label">Currency</label>
                    <select
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      className="ui-input"
                    >
                      <option value="KES">KES</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="ZAR">ZAR</option>
                      <option value="NGN">NGN</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="ui-label">Payment Terms</label>
                    <input
                      type="text"
                      placeholder="e.g. 50% deposit, 50% on delivery"
                      value={form.paymentTerms}
                      onChange={(event) => setForm({ ...form, paymentTerms: event.target.value })}
                      className="ui-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="ui-label">Revisions Policy</label>
                    <input
                      type="text"
                      placeholder="e.g. 2 rounds of revisions included"
                      value={form.revisionsPolicy}
                      onChange={(event) => setForm({ ...form, revisionsPolicy: event.target.value })}
                      className="ui-input"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="ui-label">Licensing Terms</label>
                  <input
                    type="text"
                    placeholder="e.g. Commercial use rights"
                    value={form.licensingTerms}
                    onChange={(event) => setForm({ ...form, licensingTerms: event.target.value })}
                    className="ui-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="ui-label">Notice Period</label>
                  <input
                    type="text"
                    placeholder="e.g. 14 days"
                    value={form.noticePeriod}
                    onChange={(event) => setForm({ ...form, noticePeriod: event.target.value })}
                    className="ui-input"
                  />
                </div>

                <Button type="submit" disabled={saving} variant="primary" className="w-full">
                  {saving ? 'Saving Project…' : '+ Create Project'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {selectedProject && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6 text-slate-900 dark:text-white">
            <div className="max-w-xl w-full p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
              <Button
                onClick={() => setSelectedProject(null)}
                variant="ghost"
                size="icon"
                className="absolute top-6 right-6 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </Button>

              <div className="space-y-2 border-b border-slate-200 dark:border-zinc-800 pb-5">
                {selectedProject.client && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-sans bg-purple-600/20 text-purple-700 dark:text-purple-300 rounded-full">
                      {selectedProject.client.company}
                    </span>
                    <h2 className="text-2xl font-light">{selectedProject.client.name}</h2>
                  </div>
                )}
                <h2 className="text-2xl font-light">{selectedProject.name}</h2>
                <p className="text-xs font-sans text-slate-600 dark:text-zinc-400">
                  {statusLabel(selectedProject.status)} • {formatDate(selectedProject.createdAt)}
                </p>
                {selectedProject.description && (
                  <p className="text-sm text-slate-500 dark:text-zinc-500 mt-2">
                    {selectedProject.description}
                  </p>
                )}

              </div>

              {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-700 dark:text-red-300">{error}</div>}

              <div className="p-6 bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-4">
                <div>
                  <p className="ui-label">Project Status</p>
                  <p className="ui-meta">Changes are saved directly to the database.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {([
                    'active',
                    'completed',
                    'on hold',
                    'cancelled',
                    'draft',
                  ] as ProjectStatus[]).map((status) => (
                    <Button
                      key={status}
                      variant={selectedProject.status === status ? 'primary' : 'secondary'}
                      disabled={updating || selectedProject.status === status}
                      onClick={() => updateProjectStatus(status as ProjectStatus)}
                      className="text-[10px] font-sans uppercase transition-all disabled:opacity-50"
                    >
                      {statusLabel(status)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="ui-label">Description</p>
                <p className="text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {selectedProject.description || 'No description.'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="ui-label">Details</p>
                <div className="grid gap-4 text-[10px] font-sans uppercase text-slate-400 dark:text-zinc-600">
                  <div>Client: {selectedProject.client?.name || 'None'}</div>
                  <div>
                    {selectedProject.totalAmount !== null ? (
                      <>
                        Amount: {selectedProject.totalAmount} {selectedProject.currency}
                      </>
                    ) : (
                      <span>Amount: Not set</span>
                    )}
                  </div>
                  <div>
                    Start: {formatDate(selectedProject.startDate)}
                  </div>
                  <div>
                    End: {formatDate(selectedProject.endDate)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-zinc-800 text-[10px] font-sans uppercase text-slate-400 dark:text-zinc-600">
                <div>Created {formatDate(selectedProject.createdAt)}</div>
                <div className="text-right">Updated {formatDate(selectedProject.updatedAt)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

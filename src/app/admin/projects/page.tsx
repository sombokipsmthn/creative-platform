'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Eye, EyeOff, Mail, MapPin, Phone, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import StatusBadge from '@/components/admin/StatusBadge';
import EmptyState from '@/components/admin/EmptyState';

type ProjectStatus = 'active' | 'completed' | 'on hold' | 'cancelled' | 'draft';

type Project = {
  id: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  slug: string | null;
  category: string | null;
  year: string | null;
  location: string | null;
  services: string[] | null;
  disciplines: string[] | null;
  collaborators: string[] | null;
  role: string | null;
  scopeOfWork: string | null;
  deliverables: string | null;
  totalAmount: number | null;
  currency: string | null;
  paymentTerms: string | null;
  revisionsPolicy: string | null;
  licensingTerms: string | null;
  noticePeriod: string | null;
  storyOverview: string | null;
  storyChallenge: string | null;
  storyApproach: string | null;
  storyOutcome: string | null;
  storyCredits: string | null;
  status: ProjectStatus | string;
  visibility: string | null;
  featured: boolean | null;
  publishedAt: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
  } | null;
};

const emptyForm = {
  name: '',
  description: '',
  shortDescription: '',
  slug: '',
  category: '',
  year: '',
  location: '',
  scopeOfWork: '',
  deliverables: '',
  totalAmount: '',
  currency: 'KES',
  paymentTerms: '',
  revisionsPolicy: '',
  licensingTerms: '',
  noticePeriod: '',
  status: 'draft' as ProjectStatus,
  visibility: 'private' as 'public' | 'private' | 'draft',
  featured: false,
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
  const [clients, setClients] = useState<Array<{ id: string; name: string; company?: string | null }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | ProjectStatus>('ALL');
  const [filterClient, setFilterClient] = useState<string | null>(null);
  const [filterVisibility, setFilterVisibility] = useState<'ALL' | 'public' | 'private' | 'draft'>('ALL');
  const [filterFeatured, setFilterFeatured] = useState<'ALL' | 'true' | 'false'>('ALL');
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
        const clientsResponse = await fetch('/api/clients', {
          cache: 'no-store',
          credentials: 'same-origin',
        });
        const clientsData = clientsResponse.ok
          ? await clientsResponse.json()
          : [];

        // Load projects
        const params = new URLSearchParams();
        if (filterClient) {
          params.append('clientId', filterClient);
        }
        if (filterStatus && filterStatus !== 'ALL') {
          params.append('status', filterStatus);
        }
        if (filterVisibility && filterVisibility !== 'ALL') {
          params.append('visibility', filterVisibility);
        }
        if (filterFeatured && filterFeatured !== 'ALL') {
          params.append('featured', filterFeatured);
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
            }))
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
  }, [filterClient, filterStatus, filterVisibility, filterFeatured]);

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

      const matchesVisibility =
        filterVisibility === 'ALL' || project.visibility === filterVisibility;

      const matchesFeatured =
        filterFeatured === 'ALL' || (filterFeatured === 'true' ? project.featured : !project.featured);

      return matchesSearch && matchesStatus && matchesClient && matchesVisibility && matchesFeatured;
    });
  }, [projects, filterClient, filterStatus, filterVisibility, filterFeatured, searchQuery]);

  const activeCount = projects.filter((p) => p.status === 'active').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const onHoldCount = projects.filter((p) => p.status === 'on hold').length;
  const cancelledCount = projects.filter((p) => p.status === 'cancelled').length;
  const draftCount = projects.filter((p) => p.status === 'draft').length;
  const publishedCount = projects.filter((p) => p.visibility === 'public').length;
  const featuredCount = projects.filter((p) => p.featured).length;

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
          shortDescription: form.shortDescription,
          slug: form.slug,
          category: form.category,
          year: form.year,
          location: form.location,
          scopeOfWork: form.scopeOfWork,
          deliverables: form.deliverables,
          totalAmount: form.totalAmount ? Number(form.totalAmount) : null,
          currency: form.currency,
          paymentTerms: form.paymentTerms,
          revisionsPolicy: form.revisionsPolicy,
          licensingTerms: form.licensingTerms,
          noticePeriod: form.noticePeriod,
          status: form.status,
          visibility: form.visibility,
          featured: form.featured,
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
    <div className="ui-page ui-page-padded">
      <div className="ui-shell">
        <AdminPageHeader
          title="Projects"
          description="Track all client engagements and creative projects."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          primaryAction={
            <Button
              onClick={() => openCreateModal()}
              variant="primary"
              className="admin-content-block"
            >
              + New Project
            </Button>
          }
        />

        {error && !isAddProjectOpen && !selectedProject && (
          <div className="admin-content-block">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            ['Total Projects', projects.length, 'text-slate-500 dark:text-zinc-400'],
            ['Draft', draftCount, 'text-amber-600 dark:text-amber-400'],
            ['Published', publishedCount, 'text-emerald-600 dark:text-emerald-400'],
            ['Featured', featuredCount, 'text-purple-600 dark:text-purple-400'],
            ['Active', activeCount, 'text-blue-600 dark:text-blue-400'],
            ['Completed', completedCount, 'text-slate-500 dark:text-zinc-400'],
          ].map(([label, count, color]) => (
            <div key={String(label)} className="ui-stat-card">
              <p className={`ui-stat-label ${color}`}>{label}</p>
              <p className="ui-stat-value">{count}</p>
            </div>
          ))}
        </div>

        <section className="ui-card space-y-3 p-4" aria-label="Project search and filters">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search projects by name, description, client..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="ui-input"
            />

            <select
              value={filterClient ?? ''}
              onChange={(e) => setFilterClient(e.target.value || null)}
              className="ui-input"
            >
              <option value="">All Clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.company ? `(${client.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ['ALL', projects.length],
                ['active', activeCount],
                ['completed', completedCount],
                ['on hold', onHoldCount],
                ['cancelled', cancelledCount],
                ['draft', draftCount],
              ] as const
            ).map(([status, count]) => (
              <Button key={status} variant={filterStatus === status ? 'primary' : 'secondary'} onClick={() => setFilterStatus(status)}>
                {status === 'ALL' ? 'All' : statusLabel(status)} ({count})
              </Button>
            ))}
            <div className="flex flex-wrap items-center gap-2"><span className="ui-meta">Visibility:</span>{(['ALL', 'public', 'private', 'draft'] as const).map(vis => <Button key={vis} variant={filterVisibility === vis ? 'primary' : 'secondary'} onClick={() => setFilterVisibility(vis)}>{vis === 'ALL' ? 'All' : vis.charAt(0).toUpperCase() + vis.slice(1)}</Button>)}</div>
            <div className="flex flex-wrap items-center gap-2"><span className="ui-meta">Featured:</span>{(['ALL', 'true', 'false'] as const).map(feat => <Button key={feat} variant={filterFeatured === feat ? 'primary' : 'secondary'} onClick={() => setFilterFeatured(feat)}>{feat === 'ALL' ? 'All' : feat === 'true' ? 'Yes' : 'No'}</Button>)}</div>
          </div>
        </section>

        {loading ? (
          <div className="admin-empty-state" role="status"><p>Loading projects…</p></div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState title="No projects found" description="Create a project or adjust your current search and filters." filtered={Boolean(searchQuery || filterClient || filterStatus !== 'ALL' || filterVisibility !== 'ALL' || filterFeatured !== 'ALL')} action={<Button onClick={() => openCreateModal()}>Create project</Button>} />
        ) : (
          <div className="admin-content-block">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="ui-card ui-card-interactive"
              >
                <div className="admin-content-block">
                  <div className="admin-content-block">
                    {getInitials(project)}
                  </div>

                  <div className="admin-content-block">
                    <div className="admin-content-block">
                      <h3 className="admin-content-block">
                        {project.name}
                      </h3>
                      <StatusBadge status={project.status} />
                      {project.featured && (
                        <span className="admin-content-block">
                          <Star className="admin-content-block" />
                          Featured
                        </span>
                      )}
                      {project.visibility === 'public' && project.publishedAt && (
                        <span className="admin-content-block">
                          <Eye className="admin-content-block" />
                          Published
                        </span>
                      )}
                      {project.visibility === 'private' && (
                        <span className="admin-content-block">
                          <EyeOff className="admin-content-block" />
                          Private
                        </span>
                      )}
                      {project.visibility === 'draft' && (
                        <span className="admin-content-block">
                          Draft
                        </span>
                      )}
                    </div>

                    <p className="admin-content-block">
                      {project.client?.name || 'No client'}
                    </p>

                    <div className="admin-content-block">
                      {project.client?.email && (
                        <span className="admin-content-block">
                          <Mail className="admin-content-block" />
                          {project.client?.email}
                        </span>
                      )}
                      {project.client?.phone && (
                        <span className="admin-content-block">
                          <Phone className="admin-content-block" />
                          {project.client?.phone}
                        </span>
                      )}
                      {project.client?.location && (
                        <span className="admin-content-block">
                          <MapPin className="admin-content-block" />
                          {project.client?.location}
                        </span>
                      )}
                    </div>

                    <p className="admin-content-block">
                      Added {formatDate(project.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="admin-content-block">
                  <Button
                    onClick={() => {
                      setError('');
                      setSelectedProject(project);
                    }}
                    variant="secondary"
                    className="admin-content-block"
                  >
                    View project
                    <ArrowUpRight className="admin-content-block" />
                  </Button>
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="admin-content-block"
                  >
                    Edit
                  </Link>
                  {project.slug && project.visibility === 'public' && (
                    <a
                      href={`/work/${project.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-content-block"
                    >
                      <Eye className="admin-content-block" />
                      Preview
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="admin-content-block"
                    onClick={async () => {
                      if (!confirm('Delete this project? This cannot be undone.')) return;
                      try {
                        setError('');
                        const response = await fetch(`/api/projects/${project.id}`, {
                          method: 'DELETE',
                        });
                        if (!response.ok) {
                          const data = await response.json();
                          throw new Error(data?.error || 'Failed to delete project');
                        }
                        setProjects((current) => current.filter((p) => p.id !== project.id));
                      } catch (err) {
                        console.error('Failed to delete project:', err);
                        setError(err instanceof Error ? err.message : 'Failed to delete project.');
                      }
                    }}
                    aria-label="Delete project"
                  >
                    <Trash2 className="admin-content-block" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAddProjectOpen && (
          <div className="admin-content-block">
            <div className="admin-content-block">
              <Button
                onClick={closeCreateModal}
                variant="ghost"
                size="icon"
                className="admin-content-block"
              >
                ✕
              </Button>

              <div className="admin-content-block">
                <p className="ui-eyebrow">PROJECTS</p>
                <h2 className="ui-section-title">New Project</h2>
              </div>

              {error && <div className="admin-content-block">{error}</div>}

              <form onSubmit={handleCreateProject} className="admin-content-block">
                <div className="admin-content-block">
                  <label className="ui-label">Project Name *</label>
                  <input required type="text" placeholder="e.g. 2026 Brand Campaign" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="ui-input" />
                </div>

                <div className="admin-content-block">
                  <label className="ui-label">Client</label>
                  <select
                    value={form.clientId}
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                    className="ui-input"
                  >
                    <option value="">Select a client (optional)</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.company ? `(${client.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-content-block">
                  <div className="admin-content-block">
                    <label className="ui-label">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Brief project description..."
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                      className="ui-input"
                    />
                  </div>
                  <div className="admin-content-block">
                    <label className="ui-label">Short Description</label>
                    <input
                      type="text"
                      placeholder="One-line summary for portfolio cards"
                      value={form.shortDescription}
                      onChange={(event) => setForm({ ...form, shortDescription: event.target.value })}
                      className="ui-input"
                    />
                  </div>
                </div>

                <div className="admin-content-block">
                  <div className="admin-content-block">
                    <label className="ui-label">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="ui-input"
                    >
                      <option value="">Select category</option>
                      <option value="Photography">Photography</option>
                      <option value="Videography">Videography</option>
                      <option value="Branding">Branding</option>
                      <option value="UI/UX">UI/UX</option>
                      <option value="Motion">Motion Graphics</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="admin-content-block">
                    <label className="ui-label">Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2026"
                      value={form.year}
                      onChange={(event) => setForm({ ...form, year: event.target.value })}
                      className="ui-input"
                    />
                  </div>
                </div>

                <div className="admin-content-block">
                  <div className="admin-content-block">
                    <label className="ui-label">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Nairobi, Kenya"
                      value={form.location}
                      onChange={(event) => setForm({ ...form, location: event.target.value })}
                      className="ui-input"
                    />
                  </div>
                  <div className="admin-content-block">
                    <label className="ui-label">Slug</label>
                    <input
                      type="text"
                      placeholder="auto-generated from name"
                      value={form.slug}
                      onChange={(event) => setForm({ ...form, slug: event.target.value })}
                      className="ui-input"
                    />
                  </div>
                </div>

                <div className="admin-content-block">
                  <div className="admin-content-block">
                    <label className="ui-label">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
                      className="ui-input"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="on hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="admin-content-block">
                    <label className="ui-label">Visibility</label>
                    <select
                      value={form.visibility}
                      onChange={(e) => setForm({ ...form, visibility: e.target.value as 'public' | 'private' | 'draft' })}
                      className="ui-input"
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="admin-content-block">
                  <div className="admin-content-block">
                    <label className="ui-label">Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                      className="ui-input"
                    />
                  </div>
                  <div className="admin-content-block">
                    <label className="ui-label">End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(event) => setForm({ ...form, endDate: event.target.value })}
                      className="ui-input"
                    />
                  </div>
                </div>

                <div className="admin-content-block">
                  <div className="admin-content-block">
                    <label className="ui-label">Total Amount</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.totalAmount}
                      onChange={(event) => setForm({ ...form, totalAmount: event.target.value })}
                      className="ui-input"
                    />
                  </div>
                  <div className="admin-content-block">
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

                <div className="admin-content-block">
                  <div className="admin-content-block">
                    <label className="ui-label">Payment Terms</label>
                    <input
                      type="text"
                      placeholder="e.g. 50% deposit, 50% on delivery"
                      value={form.paymentTerms}
                      onChange={(event) => setForm({ ...form, paymentTerms: event.target.value })}
                      className="ui-input"
                    />
                  </div>
                  <div className="admin-content-block">
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

                <div className="admin-content-block">
                  <div className="admin-content-block">
                    <label className="ui-label">Licensing Terms</label>
                    <input
                      type="text"
                      placeholder="e.g. Commercial use rights"
                      value={form.licensingTerms}
                      onChange={(event) => setForm({ ...form, licensingTerms: event.target.value })}
                      className="ui-input"
                    />
                  </div>
                  <div className="admin-content-block">
                    <label className="ui-label">Featured</label>
                    <select
                      value={form.featured ? 'true' : 'false'}
                      onChange={(e) => setForm({ ...form, featured: e.target.value === 'true' })}
                      className="ui-input"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>

                <div className="admin-content-block">
                  <label className="ui-label">Notice Period</label>
                  <input
                    type="text"
                    placeholder="e.g. 14 days"
                    value={form.noticePeriod}
                    onChange={(event) => setForm({ ...form, noticePeriod: event.target.value })}
                    className="ui-input"
                  />
                </div>

                <Button type="submit" disabled={saving} variant="primary" className="admin-content-block">
                  {saving ? 'Saving Project…' : '+ Create Project'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {selectedProject && (
          <div className="admin-content-block">
            <div className="admin-content-block">
              <Button
                onClick={() => setSelectedProject(null)}
                variant="ghost"
                size="icon"
                className="admin-content-block"
              >
                ✕
              </Button>

              <div className="admin-content-block">
                {selectedProject.client && (
                  <div className="admin-content-block">
                    <span className="admin-content-block">
                      {selectedProject.client.company}
                    </span>
                    <h2 className="admin-content-block">{selectedProject.client.name}</h2>
                  </div>
                )}
                <h2 className="admin-content-block">{selectedProject.name}</h2>
                <p className="admin-content-block">
                  {statusLabel(selectedProject.status)} • {formatDate(selectedProject.createdAt)}
                </p>
                {selectedProject.description && (
                  <p className="admin-content-block">
                    {selectedProject.description}
                  </p>
                )}

              </div>

              {error && <div className="admin-content-block">{error}</div>}

              <div className="admin-content-block">
                <div>
                  <p className="ui-label">Project Status</p>
                  <p className="ui-meta">Changes are saved directly to the database.</p>
                </div>

                <div className="admin-content-block">
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
                      className="admin-content-block"
                    >
                      {statusLabel(status)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="admin-content-block">
                <p className="ui-label">Description</p>
                <p className="admin-content-block">
                  {selectedProject.description || 'No description.'}
                </p>
              </div>

              <div className="admin-content-block">
                <p className="ui-label">Details</p>
                <div className="admin-content-block">
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

              <div className="admin-content-block">
                <div>Created {formatDate(selectedProject.createdAt)}</div>
                <div className="admin-content-block">Updated {formatDate(selectedProject.updatedAt)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

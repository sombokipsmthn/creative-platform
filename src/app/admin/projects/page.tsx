'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Eye, EyeOff, Mail, MapPin, Phone, Star, Trash2 } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    <div className="min-h-screen max-w-full overflow-x-hidden px-4 py-8 font-sans transition-colors duration-300 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
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
          secondaryActions={[
            <Button
              key="view-toggle"
              variant="ghost"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
            >
              {viewMode === 'grid' ? '✓' : '□'}
            </Button>
          ]}
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
            <div key={String(label)} className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm min-h-[6.5rem]">
              <p className={`text-sm font-medium text-muted-foreground ${color}`}>{label}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-stretch gap-4 rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              type="text"
              placeholder="Search projects by name, description, client..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full md:w-64"
            />

            <Select value={filterClient ?? 'all'} onValueChange={(value) => setFilterClient(value === 'all' ? null : value)}>
              <SelectTrigger className="w-full md:w-64"><SelectValue placeholder="All Clients" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>{client.name} {client.company ? `(${client.company})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-w-16 aspect-h-10 rounded-xl border border-dashed animate-pulse">
                <div className="h-full w-full flex items-center justify-center bg-purple-50 dark:bg-purple-900/20">
                  <div className="h-12 w-12 rounded-2xl bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">- -</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="h-24 w-24 rounded-full border border-dashed animate-pulse bg-purple-50 dark:bg-purple-900/20">
                <div className="h-12 w-12 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">- -</span>
                </div>
              </div>
              <p className="text-lg font-medium text-slate-600 dark:text-zinc-400">No projects found.</p>
              <p className="text-sm text-slate-500 dark:text-zinc-500">
                Create a project or adjust your current search and filters.
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => openCreateModal()}
                  variant="primary"
                  className="px-6 py-3"
                >
                  Create your first project
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="admin-content-block">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl border bg-card text-card-foreground shadow-sm rounded-xl border bg-card text-card-foreground shadow-sm transition-colors hover:border-primary/50 group flex flex-col gap-5 p-5 shadow-sm transition-all hover:border-purple-600/50 dark:shadow-none sm:p-6 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-2xl bg-purple-100">
                    {project.coverMediaId ? (
                      <div className="h-full w-full bg-purple-100">
                        <img
                          src={`/api/projects/${project.id}/media?cover=true`}
                          alt={`${project.name} cover`}
                          className="h-full w-full object-cover rounded-2xl"
                          onError={(e) => {
                            e.target.src = '/api/projects/placeholder.svg';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-purple-700 dark:text-purple-300">
                        {getInitials(project)}
                      </div>
                    )}
                  </div>

                  <div className="admin-content-block">
                    <div className="admin-content-block">
                      <h3 className="admin-content-block">
                        {project.name}
                      </h3>
                      <Badge variant={project.status === 'active' ? 'success' : project.status === 'completed' ? 'default' : project.status === 'on hold' ? 'warning' : project.status === 'cancelled' ? 'destructive' : 'secondary'}>
                        {statusLabel(project.status)}
                      </Badge>
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

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">PROJECTS</p>
                <h2 className="text-2xl font-semibold tracking-tight">New Project</h2>
              </div>

              {error && <div className="admin-content-block">{error}</div>}

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Project Name *</label>
                  <Input required type="text" placeholder="e.g. 2026 Brand Campaign" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Client</label>
                  <Select value={form.clientId || 'none'} onValueChange={(value) => setForm({ ...form, clientId: value === 'none' ? '' : value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a client (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select a client (optional)</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} {client.company ? `(${client.company})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Description</label>
                    <Textarea
                      rows={2}
                      placeholder="Brief project description..."
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Short Description</label>
                    <Input
                      type="text"
                      placeholder="One-line summary for portfolio cards"
                      value={form.shortDescription}
                      onChange={(event) => setForm({ ...form, shortDescription: event.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Category</label>
                    <Select value={form.category || 'none'} onValueChange={(value) => setForm({ ...form, category: value === 'none' ? '' : value })}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select category</SelectItem>
                        <SelectItem value="Photography">Photography</SelectItem>
                        <SelectItem value="Videography">Videography</SelectItem>
                        <SelectItem value="Branding">Branding</SelectItem>
                        <SelectItem value="UI/UX">UI/UX</SelectItem>
                        <SelectItem value="Motion">Motion Graphics</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Year</label>
                    <Input
                      type="text"
                      placeholder="e.g. 2026"
                      value={form.year}
                      onChange={(event) => setForm({ ...form, year: event.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Location</label>
                    <Input
                      type="text"
                      placeholder="e.g. Nairobi, Kenya"
                      value={form.location}
                      onChange={(event) => setForm({ ...form, location: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Slug</label>
                    <Input
                      type="text"
                      placeholder="auto-generated from name"
                      value={form.slug}
                      onChange={(event) => setForm({ ...form, slug: event.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Status</label>
                    <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as ProjectStatus })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="on hold">On Hold</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Visibility</label>
                    <Select value={form.visibility} onValueChange={(value) => setForm({ ...form, visibility: value as 'public' | 'private' | 'draft' })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="private">Private</SelectItem><SelectItem value="public">Public</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Start Date</label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">End Date</label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(event) => setForm({ ...form, endDate: event.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Total Amount</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={form.totalAmount}
                      onChange={(event) => setForm({ ...form, totalAmount: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Currency</label>
                    <Select value={form.currency} onValueChange={(value) => setForm({ ...form, currency: value })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KES">KES</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="ZAR">ZAR</SelectItem><SelectItem value="NGN">NGN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Payment Terms</label>
                    <Input
                      type="text"
                      placeholder="e.g. 50% deposit, 50% on delivery"
                      value={form.paymentTerms}
                      onChange={(event) => setForm({ ...form, paymentTerms: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Revisions Policy</label>
                    <Input
                      type="text"
                      placeholder="e.g. 2 rounds of revisions included"
                      value={form.revisionsPolicy}
                      onChange={(event) => setForm({ ...form, revisionsPolicy: event.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Licensing Terms</label>
                    <Input
                      type="text"
                      placeholder="e.g. Commercial use rights"
                      value={form.licensingTerms}
                      onChange={(event) => setForm({ ...form, licensingTerms: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Featured</label>
                    <Select value={form.featured ? 'true' : 'false'} onValueChange={(value) => setForm({ ...form, featured: value === 'true' })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="false">No</SelectItem><SelectItem value="true">Yes</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Notice Period</label>
                  <Input
                    type="text"
                    placeholder="e.g. 14 days"
                    value={form.noticePeriod}
                    onChange={(event) => setForm({ ...form, noticePeriod: event.target.value })}
                  />
                </div>
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
                  <p className="text-sm font-medium leading-none">Project Status</p>
                  <p className="text-sm text-muted-foreground">Changes are saved directly to the database.</p>
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

              <div className="space-y-2">
                <p className="text-sm font-medium leading-none">Description</p>
                <p className="text-sm text-slate-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {selectedProject.description || 'No description.'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium leading-none">Details</p>
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

'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Eye, EyeOff, Mail, MapPin, Phone, RefreshCw, Star, Trash2 } from 'lucide-react';
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
import StatusBadge from '@/components/admin/StatusBadge';
import StatCards from '@/components/admin/StatCards';
import { AdminResourceToolbar, type AdminFilterConfig, type AdminToolbarAction } from '@/components/admin/AdminResourceToolbar';
import type { SavedView } from '@/components/admin/AdminDataTable';

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
  const [refreshing, setRefreshing] = useState(false);

  // Saved views state
  const [savedViews, setSavedViews] = useState<SavedView<Project>[]>([
    { id: 'active-projects', name: 'Active Projects', filters: { status: 'active' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isDefault: true },
    { id: 'featured-projects', name: 'Featured Projects', filters: { featured: 'true' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'public-projects', name: 'Public Projects', filters: { visibility: 'public' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'draft-projects', name: 'Draft Projects', filters: { status: 'draft' }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ]);
  const [activeViewId, setActiveViewId] = useState<string>('');

  function handleSaveView(view: Omit<SavedView<Project>, 'id'>) {
    const newView: SavedView<Project> = {
      ...view,
      id: `view-${Date.now()}`,
      filters: { status: filterStatus, client: filterClient, visibility: filterVisibility, featured: filterFeatured, search: searchQuery },
    };
    setSavedViews(prev => [...prev, newView]);
    setActiveViewId(newView.id);
  }

  function handleDeleteView(viewId: string) {
    setSavedViews(prev => prev.filter(v => v.id !== viewId));
    if (activeViewId === viewId) setActiveViewId('');
  }

  function handleSetActiveView(viewId: string) {
    setActiveViewId(viewId);
    const view = savedViews.find(v => v.id === viewId);
    if (view) {
      if (view.filters.status) setFilterStatus(view.filters.status as 'ALL' | ProjectStatus);
      if (view.filters.client) setFilterClient(view.filters.client);
      if (view.filters.visibility) setFilterVisibility(view.filters.visibility as 'ALL' | 'public' | 'private' | 'draft');
      if (view.filters.featured) setFilterFeatured(view.filters.featured as 'ALL' | 'true' | 'false');
      if (view.filters.search) setSearchQuery(view.filters.search);
    } else {
      // Default view - clear filters
      setFilterStatus('ALL');
      setFilterClient(null);
      setFilterVisibility('ALL');
      setFilterFeatured('ALL');
      setSearchQuery('');
    }
  }

  const loadData = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
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
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Unable to load projects. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterClient, filterStatus, filterVisibility, filterFeatured]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8">
          <StatCards
            stats={[
              { label: 'Total Projects', value: String(projects.length), detail: 'Active: ' + String(activeCount), color: 'default' },
              { label: 'Draft', value: String(draftCount), detail: '', color: 'default' },
              { label: 'Published', value: String(publishedCount), detail: '', color: 'success' },
              { label: 'Featured', value: String(featuredCount), detail: '', color: 'warning' },
              { label: 'Active', value: String(activeCount), detail: '', color: 'success' },
              { label: 'Completed', value: String(completedCount), detail: '', color: 'default' },
            ]}
            columns={4}
          />
        </div>

        {/* Admin Resource Toolbar */}
        <AdminResourceToolbar
          search={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search projects by name, description, client…"
          filters={[
            {
              id: 'status',
              label: 'Status',
              value: filterStatus.toLowerCase(),
              options: [
                { label: 'All', value: 'all' },
                ...(['active', 'completed', 'on hold', 'cancelled', 'draft'] as ProjectStatus[]).map((value) => ({ label: statusLabel(value), value })),
              ],
            },
            {
              id: 'visibility',
              label: 'Visibility',
              value: filterVisibility.toLowerCase(),
              options: [
                { label: 'All', value: 'all' },
                { label: 'Public', value: 'public' },
                { label: 'Private', value: 'private' },
                { label: 'Draft', value: 'draft' },
              ],
            },
            {
              id: 'featured',
              label: 'Featured',
              value: filterFeatured.toLowerCase(),
              options: [
                { label: 'All', value: 'all' },
                { label: 'Yes', value: 'true' },
                { label: 'No', value: 'false' },
              ],
            },
            {
              id: 'client',
              label: 'Client',
              value: filterClient ?? 'all',
              options: [
                { label: 'All Clients', value: 'all' },
                ...clients.map((client) => ({
                  label: client.name + (client.company ? ` (${client.company})` : ''),
                  value: client.id,
                })),
              ],
            },
          ] as AdminFilterConfig[]}
          onFilterChange={(id, value) => {
            if (id === 'status') setFilterStatus(value === 'all' ? 'ALL' : value as ProjectStatus);
            if (id === 'visibility') setFilterVisibility(value === 'all' ? 'ALL' : value as 'public' | 'private' | 'draft');
            if (id === 'featured') setFilterFeatured(value === 'all' ? 'ALL' : value as 'true' | 'false');
            if (id === 'client') setFilterClient(value === 'all' ? null : value ?? null);
          }}
          onClearAll={() => {
            setSearchQuery('');
            setFilterStatus('ALL');
            setFilterVisibility('ALL');
            setFilterFeatured('ALL');
            setFilterClient(null);
          }}
          secondaryActions={[
            {
              label: 'Refresh',
              onClick: () => void loadData(true),
              variant: 'ghost',
              size: 'icon',
              icon: <RefreshCw className="h-4 w-4" />,
            } as AdminToolbarAction,
          ]}
          resultCount={projects.length}
          filteredCount={filteredProjects.length}
          resultLabel="Projects"
          loading={loading}
        />

        <AdminDataTable
          rows={filteredProjects}
          loading={loading}
          error={error && !isAddProjectOpen && !selectedProject ? error : null}
          emptyTitle="No projects found"
          emptyDescription="Create a project to start tracking a client engagement."
          emptyAction={<Button type="button" onClick={() => openCreateModal()}>Create your first project</Button>}
          selectable
          getRowLabel={(project) => project.name}
          mobileCard={(project, actions) => <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-medium">{project.name}</p><p className="text-sm text-muted-foreground">{project.client?.name || 'No client'}</p><div className="mt-2 flex flex-wrap gap-2"><Badge variant={project.status === 'active' ? 'success' : project.status === 'completed' ? 'default' : project.status === 'on hold' ? 'warning' : project.status === 'cancelled' ? 'destructive' : 'secondary'}>{statusLabel(project.status)}</Badge>{project.featured && <Badge variant="warning"><Star className="mr-1 h-3 w-3" />Featured</Badge>}{project.visibility === 'public' && <Badge variant="success"><Eye className="mr-1 h-3 w-3" />Public</Badge>}</div></div>{actions}</div>}
          columns={[
            { id: 'project', header: 'Project', cell: (project) => <div><p className="font-medium">{project.name}</p><p className="text-xs text-muted-foreground">{project.client?.name || 'No client'}</p></div>, accessor: (project) => project.name, sortable: true },
            { id: 'status', header: 'Status', cell: (project) => <StatusBadge status={project.status} />, accessor: (project) => project.status },
            { id: 'visibility', header: 'Visibility', cell: (project) => <div className="flex flex-wrap gap-1">{project.visibility === 'public' && <Badge variant="success"><Eye className="mr-1 h-3 w-3" />Public</Badge>}{project.visibility === 'private' && <Badge variant="secondary"><EyeOff className="mr-1 h-3 w-3" />Private</Badge>}{project.visibility === 'draft' && <Badge variant="warning">Draft</Badge>}{project.featured && <Badge variant="warning"><Star className="mr-1 h-3 w-3" />Featured</Badge>}</div>, hideOnMobile: true },
            { id: 'dates', header: 'Timeline', cell: (project) => <div><p>{project.startDate || project.endDate ? `${formatDate(project.startDate)} – ${formatDate(project.endDate)}` : '—'}</p><p className="text-xs text-muted-foreground">Added {formatDate(project.createdAt)}</p></div>, hideOnMobile: true },
          ]}
          rowActions={[
            { label: 'View project', onSelect: (project) => { setError(''); setSelectedProject(project); } },
            { label: 'Edit', onSelect: (project) => window.location.assign(`/admin/projects/${project.id}`) },
            { label: 'Preview', hidden: (project) => !project.slug || project.visibility !== 'public', onSelect: (project) => window.open(`/work/${project.slug}`, '_blank', 'noopener,noreferrer') },
            { label: 'Delete', destructive: true, onSelect: async (project) => { if (!confirm('Delete this project? This cannot be undone.')) return; const response = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' }); if (response.ok) setProjects((current) => current.filter((item) => item.id !== project.id)); else setError('Failed to delete project.'); } },
          ]}
          savedViews={savedViews}
          activeViewId={activeViewId}
          onSaveView={handleSaveView}
          onDeleteView={handleDeleteView}
          onSetActiveView={handleSetActiveView}
          viewName="Project View"
        />

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
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">PROJECTS</p>
                <h2 className="text-2xl font-semibold tracking-tight">New Project</h2>
              </div>

              {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-700 dark:text-red-300">{error}</div>}

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
                    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-sans bg-primary/10 text-primary dark:text-primary rounded-full">
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
                  <p className="text-sm font-medium leading-none">Project Status</p>
                  <p className="text-sm text-muted-foreground">Changes are saved directly to the database.</p>
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

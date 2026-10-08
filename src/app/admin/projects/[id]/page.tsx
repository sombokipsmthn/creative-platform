'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowUpRight, Eye, Loader2, Save, Star, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';

const resolveImage = (source?: string | null, fallbackUrl?: string) => {
  if (!source) return fallbackUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80';
  if (source.startsWith('http://') || source.startsWith('https://')) return source;
  return `https://lh3.googleusercontent.com/d/${source}`;
};

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
  status: string;
  visibility: string | null;
  featured: boolean | null;
  coverMediaId: string | null;
  startDate: string | null;
  endDate: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    website: string | null;
  } | null;
  media: Array<{
    id: string;
    filename: string;
    displayUrl: string;
    thumbnailUrl: string;
    altText: string | null;
    caption: string | null;
    sortOrder: number;
    isHidden: boolean;
    isCover: boolean;
    mimeType: string | null;
  }>;
};

type FormData = {
  name: string;
  description: string;
  shortDescription: string;
  slug: string;
  category: string;
  year: string;
  location: string;
  services: string;
  disciplines: string;
  collaborators: string;
  role: string;
  scopeOfWork: string;
  deliverables: string;
  totalAmount: string;
  currency: string;
  paymentTerms: string;
  revisionsPolicy: string;
  licensingTerms: string;
  noticePeriod: string;
  storyOverview: string;
  storyChallenge: string;
  storyApproach: string;
  storyOutcome: string;
  storyCredits: string;
  status: string;
  visibility: string;
  featured: boolean;
  clientId: string;
  startDate: string;
  endDate: string;
};

const emptyForm = (): FormData => ({
  name: '',
  description: '',
  shortDescription: '',
  slug: '',
  category: '',
  year: '',
  location: '',
  services: '',
  disciplines: '',
  collaborators: '',
  role: '',
  scopeOfWork: '',
  deliverables: '',
  totalAmount: '',
  currency: 'KES',
  paymentTerms: '',
  revisionsPolicy: '',
  licensingTerms: '',
  noticePeriod: '',
  storyOverview: '',
  storyChallenge: '',
  storyApproach: '',
  storyOutcome: '',
  storyCredits: '',
  status: 'draft',
  visibility: 'private',
  featured: false,
  clientId: '',
  startDate: '',
  endDate: '',
});

type TabId = 'basic' | 'story' | 'media' | 'settings';

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'story', label: 'Story' },
  { id: 'media', label: 'Media' },
  { id: 'settings', label: 'Portfolio Settings' },
];

export default function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const [project, setProject] = useState<Project | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      try {
        setLoading(true);
        setError('');

        const { id } = await params;
        const response = await fetch(`/api/projects/${id}`, { cache: 'no-store' });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Project not found.');
            return;
          }
          throw new Error('Failed to load project');
        }

        const data = await response.json();
        const p = data.project;

        if (!cancelled) {
          setProject(p);
          setForm({
            name: p.name || '',
            description: p.description || '',
            shortDescription: p.shortDescription || '',
            slug: p.slug || '',
            category: p.category || '',
            year: p.year || '',
            location: p.location || '',
            services: Array.isArray(p.services) ? p.services.join(', ') : '',
            disciplines: Array.isArray(p.disciplines) ? p.disciplines.join(', ') : '',
            collaborators: Array.isArray(p.collaborators) ? p.collaborators.join(', ') : '',
            role: p.role || '',
            scopeOfWork: p.scopeOfWork || '',
            deliverables: p.deliverables || '',
            totalAmount: p.totalAmount?.toString() || '',
            currency: p.currency || 'KES',
            paymentTerms: p.paymentTerms || '',
            revisionsPolicy: p.revisionsPolicy || '',
            licensingTerms: p.licensingTerms || '',
            noticePeriod: p.noticePeriod || '',
            storyOverview: p.storyOverview || '',
            storyChallenge: p.storyChallenge || '',
            storyApproach: p.storyApproach || '',
            storyOutcome: p.storyOutcome || '',
            storyCredits: p.storyCredits || '',
            status: p.status || 'draft',
            visibility: p.visibility || 'private',
            featured: p.featured || false,
            clientId: p.client?.id || '',
            startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
            endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : '',
          });
        }
      } catch (err) {
        console.error('Failed to load project:', err);
        if (!cancelled) {
          setError('Unable to load project. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSave(statusOverride?: string) {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const body: Record<string, unknown> = { ...form };
      if (statusOverride) {
        body.status = statusOverride;
        body.visibility = statusOverride === 'published' ? 'public' : form.visibility;
      }

      const response = await fetch(`/api/projects/${project?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update project');
      }

      setProject(data.project);
      setSuccess('Project saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save project:', err);
      setError(err instanceof Error ? err.message : 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    try {
      setSaving(true);
      setError('');

      const response = await fetch(`/api/projects/${project?.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to publish project');
      }

      setProject(data.project);
      setForm((prev) => ({ ...prev, status: 'published', visibility: 'public' }));
      setSuccess('Project published successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to publish project:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish project.');
    } finally {
      setSaving(false);
    }
  }

  async function handleUnpublish() {
    try {
      setSaving(true);
      setError('');

      const response = await fetch(`/api/projects/${project?.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish: false }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to unpublish project');
      }

      setProject(data.project);
      setForm((prev) => ({ ...prev, status: 'draft', visibility: 'private' }));
      setSuccess('Project unpublished.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to unpublish project:', err);
      setError(err instanceof Error ? err.message : 'Failed to unpublish project.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!project || !confirm('Delete this project? This cannot be undone.')) return;

    try {
      setSaving(true);
      setError('');

      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || 'Failed to delete project');
      }

      window.location.href = '/admin/projects';
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview() {
    if (!project?.slug) return;
    window.open(`/work/${project.slug}`, '_blank');
  }

  const previewUrl = project?.slug ? `/work/${project.slug}` : null;

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8 font-sans transition-colors duration-300 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-3 text-sm text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Loading project…</span>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen px-4 py-8 font-sans transition-colors duration-300 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <AdminPageHeader title="Projects" breadcrumb={{ label: 'Dashboard', href: '/admin' }} />
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
          <Link href="/admin/projects" className="text-xs font-sans uppercase tracking-widest text-purple-600 hover:underline">
            ← Back to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 font-sans transition-colors duration-300 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminPageHeader
          title="Edit Project"
          breadcrumb={{ label: 'Projects', href: '/admin/projects' }}
          primaryAction={
            <div className="flex gap-2">
              {previewUrl && (
                <Button variant="secondary" onClick={handlePreview} className="text-xs font-sans uppercase tracking-widest">
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Preview
                </Button>
              )}
              <Button variant="primary" onClick={() => handleSave('published')} disabled={saving} className="text-xs font-sans uppercase tracking-widest">
                {saving ? 'Saving…' : 'Publish'}
              </Button>
            </div>
          }
        />

        {error && (
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-300">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-sans uppercase tracking-widest rounded-t-lg transition ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6 p-6 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950/40">
            <div className="space-y-1">
              <label className="ui-label">Project Name *</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="ui-input"
                placeholder="e.g. 2026 Brand Campaign"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="ui-label">Category</label>
                <select value={form.category} onChange={(e) => handleChange('category', e.target.value)} className="ui-input">
                  <option value="">Select category</option>
                  <option value="Photography">Photography</option>
                  <option value="Videography">Videography</option>
                  <option value="Branding">Branding</option>
                  <option value="UI/UX">UI/UX</option>
                  <option value="Motion">Motion Graphics</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="ui-label">Year</label>
                <input type="text" value={form.year} onChange={(e) => handleChange('year', e.target.value)} className="ui-input" placeholder="e.g. 2026" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="ui-label">Location</label>
                <input type="text" value={form.location} onChange={(e) => handleChange('location', e.target.value)} className="ui-input" placeholder="e.g. Nairobi, Kenya" />
              </div>
              <div className="space-y-1">
                <label className="ui-label">Role</label>
                <input type="text" value={form.role} onChange={(e) => handleChange('role', e.target.value)} className="ui-input" placeholder="e.g. Creative Director" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="ui-label">Short Description</label>
              <input type="text" value={form.shortDescription} onChange={(e) => handleChange('shortDescription', e.target.value)} className="ui-input" placeholder="One-line summary for portfolio cards" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="ui-label">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} className="ui-input" placeholder="Auto-generated from name" />
              </div>
              <div className="space-y-1">
                <label className="ui-label">Client</label>
                <select value={form.clientId} onChange={(e) => handleChange('clientId', e.target.value)} className="ui-input">
                  <option value="">No client</option>
                  {/* Client dropdown would be populated from API */}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="ui-label">Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => handleChange('startDate', e.target.value)} className="ui-input" />
              </div>
              <div className="space-y-1">
                <label className="ui-label">End Date</label>
                <input type="date" value={form.endDate} onChange={(e) => handleChange('endDate', e.target.value)} className="ui-input" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="ui-label">Total Amount</label>
                <input type="number" value={form.totalAmount} onChange={(e) => handleChange('totalAmount', e.target.value)} className="ui-input" placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="ui-label">Currency</label>
                <select value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} className="ui-input">
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="ZAR">ZAR</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="ui-label">Description</label>
              <textarea rows={4} value={form.description} onChange={(e) => handleChange('description', e.target.value)} className="ui-input" placeholder="Full project description..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="ui-label">Scope of Work</label>
                <textarea rows={3} value={form.scopeOfWork} onChange={(e) => handleChange('scopeOfWork', e.target.value)} className="ui-input" placeholder="..." />
              </div>
              <div className="space-y-1">
                <label className="ui-label">Deliverables</label>
                <textarea rows={3} value={form.deliverables} onChange={(e) => handleChange('deliverables', e.target.value)} className="ui-input" placeholder="..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="ui-label">Payment Terms</label>
                <input type="text" value={form.paymentTerms} onChange={(e) => handleChange('paymentTerms', e.target.value)} className="ui-input" placeholder="e.g. 50% deposit, 50% on delivery" />
              </div>
              <div className="space-y-1">
                <label className="ui-label">Revisions Policy</label>
                <input type="text" value={form.revisionsPolicy} onChange={(e) => handleChange('revisionsPolicy', e.target.value)} className="ui-input" placeholder="e.g. 2 rounds of revisions included" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="ui-label">Licensing Terms</label>
                <input type="text" value={form.licensingTerms} onChange={(e) => handleChange('licensingTerms', e.target.value)} className="ui-input" placeholder="e.g. Commercial use rights" />
              </div>
              <div className="space-y-1">
                <label className="ui-label">Notice Period</label>
                <input type="text" value={form.noticePeriod} onChange={(e) => handleChange('noticePeriod', e.target.value)} className="ui-input" placeholder="e.g. 14 days" />
              </div>
            </div>
          </div>
        )}

        {/* Story Tab */}
        {activeTab === 'story' && (
          <div className="space-y-6 p-6 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950/40">
            <div className="space-y-1">
              <label className="ui-label">Overview</label>
              <textarea rows={4} value={form.storyOverview} onChange={(e) => handleChange('storyOverview', e.target.value)} className="ui-input" placeholder="Project overview and context..." />
            </div>
            <div className="space-y-1">
              <label className="ui-label">Challenge / Context</label>
              <textarea rows={4} value={form.storyChallenge} onChange={(e) => handleChange('storyChallenge', e.target.value)} className="ui-input" placeholder="What was the challenge?" />
            </div>
            <div className="space-y-1">
              <label className="ui-label">Approach</label>
              <textarea rows={4} value={form.storyApproach} onChange={(e) => handleChange('storyApproach', e.target.value)} className="ui-input" placeholder="How did you approach it?" />
            </div>
            <div className="space-y-1">
              <label className="ui-label">Outcome &amp; Impact</label>
              <textarea rows={4} value={form.storyOutcome} onChange={(e) => handleChange('storyOutcome', e.target.value)} className="ui-input" placeholder="What was the result?" />
            </div>
            <div className="space-y-1">
              <label className="ui-label">Credits</label>
              <textarea rows={3} value={form.storyCredits} onChange={(e) => handleChange('storyCredits', e.target.value)} className="ui-input" placeholder="Credits and acknowledgments..." />
            </div>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="space-y-6 p-6 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950/40">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Project Media</h3>
              <Button variant="secondary" size="sm" disabled={uploading} className="text-xs">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                {uploading ? 'Uploading…' : 'Add Media'}
              </Button>
            </div>

            {project?.media && project.media.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-300 dark:border-zinc-800 rounded-xl">
                <p className="text-sm text-slate-500 dark:text-zinc-400">No media uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project?.media.map((media) => (
                  <div key={media.id} className="relative border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden group">
                    <div className="relative aspect-4/3">
                      <img src={resolveImage(media.displayUrl)} alt={media.altText || ''} className="object-cover w-full h-full" />
                      {media.isCover && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-600 text-white text-[10px] font-sans uppercase tracking-widest rounded-sm">Cover</div>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{media.filename}</p>
                      <input
                        type="text"
                        value={media.altText || ''}
                        onChange={(e) => {
                          /* Alt text update handled in API */
                        }}
                        className="ui-input text-xs"
                        placeholder="Alt text"
                      />
                      <input
                        type="text"
                        value={media.caption || ''}
                        onChange={(e) => {}}
                        className="ui-input text-xs"
                        placeholder="Caption"
                      />
                    </div>
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6 bg-white/80" aria-label="Set as cover">
                        <Star className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 bg-white/80" aria-label="Delete media">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6 p-6 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950/40">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="ui-label">Status</label>
                <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="ui-input">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="ui-label">Visibility</label>
                <select value={form.visibility} onChange={(e) => handleChange('visibility', e.target.value)} className="ui-input">
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="ui-label">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} className="ui-input" placeholder="Human-readable URL slug" />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => handleChange('featured', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="featured" className="text-sm text-slate-700 dark:text-zinc-300">Featured project</label>
            </div>

            <div className="border-t border-slate-200 dark:border-zinc-800 pt-4 space-y-2">
              <p className="ui-label">Project Status</p>
              <p className="ui-meta">Published projects are visible to the public at /work/{form.slug || '[slug]'}.</p>
            </div>

            {previewUrl && (
              <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl">
                <Eye className="h-5 w-5 text-slate-400" />
                <Link href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline">
                  View public page
                </Link>
              </div>
            )}

            {project?.publishedAt && (
              <div className="text-xs font-sans uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                Published at {new Date(project.publishedAt).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            )}
          </div>
        )}

        {/* Save actions */}
        <div className="flex flex-wrap gap-3 pb-8">
          <Button variant="primary" onClick={() => handleSave()} disabled={saving} className="text-xs font-sans uppercase tracking-widest">
            <Save className="h-3.5 w-3.5 mr-1" />
            {saving ? 'Saving…' : 'Save Draft'}
          </Button>
          <Button variant="secondary" onClick={handlePreview} disabled={!previewUrl} className="text-xs font-sans uppercase tracking-widest">
            <Eye className="h-3.5 w-3.5 mr-1" />
            Preview
          </Button>
          <Button variant="primary" onClick={() => handlePublish()} disabled={saving || project?.visibility === 'public'} className="text-xs font-sans uppercase tracking-widest">
            Publish
          </Button>
          {project?.visibility === 'public' && (
            <Button variant="secondary" onClick={() => handleUnpublish()} disabled={saving} className="text-xs font-sans uppercase tracking-widest">
              Unpublish
            </Button>
          )}
          <Button variant="ghost" onClick={handleDelete} disabled={saving} className="text-xs font-sans uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-500/10">
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
          <Link href="/admin/projects" className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-slate-500 hover:text-purple-600 transition">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to projects
          </Link>
        </div>
      </div>
    </div>
  );
}
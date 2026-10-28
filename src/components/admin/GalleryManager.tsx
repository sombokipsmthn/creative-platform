'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ActivityIcon as Activity, CheckCircle as CheckCircle2, Clock, Copy, Download, ArrowSquareOut as ExternalLink, Eye, Heart, Image as ImageIcon, GridFour as LayoutGrid, List, ChatText as MessageSquare, Plus, ArrowsClockwise as RefreshCw, Gear as Settings, ShareNetwork as Share2, Sliders, Sparkle as Sparkles, Trash as Trash2, Users } from "@phosphor-icons/react";

import AdminDataTable from '@/components/admin/AdminDataTable';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { StandardCreationDialog } from '@/components/admin/StandardCreationDialog';
import { SelectCompat } from '@/components/ui/select-compat';
import { Button } from '@/components/ui/button';
import { AdminResourceToolbar, type AdminFilterConfig, type AdminToolbarAction } from '@/components/admin/AdminResourceToolbar';

interface GalleryItem {
  id: string;
  title: string;
  client_id: string | null;
  client_name: string | null;
  category: string | null;
  slug: string;
  access_pin: string | null;
  status: 'draft' | 'published';
  allow_downloads: boolean;
  cover_url: string | null;
  photo_count: number;
  collections_count?: number;
  created_at: string;
  favorites_count?: number;
  selections_count?: number;
  comments_count?: number;
  downloads_count?: number;
  views_count?: number;
  last_activity_at?: string | null;
}

interface ActivityItem {
  id: string;
  gallery_id: string;
  gallery_title: string;
  client_name: string | null;
  activity_type: 'favorite' | 'selection' | 'selection_and_favorite' | 'comment' | 'download' | 'view' | 'update';
  photo_url: string | null;
  created_at: string;
}

interface ClientOption {
  id: string;
  name: string;
  company: string | null;
}

const CATEGORY_OPTIONS = [
  'Ecosystem Storytelling',
  'Brand Films & Media',
  'Commercial Photography',
  'Corporate Portraiture',
  'Event Coverage',
  'Documentary & Fieldwork',
  'Motion Graphics',
];

export default function AdminGalleryManagerPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'all' | 'create' | 'activity'>('all');
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter states for the gallery grid
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [galleryView, setGalleryView] = useState<'grid' | 'list'>('grid');
  const [savedViews, setSavedViews] = useState<Array<{ id: string; name: string; search: string; status: 'all' | 'draft' | 'published'; category: string }>>([]);
  const [activeSavedViewId, setActiveSavedViewId] = useState('');

  useEffect(() => {
    const savedView = window.localStorage.getItem('kipsmthn-gallery-view');
    if (savedView === 'grid' || savedView === 'list') setGalleryView(savedView);
    try {
      const storedFilters = window.localStorage.getItem('creative-platform:galleries:saved-filters');
      if (storedFilters) setSavedViews(JSON.parse(storedFilters));
    } catch {
      window.localStorage.removeItem('creative-platform:galleries:saved-filters');
    }

    if (new URLSearchParams(window.location.search).get('new') === 'true') {
      setActiveTab('create');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  function changeGalleryView(view: 'grid' | 'list') {
    setGalleryView(view);
    window.localStorage.setItem('kipsmthn-gallery-view', view);
  }

  function saveCurrentFilter() {
    const name = window.prompt('Name this gallery filter');
    if (!name?.trim()) return;
    const view = { id: `gallery-filter-${Date.now()}`, name: name.trim(), search: searchQuery, status: filterStatus, category: filterCategory };
    const next = [...savedViews, view];
    setSavedViews(next);
    setActiveSavedViewId(view.id);
    window.localStorage.setItem('creative-platform:galleries:saved-filters', JSON.stringify(next));
  }

  function applySavedFilter(id: string) {
    setActiveSavedViewId(id);
    const view = savedViews.find((item) => item.id === id);
    setSearchQuery(view?.search ?? '');
    setFilterStatus(view?.status ?? 'all');
    setFilterCategory(view?.category ?? 'all');
  }

  function deleteSavedFilter(id: string) {
    const next = savedViews.filter((item) => item.id !== id);
    setSavedViews(next);
    if (activeSavedViewId === id) setActiveSavedViewId('');
    window.localStorage.setItem('creative-platform:galleries:saved-filters', JSON.stringify(next));
  }

  // Form states for creating new gallery
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [pin, setPin] = useState('');
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [allowFavorites, setAllowFavorites] = useState(true);
  const [allowSelections, setAllowSelections] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  /* =========================================================
     FETCH DATA (Memoized for polling)
     ========================================================= */

  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);

      const [galRes, clientRes, activityRes] = await Promise.all([
        fetch('/api/galleries', { cache: 'no-store', credentials: 'same-origin' }),
        fetch('/api/clients', { cache: 'no-store', credentials: 'same-origin' }),
        fetch('/api/galleries/activity', { cache: 'no-store', credentials: 'same-origin' }),
      ]);

      if (galRes.ok) {
        const data = await galRes.json();
        setGalleries(data.galleries || []);
      } else {
        console.error('Failed to fetch galleries:', galRes.status, galRes.statusText);
        const errorData = await galRes.json().catch(() => ({}));
        console.error('Gallery error response:', errorData);
      }
      if (clientRes.ok) {
        const clientData = await clientRes.json();
        const clientList = Array.isArray(clientData)
          ? clientData
          : clientData.clients || [];
        setClients(clientList);
      }
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        // Check if there's new activity to show a silent notification or just update
        const newActivities = activityData.activity || [];
        if (isSilent && newActivities.length > activities.length && activeTab !== 'activity') {
          // Could show a subtle "New Activity" indicator here
        }
        setActivities(newActivities);
      }
    } catch (err) {
      if (!isSilent) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load data.'
        );
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activities.length, activeTab]);

  /* =========================================================
     INITIAL LOAD & POLLING
     ========================================================= */

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void fetchData();
    }, 0);

    // Poll for new activity every 30 seconds
    const pollInterval = setInterval(() => {
      fetchData(true);
    }, 30000);

    return () => {
      window.clearTimeout(initialLoad);
      clearInterval(pollInterval);
    };
  }, [fetchData]);

  /* =========================================================
     CREATE GALLERY
     ========================================================= */

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please fill in the Gallery Title.');
      return;
    }

    try {
      setIsCreating(true);
      setErrorMessage(null);

      const res = await fetch('/api/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          clientId: clientId || null,
          category,
          accessPin: pin.trim() || null,
          allowDownloads,
          allowFavorites,
          allowSelections,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create gallery.');
      }

      const data = await res.json();
      const createdGal = data.gallery;

      showToast(`✓ Gallery "${createdGal.title}" created.`);

      // Navigate directly into the new Gallery Edit Manager!
      router.push(`/admin/galleries/${createdGal.id}`);
    } catch (err) {
      console.error('handleCreateGallery error:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to create gallery.'
      );
      setIsCreating(false);
    }
  };

  /* =========================================================
     DELETE GALLERY
     ========================================================= */

  const handleDeleteGallery = async (galId: string, galTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${galTitle}"? This will permanently delete its collections and photos.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/galleries/${galId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete gallery.');
      }

      setGalleries((prev) => prev.filter((g) => g.id !== galId));
      showToast(`✓ Gallery "${galTitle}" deleted.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting gallery');
    }
  };

  const copyShareLink = (slugOrId: string) => {
    const link = `${window.location.origin}/portal/g/${slugOrId}`;
    navigator.clipboard.writeText(link);
    showToast('✓ Client share link copied to clipboard!');
  };

  const copyPin = (pin: string | null) => {
    if (!pin) return;
    navigator.clipboard.writeText(pin);
    showToast('✓ PIN copied to clipboard!');
  };

  // Filtered galleries based on search and filters
  const filteredGalleries = galleries.filter((gal) => {
    // Search in title and client name
    const matchesSearch =
      gal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gal.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;

    // Status filter
    const matchesStatus =
      filterStatus === 'all' || gal.status === filterStatus;

    // Category filter
    const matchesCategory =
      filterCategory === 'all' || gal.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="ui-page admin-data-page transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-3 rounded-xl shadow-2xl text-[11px] font-sans flex items-center gap-3 animate-fade-in border border-white/10 dark:border-zinc-200">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="admin-data-page__content space-y-6">
        <AdminPageHeader
          title="Galleries"
          description="Manage client delivery, proofing & digital delivery portals."
          breadcrumb={{ label: 'Back to Studio', href: '/admin' }}
          className="mb-8"
          tabs={[
            { label: 'All Galleries', active: activeTab === 'all', onClick: () => setActiveTab('all') },
            { label: 'Activity', active: activeTab === 'activity', onClick: () => setActiveTab('activity') },
            { label: 'New Gallery', active: activeTab === 'create', onClick: () => setActiveTab('create') },
          ]}
        />

        {errorMessage && (
          <div className="ui-alert ui-alert-error">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="ml-auto hover:rotate-90 transition-transform">✕</button>
          </div>
        )}

        {/* TAB 1: ALL GALLERIES GRID */}
        {activeTab === 'all' && (
          <>
            <div className="space-y-6">
              <AdminResourceToolbar
                search={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search galleries by title, client, category…"
                filters={[
                  {
                    id: 'status',
                    label: 'Status',
                    value: filterStatus,
                    options: [
                      { label: 'All Statuses', value: 'all' },
                      { label: 'Draft', value: 'draft' },
                      { label: 'Published', value: 'published' },
                    ],
                  },
                  {
                    id: 'category',
                    label: 'Category',
                    value: filterCategory,
                    options: [
                      { label: 'All Categories', value: 'all' },
                      ...CATEGORY_OPTIONS.map((cat) => ({
                        label: cat,
                        value: cat,
                      })),
                    ],
                  },
                ] as AdminFilterConfig[]}
                onFilterChange={(id, value) => {
                  if (id === 'status') setFilterStatus(value as 'all' | 'draft' | 'published');
                  if (id === 'category') setFilterCategory(value ?? 'all');
                }}
                onClearAll={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterCategory('all');
                }}
                secondaryActions={[
                  {
                    label: '',
                    onClick: () => fetchData(true),
                    variant: 'outline',
                    size: 'sm',
                    icon: <RefreshCw className={isRefreshing ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />,
                    disabled: isRefreshing,
                  } as AdminToolbarAction,
                  {
                    label: galleryView === 'grid' ? 'Switch to list view' : 'Switch to grid view',
                    onClick: () => changeGalleryView(galleryView === 'grid' ? 'list' : 'grid'),
                    variant: 'outline',
                    size: 'icon',
                    icon: galleryView === 'grid'
                      ? <List className="h-4 w-4" />
                      : <LayoutGrid className="h-4 w-4" />,
                  } as AdminToolbarAction,
                ]}
                resultCount={galleries.length}
                filteredCount={filteredGalleries.length}
                resultLabel="Galleries"
                loading={isLoading}
              />

              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="gallery-saved-filter">Saved gallery filters</label>
                <select id="gallery-saved-filter" value={activeSavedViewId} onChange={(event) => applySavedFilter(event.target.value)} className="ui-select h-9 min-w-40 max-w-full text-sm">
                  <option value="">Current filters</option>
                  {savedViews.map((view) => <option key={view.id} value={view.id}>{view.name}</option>)}
                </select>
                <Button type="button" variant="outline" size="sm" onClick={saveCurrentFilter}>Save filters</Button>
                {activeSavedViewId && <Button type="button" variant="ghost" size="sm" onClick={() => deleteSavedFilter(activeSavedViewId)}>Delete saved filter</Button>}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="ui-card rounded-3xl overflow-hidden animate-pulse"
                    >
                      <div className="aspect-[4/3] bg-slate-100 dark:bg-zinc-800" />
                      <div className="p-6 space-y-4">
                        <div className="h-4 w-1/3 bg-slate-100 dark:bg-zinc-800 rounded" />
                        <div className="h-6 w-3/4 bg-slate-100 dark:bg-zinc-800 rounded" />
                        <div className="flex gap-2">
                          <div className="h-4 w-12 bg-slate-100 dark:bg-zinc-800 rounded" />
                          <div className="h-4 w-12 bg-slate-100 dark:bg-zinc-800 rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredGalleries.length === 0 ? (
                <div className="ui-empty-state border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl p-20 flex flex-col items-center gap-6">
                  <div className="ui-empty-icon">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="ui-section-title">
                      No galleries found
                    </h2>
                    <p className="ui-body font-sans">
                      Adjust your filters or create your first delivery gallery.
                    </p>
                  </div>
                </div>
              ) : galleryView === 'list' ? (
                <AdminDataTable
                  rows={filteredGalleries}
                  getRowLabel={(gallery) => gallery.title}
                  columns={[
                    { id: 'gallery', header: 'Gallery', cell: (gallery) => <div className="flex items-center gap-3"><div className="relative h-10 w-14 overflow-hidden rounded-lg bg-muted">{gallery.cover_url && <Image src={gallery.cover_url} alt="" fill className="object-cover" unoptimized />}</div><div><p className="font-medium">{gallery.title}</p><p className="text-xs text-muted-foreground">{gallery.client_name || 'Individual Client'}</p></div></div>, accessor: (gallery) => gallery.title, sortable: true },
                    { id: 'photos', header: 'Photos', accessor: (gallery) => gallery.photo_count, align: 'right' },
                    { id: 'status', header: 'Status', cell: (gallery) => <span className="ui-badge">{gallery.status}</span>, accessor: (gallery) => gallery.status },
                    { id: 'updated', header: 'Updated', cell: (gallery) => new Date(gallery.last_activity_at || gallery.created_at).toLocaleDateString('en-KE'), accessor: (gallery) => gallery.last_activity_at || gallery.created_at, hideOnMobile: true },
                  ]}
                  rowActions={[
                    { label: 'Manage', onSelect: (gallery) => router.push(`/admin/galleries/${gallery.id}`) },
                    { label: 'Copy share link', onSelect: (gallery) => copyShareLink(gallery.slug) },
                    { label: 'Delete', destructive: true, onSelect: (gallery) => void handleDeleteGallery(gallery.id, gallery.title) },
                  ]}
                />
              ) : (
                <div className="grid grid-cols-2 gap-3 pb-16 sm:gap-5 lg:grid-cols-3 lg:gap-6">
                  {filteredGalleries.map((gal) => {
                    const coverSrc = gal.cover_url || '/og-image.svg';

                    return (
                      <div
                        key={gal.id}
                        className="group ui-card ui-card-interactive flex flex-col overflow-hidden bg-card border-border"
                      >
                        {/* Cover Photo */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden ">
                          <Image
                            src={coverSrc}
                            alt={gal.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                            unoptimized
                          />

                          {/* Gradient Overlays */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                          
                          {/* Top Badges */}
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span
                              className={`ui-badge px-3 py-1.5 backdrop-blur-md shadow-sm border-none ${
                                gal.status === 'published'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <span className={`ui-badge-dot ${gal.status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                {gal.status}
                              </span>
                            </span>

                            {gal.allow_downloads && (
                              <span className="ui-badge px-3 py-1.5 bg-black/40 backdrop-blur-md border-none text-white flex items-center gap-1.5">
                                <Download className="w-2.5 h-2.5" />
                                DL ON
                              </span>
                            )}
                          </div>

                          {/* Secondary Menu Toggle (Hidden PIN access here) */}
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button 
                              onClick={(e) => { e.preventDefault(); copyPin(gal.access_pin); }}
                              title="Copy Access PIN"
                              className="p-2.5 bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-[var(--color-accent)] rounded-full transition-all"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => { e.preventDefault(); router.push(`/admin/galleries/${gal.id}`); }}
                              className="p-2.5 bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-[var(--color-accent)] rounded-full transition-all"
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Bottom Info */}
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                            <div className="space-y-1">
                              <p className="ui-meta text-white/80 flex items-center gap-2">
                                <Users className="w-3 h-3 text-primary" />
                                {gal.client_name || 'Individual Client'}
                              </p>
                              <h3 className="text-lg font-medium text-white leading-tight drop-shadow-md">
                                {gal.title}
                              </h3>
                            </div>
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                          {/* Grid Stats */}
                          <div className="grid grid-cols-4 gap-2">
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl flex flex-col items-center gap-1">
                              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">{gal.photo_count}</span>
                              <span className="ui-meta text-[8px] uppercase">Photos</span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl flex flex-col items-center gap-1">
                              <Heart className="w-3.5 h-3.5 text-pink-500" />
                              <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">{gal.favorites_count || 0}</span>
                              <span className="ui-meta text-[8px] uppercase">Faves</span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl flex flex-col items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                              <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">{gal.selections_count || 0}</span>
                              <span className="ui-meta text-[8px] uppercase">Proofs</span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl flex flex-col items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                              <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">{gal.comments_count || 0}</span>
                              <span className="ui-meta text-[8px] uppercase">Chat</span>
                            </div>
                          </div>

                          {/* Operational Metadata */}
                          <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800/60 pt-4">
                            <div className="flex flex-col">
                              <span className="ui-meta tracking-tighter">Engagement</span>
                              <span className="ui-caption">{gal.views_count || 0} views • {gal.downloads_count || 0} downloads</span>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <span className="ui-meta tracking-tighter">Updated</span>
                              <span className="ui-caption">
                                {gal.last_activity_at 
                                  ? new Date(gal.last_activity_at).toLocaleDateString()
                                  : new Date(gal.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Actions Bar */}
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <Button asChild variant="primary" className="rounded-xl shadow-sm"><Link href={`/admin/galleries/${gal.id}`}><Sliders className="w-3.5 h-3.5" />Manage</Link></Button>
                            
                            <div className="flex gap-2">
                              <Button onClick={(e) => { e.preventDefault(); copyShareLink(gal.slug || gal.id); }} variant="secondary" className="flex-1 rounded-xl" title="Copy Client Link"><Copy className="w-3 h-3" />Link</Button>

                              <Button onClick={(e) => { e.preventDefault(); handleDeleteGallery(gal.id, gal.title); }} variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Delete gallery"><Trash2 className="w-3.5 h-3.5" /></Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 2: CLIENT ACTIVITY TIMELINE */}
        {activeTab === 'activity' && (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="ui-section-title text-2xl flex items-center gap-3">
                  <Activity className="w-6 h-6 text-primary" />
                  Live Client Interaction
                </h2>
                <Button onClick={() => fetchData(true)} disabled={isRefreshing} variant="ghost" size="sm"><RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />Refresh</Button>
              </div>
              <p className="ui-body font-sans">
                Recent engagement events from all published portals. (Auto-polls every 30s)
              </p>
            </div>

            {isLoading ? (
               <div className="space-y-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-24 ui-card animate-pulse" />
                  ))}
               </div>
            ) : activities.length === 0 ? (
              <div className="ui-empty-state border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl p-20 font-sans text-xs text-slate-500">
                No client activity recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((act, idx) => {
                  const typeStyles = {
                    favorite: { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10', label: 'Favorited a photo' },
                    selection: { icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10', label: 'Selected for proofing' },
                    selection_and_favorite: { icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10', label: 'Selected & Favorited' },
                    comment: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Left a comment' },
                    download: { icon: Download, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Downloaded a photo' },
                    view: { icon: Eye, color: 'text-slate-500', bg: 'bg-slate-500/10', label: 'Viewed the gallery' },
                    update: { icon: RefreshCw, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Updated access' },
                  };

                  const config = typeStyles[act.activity_type] || typeStyles.update;
                  const Icon = config.icon;

                  return (
                    <div
                      key={act.id + idx}
                      className="ui-card p-5 flex items-center gap-6 hover:border-primary/40 transition-all shadow-sm ui-fade-in"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 ui-meta">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(act.created_at).toLocaleString()}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-zinc-800" />
                          <span className="text-primary font-bold">{act.gallery_title}</span>
                        </div>

                        <h4 className="ui-card-title text-sm truncate">
                          <span className="text-primary dark:text-primary">{act.client_name || 'A Client'}</span>
                          {' '}{config.label}
                        </h4>
                      </div>

                      {act.photo_url && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden  shrink-0 border border-slate-100 dark:border-zinc-800 shadow-sm">
                          <Image
                            src={act.photo_url}
                            alt="Activity Photo"
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        </div>
                      )}

                      <Button asChild variant="ghost" size="icon-sm" className="shrink-0"><Link href={`/admin/galleries/${act.gallery_id}`} aria-label="Open gallery"><ExternalLink className="w-4 h-4" /></Link></Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CREATE GALLERY FORM */}
        {activeTab === 'create' && (
          <StandardCreationDialog
            open
            onOpenChange={(open) => { if (!open) setActiveTab('all'); }}
            title="Create a new gallery"
            description="Create a private draft gallery, then continue in the gallery manager to upload and configure delivery."
            className="max-w-3xl"
          >
              <div className="space-y-3 text-center">
                <div className="ui-icon-box ui-icon-box-lg mx-auto">
                  <Plus className="w-6 h-6" />
                </div>
                <h2 className="ui-page-title text-3xl">
                  New Client Gallery
                </h2>
                <p className="ui-body font-sans max-w-sm mx-auto">
                  Set up a private proofing studio for your client.
                </p>
              </div>

              <form onSubmit={handleCreateGallery} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="gallery-title" className="ui-label ui-meta uppercase tracking-widest pl-1">
                      Gallery Title
                    </label>
                    <input
                      id="gallery-title"
                      type="text"
                      required
                      placeholder="e.g. Safaricom Spark Accelerator 2026"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="ui-input h-14 rounded-2xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="ui-label ui-meta uppercase tracking-widest pl-1">
                        Client
                      </label>
                      <SelectCompat
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="ui-select h-14 rounded-2xl w-full"
                      >
                        <option value="">No Assigned Client</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </SelectCompat>
                    </div>

                    <div className="space-y-2">
                      <label className="ui-label ui-meta uppercase tracking-widest pl-1">
                        Category
                      </label>
                      <SelectCompat
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="ui-select h-14 rounded-2xl w-full"
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </SelectCompat>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="ui-label ui-meta uppercase tracking-widest pl-1">
                      Access PIN (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 4821"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="ui-input h-14 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-zinc-800/30 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between group cursor-pointer" onClick={() => setAllowDownloads(!allowDownloads)}>
                    <div className="space-y-0.5">
                      <p className="ui-card-title">Downloads</p>
                      <p className="ui-caption font-sans">Allow full-resolution & ZIP delivery</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-all relative ${allowDownloads ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-700'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${allowDownloads ? 'left-5' : 'left-1'}`} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between group cursor-pointer" onClick={() => setAllowFavorites(!allowFavorites)}>
                    <div className="space-y-0.5">
                      <p className="ui-card-title">Favorites</p>
                      <p className="ui-caption font-sans">Allow hearting / liking photos</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-all relative ${allowFavorites ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-700'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${allowFavorites ? 'left-5' : 'left-1'}`} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between group cursor-pointer" onClick={() => setAllowSelections(!allowSelections)}>
                    <div className="space-y-0.5">
                      <p className="ui-card-title">Proofing</p>
                      <p className="ui-caption font-sans">Enable client selection for delivery</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-all relative ${allowSelections ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-700'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${allowSelections ? 'left-5' : 'left-1'}`} />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isCreating} variant="primary" size="lg" className="w-full h-16 rounded-2xl shadow-xl shadow-primary/10">
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Configuring Studio...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Create & Launch Gallery Manager</span>
                    </>
                  )}
                </Button>
              </form>
          </StandardCreationDialog>
        )}
      </div>
    </div>
  );
}

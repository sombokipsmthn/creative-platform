// src/app/admin/projects/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Archive,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Heart,
  ImageIcon,
  MessageSquare,
  Plus,
  RefreshCw,
  Settings,
  Share2,
  Sliders,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';

import TableFilterBar from '@/components/admin/TableFilterBar';

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
        fetch('/api/galleries', { cache: 'no-store' }),
        fetch('/api/clients', { cache: 'no-store' }),
        fetch('/api/galleries/activity', { cache: 'no-store' }),
      ]);

      if (galRes.ok) {
        const data = await galRes.json();
        setGalleries(data.galleries || []);
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
    fetchData();

    // Poll for new activity every 30 seconds
    const pollInterval = setInterval(() => {
      fetchData(true);
    }, 30000);

    return () => clearInterval(pollInterval);
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
          accessPin: pin.trim() || '4821',
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
      router.push(`/admin/projects/${createdGal.id}`);
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
    <div className="ui-page p-4 md:p-8 lg:p-12 transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-3 rounded-xl shadow-2xl text-[11px] font-mono flex items-center gap-3 animate-fade-in border border-white/10 dark:border-zinc-200">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-2">
          <div className="space-y-1">
            <Link
              href="/admin"
              className="ui-meta uppercase tracking-widest text-slate-400 hover:text-[var(--color-accent)] transition-colors flex items-center gap-2"
            >
              <Archive className="w-3 h-3" />
              <span>Back to Studio</span>
            </Link>

            <div className="flex items-center gap-4">
              <h1 className="ui-page-title text-4xl">
                Galleries
              </h1>
              {isRefreshing && (
                <RefreshCw className="w-4 h-4 text-purple-500 animate-spin opacity-50" />
              )}
            </div>

            <p className="ui-body font-mono text-xs">
              Manage client delivery, proofing & digital delivery portals.
            </p>
          </div>

          {/* Tab Navigation Buttons */}
          <div className="ui-tab-pills">
            <button
              onClick={() => setActiveTab('all')}
              className={`ui-tab-pill flex items-center gap-2 ${activeTab === 'all' ? 'ui-tab-pill-active' : ''}`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              All Galleries
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`ui-tab-pill flex items-center gap-2 relative ${activeTab === 'activity' ? 'ui-tab-pill-active' : ''}`}
            >
              <Activity className="w-3.5 h-3.5" />
              Activity
              {activities.length > 0 && activeTab !== 'activity' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`ui-tab-pill flex items-center gap-2 ${activeTab === 'create' ? 'ui-tab-pill-active' : ''}`}
            >
              <Plus className="w-3.5 h-3.5" />
              New Gallery
            </button>
          </div>
        </div>

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
              <TableFilterBar
                search={searchQuery}
                onSearchChange={setSearchQuery}
                filters={{ status: filterStatus, category: filterCategory }}
                onFiltersChange={(filters) => {
                  setFilterStatus(filters.status ?? 'all');
                  setFilterCategory(filters.category ?? 'all');
                }}
                onAddItem={() => {
                  setActiveTab('create');
                }}
                filterOptions={ [
                  {
                    label: 'Status',
                    value: 'status',
                    options: [
                      { label: 'All Statuses', value: 'all' },
                      { label: 'Draft', value: 'draft' },
                      { label: 'Published', value: 'published' },
                    ]
                  },
                  {
                    label: 'Category',
                    value: 'category',
                    options: [
                      { label: 'All Categories', value: 'all' },
                      ...CATEGORY_OPTIONS.map((cat) => ({
                        label: cat,
                        value: cat,
                      }))
                    ]
                  }
                ]}
                itemLabel="Gallery" />

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <p className="ui-body font-mono">
                      Adjust your filters or create your first delivery gallery.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="ui-button ui-button-primary ui-button-lg shadow-lg shadow-purple-500/20"
                  >
                    + Create New Gallery
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                  {filteredGalleries.map((gal) => {
                    const fallbackCover =
                      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&q=80';
                    const coverSrc = gal.cover_url || fallbackCover;

                    return (
                      <div
                        key={gal.id}
                        className="group ui-card ui-card-interactive flex flex-col overflow-hidden"
                      >
                        {/* Cover Photo */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-zinc-950">
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
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.preventDefault(); copyPin(gal.access_pin); }}
                              title="Copy Access PIN"
                              className="p-2.5 bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-[var(--color-accent)] rounded-full transition-all"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => { e.preventDefault(); router.push(`/admin/projects/${gal.id}/settings`); }}
                              className="p-2.5 bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-[var(--color-accent)] rounded-full transition-all"
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Bottom Info */}
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                            <div className="space-y-1">
                              <p className="ui-meta text-white/80 flex items-center gap-2">
                                <Users className="w-3 h-3 text-purple-400" />
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
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
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
                            <Link
                              href={`/admin/projects/${gal.id}`}
                              className="ui-button ui-button-primary rounded-xl flex items-center justify-center gap-2 shadow-sm"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              Manage
                            </Link>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => { e.preventDefault(); copyShareLink(gal.slug || gal.id); }}
                                className="ui-button ui-button-secondary flex-1 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                title="Copy Client Link"
                              >
                                <Copy className="w-3 h-3" />
                                Link
                              </button>

                              <button
                                onClick={(e) => { e.preventDefault(); handleDeleteGallery(gal.id, gal.title); }}
                                className="ui-button ui-button-destructive p-3 rounded-xl transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
                  <Activity className="w-6 h-6 text-purple-600" />
                  Live Client Interaction
                </h2>
                <button 
                  onClick={() => fetchData(true)}
                  disabled={isRefreshing}
                  className="ui-button ui-button-ghost ui-button-sm flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <p className="ui-body font-mono">
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
              <div className="ui-empty-state border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl p-20 font-mono text-xs text-slate-500">
                No client activity recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((act, idx) => {
                  const typeStyles = {
                    favorite: { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10', label: 'Favorited a photo' },
                    selection: { icon: CheckCircle2, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Selected for proofing' },
                    selection_and_favorite: { icon: Sparkles, color: 'text-indigo-500', bg: 'bg-indigo-500/10', label: 'Selected & Favorited' },
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
                      className="ui-card p-5 flex items-center gap-6 hover:border-purple-500/40 transition-all shadow-sm ui-fade-in"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 ui-meta">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(act.created_at).toLocaleString()}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-zinc-800" />
                          <span className="text-purple-500 font-bold">{act.gallery_title}</span>
                        </div>

                        <h4 className="ui-card-title text-sm truncate">
                          <span className="text-purple-600 dark:text-purple-400">{act.client_name || 'A Client'}</span>
                          {' '}{config.label}
                        </h4>
                      </div>

                      {act.photo_url && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-950 shrink-0 border border-slate-100 dark:border-zinc-800 shadow-sm">
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

                      <Link
                        href={`/admin/projects/${act.gallery_id}`}
                        className="ui-button ui-button-ghost ui-button-icon-sm shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CREATE GALLERY FORM */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="ui-card rounded-[40px] p-8 md:p-12 shadow-2xl space-y-10">
              <div className="space-y-3 text-center">
                <div className="ui-icon-box ui-icon-box-lg mx-auto">
                  <Plus className="w-6 h-6" />
                </div>
                <h2 className="ui-page-title text-3xl">
                  New Client Gallery
                </h2>
                <p className="ui-body font-mono max-w-sm mx-auto">
                  Set up a private proofing studio for your client.
                </p>
              </div>

              <form onSubmit={handleCreateGallery} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="ui-label ui-meta uppercase tracking-widest pl-1">
                      Gallery Title
                    </label>
                    <input
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
                      <select
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
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="ui-label ui-meta uppercase tracking-widest pl-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="ui-select h-14 rounded-2xl w-full"
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
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
                      <p className="ui-caption font-mono">Allow full-resolution & ZIP delivery</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-all relative ${allowDownloads ? 'bg-purple-600' : 'bg-slate-200 dark:bg-zinc-700'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${allowDownloads ? 'left-5' : 'left-1'}`} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between group cursor-pointer" onClick={() => setAllowFavorites(!allowFavorites)}>
                    <div className="space-y-0.5">
                      <p className="ui-card-title">Favorites</p>
                      <p className="ui-caption font-mono">Allow hearting / liking photos</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-all relative ${allowFavorites ? 'bg-purple-600' : 'bg-slate-200 dark:bg-zinc-700'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${allowFavorites ? 'left-5' : 'left-1'}`} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between group cursor-pointer" onClick={() => setAllowSelections(!allowSelections)}>
                    <div className="space-y-0.5">
                      <p className="ui-card-title">Proofing</p>
                      <p className="ui-caption font-mono">Enable client selection for delivery</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-all relative ${allowSelections ? 'bg-purple-600' : 'bg-slate-200 dark:bg-zinc-700'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${allowSelections ? 'left-5' : 'left-1'}`} />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="ui-button ui-button-primary ui-button-lg w-full h-16 rounded-2xl shadow-xl shadow-purple-500/10"
                >
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
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

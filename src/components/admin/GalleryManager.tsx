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
    <div className="ui-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="">
          <Sparkles className="" />
          <span className="">{toastMessage}</span>
        </div>
      )}

      <div className="">
        {/* Header Bar */}
        <div className="">
          <div className="">
            <Link
              href="/admin"
              className="ui-meta"
            >
              <Archive className="" />
              <span>Back to Studio</span>
            </Link>

            <div className="">
              <h1 className="ui-page-title">
                Galleries
              </h1>
              {isRefreshing && (
                <RefreshCw className="" />
              )}
            </div>

            <p className="ui-body">
              Manage client delivery, proofing & digital delivery portals.
            </p>
          </div>

          {/* Tab Navigation Buttons */}
          <div className="ui-tab-pills">
            <button
              onClick={() => setActiveTab('all')}
              className={`ui-tab-pill flex items-center gap-2 ${activeTab === 'all' ? 'ui-tab-pill-active' : ''}`}
            >
              <ImageIcon className="" />
              All Galleries
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`ui-tab-pill flex items-center gap-2 relative ${activeTab === 'activity' ? 'ui-tab-pill-active' : ''}`}
            >
              <Activity className="" />
              Activity
              {activities.length > 0 && activeTab !== 'activity' && (
                <span className="-top-1 -right-1" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`ui-tab-pill flex items-center gap-2 ${activeTab === 'create' ? 'ui-tab-pill-active' : ''}`}
            >
              <Plus className="" />
              New Gallery
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="ui-alert ui-alert-error">
            <div className="">
              <span className="" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="">✕</button>
          </div>
        )}

        {/* TAB 1: ALL GALLERIES GRID */}
        {activeTab === 'all' && (
          <>
            <div className="">
              <TableFilterBar
                search={searchQuery}
                onSearchChange={setSearchQuery}
                filters={{ status: filterStatus, category: filterCategory }}
                onFiltersChange={(filters) => {
                  const nextStatus = filters.status;
                  if (nextStatus === 'all' || nextStatus === 'draft' || nextStatus === 'published') {
                    setFilterStatus(nextStatus);
                  }
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
                <div className="">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="ui-card"
                    >
                      <div className="" />
                      <div className="">
                        <div className="" />
                        <div className="" />
                        <div className="">
                          <div className="" />
                          <div className="" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredGalleries.length === 0 ? (
                <div className="ui-empty-state">
                  <div className="ui-empty-icon">
                    <ImageIcon className="" />
                  </div>
                  <div className="">
                    <h2 className="ui-section-title">
                      No galleries found
                    </h2>
                    <p className="ui-body">
                      Adjust your filters or create your first delivery gallery.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="">
                  {filteredGalleries.map((gal) => {
                    const fallbackCover =
                      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&q=80';
                    const coverSrc = gal.cover_url || fallbackCover;

                    return (
                      <div
                        key={gal.id}
                        className="ui-card ui-card-interactive"
                      >
                        {/* Cover Photo */}
                        <div className="">
                          <Image
                            src={coverSrc}
                            alt={gal.title}
                            fill
                            className="ease-out"
                            unoptimized
                          />

                          {/* Gradient Overlays */}
                          <div className="to-black/20" />

                          {/* Top Badges */}
                          <div className="">
                            <span
                              className={`ui-badge px-3 py-1.5 backdrop-blur-md shadow-sm border-none ${
                                gal.status === 'published'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              <span className="">
                                <span className={`ui-badge-dot ${gal.status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                {gal.status}
                              </span>
                            </span>

                            {gal.allow_downloads && (
                              <span className="ui-badge">
                                <Download className="" />
                                DL ON
                              </span>
                            )}
                          </div>

                          {/* Secondary Menu Toggle (Hidden PIN access here) */}
                          <div className="">
                            <button
                              onClick={(e) => { e.preventDefault(); copyPin(gal.access_pin); }}
                              title="Copy Access PIN"
                              className=""
                            >
                              <Share2 className="" />
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); router.push(`/admin/galleries/${gal.id}`); }}
                              className=""
                            >
                              <Settings className="" />
                            </button>
                          </div>

                          {/* Bottom Info */}
                          <div className="">
                            <div className="">
                              <p className="ui-meta">
                                <Users className="" />
                                {gal.client_name || 'Individual Client'}
                              </p>
                              <h3 className="drop-shadow-md">
                                {gal.title}
                              </h3>
                            </div>
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="">
                          {/* Grid Stats */}
                          <div className="">
                            <div className="">
                              <ImageIcon className="" />
                              <span className="">{gal.photo_count}</span>
                              <span className="ui-meta">Photos</span>
                            </div>
                            <div className="">
                              <Heart className="" />
                              <span className="">{gal.favorites_count || 0}</span>
                              <span className="ui-meta">Faves</span>
                            </div>
                            <div className="">
                              <CheckCircle2 className="" />
                              <span className="">{gal.selections_count || 0}</span>
                              <span className="ui-meta">Proofs</span>
                            </div>
                            <div className="">
                              <MessageSquare className="" />
                              <span className="">{gal.comments_count || 0}</span>
                              <span className="ui-meta">Chat</span>
                            </div>
                          </div>

                          {/* Operational Metadata */}
                          <div className="">
                            <div className="">
                              <span className="ui-meta">Engagement</span>
                              <span className="ui-caption">{gal.views_count || 0} views • {gal.downloads_count || 0} downloads</span>
                            </div>
                            <div className="">
                              <span className="ui-meta">Updated</span>
                              <span className="ui-caption">
                                {gal.last_activity_at
                                  ? new Date(gal.last_activity_at).toLocaleDateString()
                                  : new Date(gal.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Actions Bar */}
                          <div className="">
                            <Link
                              href={`/admin/galleries/${gal.id}`}
                              className="ui-button ui-button-primary"
                            >
                              <Sliders className="" />
                              Manage
                            </Link>

                            <div className="">
                              <button
                                onClick={(e) => { e.preventDefault(); copyShareLink(gal.slug || gal.id); }}
                                className="ui-button ui-button-secondary"
                                title="Copy Client Link"
                              >
                                <Copy className="" />
                                Link
                              </button>

                              <button
                                onClick={(e) => { e.preventDefault(); handleDeleteGallery(gal.id, gal.title); }}
                                className="ui-button ui-button-destructive"
                              >
                                <Trash2 className="" />
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
          <div className="">
            <div className="">
              <div className="">
                <h2 className="ui-section-title">
                  <Activity className="" />
                  Live Client Interaction
                </h2>
                <button
                  onClick={() => fetchData(true)}
                  disabled={isRefreshing}
                  className="ui-button ui-button-ghost ui-button-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <p className="ui-body">
                Recent engagement events from all published portals. (Auto-polls every 30s)
              </p>
            </div>

            {isLoading ? (
               <div className="">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="ui-card" />
                  ))}
               </div>
            ) : activities.length === 0 ? (
              <div className="ui-empty-state">
                No client activity recorded yet.
              </div>
            ) : (
              <div className="">
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
                      className="ui-card ui-fade-in"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                      </div>

                      <div className="">
                        <div className="ui-meta">
                          <Clock className="" />
                          <span>{new Date(act.created_at).toLocaleString()}</span>
                          <span className="" />
                          <span className="">{act.gallery_title}</span>
                        </div>

                        <h4 className="ui-card-title">
                          <span className="">{act.client_name || 'A Client'}</span>
                          {' '}{config.label}
                        </h4>
                      </div>

                      {act.photo_url && (
                        <div className="">
                          <Image
                            src={act.photo_url}
                            alt="Activity Photo"
                            width={64}
                            height={64}
                            className=""
                            unoptimized
                          />
                        </div>
                      )}

                      <Link
                        href={`/admin/galleries/${act.gallery_id}`}
                        className="ui-button ui-button-ghost ui-button-icon-sm"
                      >
                        <ExternalLink className="" />
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
          <div className="">
            <div className="ui-card">
              <div className="">
                <div className="ui-icon-box ui-icon-box-lg">
                  <Plus className="" />
                </div>
                <h2 className="ui-page-title">
                  New Client Gallery
                </h2>
                <p className="ui-body">
                  Set up a private proofing studio for your client.
                </p>
              </div>

              <form onSubmit={handleCreateGallery} className="">
                <div className="">
                  <div className="">
                    <label className="ui-label ui-meta">
                      Gallery Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Safaricom Spark Accelerator 2026"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="ui-input"
                    />
                  </div>

                  <div className="">
                    <div className="">
                      <label className="ui-label ui-meta">
                        Client
                      </label>
                      <select
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="ui-select"
                      >
                        <option value="">No Assigned Client</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="">
                      <label className="ui-label ui-meta">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="ui-select"
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="">
                    <label className="ui-label ui-meta">
                      Access PIN (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 4821"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="ui-input"
                    />
                  </div>
                </div>

                <div className="">
                  <div className="" onClick={() => setAllowDownloads(!allowDownloads)}>
                    <div className="">
                      <p className="ui-card-title">Downloads</p>
                      <p className="ui-caption">Allow full-resolution & ZIP delivery</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-all relative ${allowDownloads ? 'bg-purple-600' : 'bg-slate-200 dark:bg-zinc-700'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${allowDownloads ? 'left-5' : 'left-1'}`} />
                    </div>
                  </div>

                  <div className="" onClick={() => setAllowFavorites(!allowFavorites)}>
                    <div className="">
                      <p className="ui-card-title">Favorites</p>
                      <p className="ui-caption">Allow hearting / liking photos</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-all relative ${allowFavorites ? 'bg-purple-600' : 'bg-slate-200 dark:bg-zinc-700'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${allowFavorites ? 'left-5' : 'left-1'}`} />
                    </div>
                  </div>

                  <div className="" onClick={() => setAllowSelections(!allowSelections)}>
                    <div className="">
                      <p className="ui-card-title">Proofing</p>
                      <p className="ui-caption">Enable client selection for delivery</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-all relative ${allowSelections ? 'bg-purple-600' : 'bg-slate-200 dark:bg-zinc-700'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${allowSelections ? 'left-5' : 'left-1'}`} />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="ui-button ui-button-primary ui-button-lg"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="" />
                      <span>Configuring Studio...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="" />
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

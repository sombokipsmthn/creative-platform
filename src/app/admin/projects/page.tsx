// src/app/admin/projects/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Copy,
  ExternalLink,
  ImageIcon,
  Plus,
  RefreshCw,
  Sliders,
  Sparkles,
  Trash2,
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

  const [activeTab, setActiveTab] = useState<'all' | 'create' | 'selections'>('all');
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter states for the gallery grid
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  /* =========================================================
     LOAD DATA
     ========================================================= */

  useEffect(() => {
    let ignore = false;

    async function init() {
      try {
        setIsLoading(true);
        const [galRes, clientRes] = await Promise.all([
          fetch('/api/galleries', { cache: 'no-store' }),
          fetch('/api/clients', { cache: 'no-store' }),
        ]);

        if (galRes.ok && !ignore) {
          const data = await galRes.json();
          setGalleries(data.galleries || []);
        }
        if (clientRes.ok && !ignore) {
          const clientData = await clientRes.json();
          const clientList = Array.isArray(clientData)
            ? clientData
            : clientData.clients || [];
          setClients(clientList);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMessage(
            err instanceof Error ? err.message : 'Failed to load galleries.'
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void init();
    return () => {
      ignore = true;
    };
  }, []);

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
    <div className="min-h-screen p-6 md:p-12 font-sans transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-purple-600 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-mono flex items-center gap-3 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
          <div>
            <Link
              href="/admin"
              className="text-xs font-mono text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="text-3xl font-light text-slate-900 dark:text-white mt-1">
              Client Gallery Manager
            </h1>

            <p className="text-xs text-slate-500 font-mono mt-1">
              Pixieset & Pic-Time style private proofing & delivery studios
            </p>
          </div>

          {/* Tab Navigation Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-widest rounded-lg transition-all ${
                activeTab === 'all' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              All Galleries ({galleries.length})
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-widest rounded-lg transition-all ${
                activeTab === 'create' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              + New Gallery
            </button>

            <button
              onClick={() => setActiveTab('selections')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-widest rounded-lg transition-all ${
                activeTab === 'selections' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              Client Activity
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 rounded-xl flex items-center justify-between text-xs font-mono text-red-700 dark:text-red-400">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)}>✕</button>
          </div>
        )}

        {/* TAB 1: ALL GALLERIES GRID */}
        {activeTab === 'all' && (
          <>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-6 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl animate-pulse space-y-4"
                  >
                    <div className="aspect-video bg-slate-200 dark:bg-zinc-800 rounded-xl" />
                    <div className="h-5 w-3/4 bg-slate-200 dark:bg-zinc-800 rounded" />
                    <div className="h-4 w-1/2 bg-slate-200 dark:bg-zinc-800 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredGalleries.length === 0 ? (
              <div className="border border-dashed border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-2xl p-12 text-center">
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-purple-600">
                  <ImageIcon className="w-6 h-6" />
                </div>

                <h2 className="text-xl font-light text-slate-900 dark:text-white">
                  No client galleries yet
                </h2>

                <p className="text-sm text-slate-500 dark:text-zinc-500 max-w-md mx-auto mt-2 font-mono text-xs">
                  Create your first Pixieset-style gallery to manage collections, upload photos, and share private proofing portals.
                </p>

                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-6 px-5 py-3 btn-primary text-xs font-mono uppercase tracking-widest rounded-lg"
                >
                  + Create First Gallery
                </button>
              </div>
            ) : (
              <>
                {/* Table Filter Bar for the gallery grid */}
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
                  ]
                  itemLabel="Gallery"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGalleries.map((gal) => {
                    const fallbackCover =
                      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&q=80';
                    const coverSrc = gal.cover_url || fallbackCover;

                    return (
                      <div
                        key={gal.id}
                        className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden hover:border-purple-600/60 transition-all group flex flex-col justify-between shadow-sm"
                      >
                        <div className="space-y-3">
                          {/* Cover Photo */}
                          <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-zinc-950">
                            <Image
                              src={coverSrc}
                              alt={gal.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              unoptimized
                            />

                            <div className="absolute top-3 left-3 flex gap-2">
                              <span
                                className={`px-2.5 py-1 backdrop-blur-md text-[10px] font-mono uppercase rounded-full border ${
                                  gal.status === 'published'
                                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                                    : 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                                }`}
                              >
                                {gal.status}
                              </span>

                              {gal.access_pin && (
                                <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md border border-white/20 text-zinc-200 text-[10px] font-mono rounded-full">
                                  PIN: {gal.access_pin}
                                </span>
                              )}
                            </div>

                            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-mono rounded-full flex items-center gap-1.5">
                              <ImageIcon className="w-3 h-3" />
                              <span>{gal.photo_count} photos</span>
                            </div>
                          </div>

                          {/* Meta Details */}
                          <div className="p-5 space-y-2">
                            <div className="space-y-0.5">
                              <p className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase">
                                {gal.client_name || gal.category || 'Portfolio Gallery'}
                              </p>

                              <h3 className="text-xl font-medium text-slate-900 dark:text-white truncate">
                                {gal.title}
                              </h3>
                            </div>

                            <p className="text-[11px] text-slate-500 font-mono">
                              Created {new Date(gal.created_at).toLocaleDateString()} •{' '}
                              {gal.collections_count || 1} set(s)
                            </p>
                          </div>
                        </div>

                        {/* Actions Bar */}
                        <div className="p-5 pt-0 space-y-2">
                          {/* Primary: Edit Gallery Manager */}
                          <Link
                            href={`/admin/projects/${gal.id}`}
                            className="w-full py-2.5 btn-primary text-xs font-mono uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-sm"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Edit / Manage Gallery</span>
                          </Link>

                          {/* Secondary Actions Row */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => copyShareLink(gal.slug || gal.id)}
                              className="flex-1 py-2 btn-secondary text-xs font-mono uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5"
                              title="Copy Client Link"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </button>

                            <Link
                              href={`/portal/g/${gal.slug || gal.id}`}
                              target="_blank"
                              className="p-2 btn-secondary rounded-lg text-slate-600 dark:text-zinc-300 hover:text-purple-600"
                              title="Open Client Portal"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => handleDeleteGallery(gal.id, gal.title)}
                              className="p-2 btn-secondary rounded-lg text-slate-400 hover:text-red-500"
                              title="Delete Gallery"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* TAB 2: CREATE GALLERY FORM */}
        {activeTab === 'create' && (
          <div className="p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-3xl space-y-8 max-w-2xl mx-auto shadow-xl">
            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-semibold">
                Pixieset / Pic-Time Builder
              </p>

              <h2 className="text-2xl font-light text-slate-900 dark:text-white">
                Create Client Gallery
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Create the gallery container, then immediately upload photos and configure sets in the manager.
              </p>
            </div>

            <form onSubmit={handleCreateGallery} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono uppercase">
                  Gallery Title
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. Safaricom Spark Accelerator Demo Day 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-xl focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono uppercase">
                    Assigned Client
                  </label>

                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-xl focus:border-purple-600 focus:outline-none"
                  >
                    <option value="">-- No Client (Direct Link) --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono uppercase">
                    Service Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-xl focus:border-purple-600 focus:outline-none"
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
                <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono uppercase">
                  4-Digit Access & Download PIN
                </label>

                <input
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-xl focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-zinc-800 pt-4 text-xs font-mono text-slate-700 dark:text-zinc-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDownloads}
                    onChange={(e) => setAllowDownloads(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                  Allow Full-Res / ZIP Downloads
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowFavorites}
                    onChange={(e) => setAllowFavorites(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                  Allow Client Favorites
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowSelections}
                    onChange={(e) => setAllowSelections(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                  Allow Client Proof Selections
                </label>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-4 btn-primary text-xs font-mono uppercase tracking-widest rounded-xl flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating & Opening Manager...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create & Open Gallery Manager →</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: CLIENT ACTIVITY & SELECTIONS */}
        {activeTab === 'selections' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-light text-slate-900 dark:text-white">
                Client Proofs & Activity
              </h2>

              <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">
                Overview of client interactions across all your published galleries.
              </p>
            </div>

            {galleries.length === 0 ? (
              <div className="border border-dashed border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-2xl p-10 text-center">
                <p className="text-sm text-slate-500 font-mono text-xs">
                  No client selections yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {galleries.map((g) => (
                  <div
                    key={g.id}
                    className="p-6 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl space-y-4 shadow-sm"
                  >
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
                      <div>
                        <p className="text-xs font-mono text-purple-600 dark:text-purple-400">
                          {g.client_name || g.category || 'Client'}
                        </p>

                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                          {g.title}
                        </p>
                      </div>

                      <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/40 text-purple-700 dark:text-purple-300 text-xs font-mono rounded-full">
                        {g.photo_count} Photos Total
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-600 dark:text-zinc-400 space-y-1">
                      <p>• Client PIN: {g.access_pin || 'None'}</p>
                      <p>
                        • Status:{' '}
                        <span className="text-slate-900 dark:text-white font-bold uppercase">
                          {g.status}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Link
                        href={`/admin/projects/${g.id}`}
                        className="px-4 py-2 btn-primary text-xs font-mono rounded-lg inline-flex items-center gap-2"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Open Gallery Manager</span>
                      </Link>

                      <Link
                        href={`/portal/g/${g.slug || g.id}`}
                        target="_blank"
                        className="px-4 py-2 btn-secondary text-xs font-mono rounded-lg inline-flex items-center gap-2"
                      >
                        <span>Client View</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

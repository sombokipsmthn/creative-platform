// src/app/portal/g/[secretToken]/page.tsx
'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Download,
  Heart,
  Lock,
} from 'lucide-react';

import ClientLightbox from '@/components/ClientLightbox';
import DownloadModal from '@/components/DownloadModal';
import ThemeToggle from '@/components/ThemeToggle';

interface GalleryItem {
  id: string;
  title: string;
  url: string;
  type: 'photo' | 'video';
  category?: string;
  collectionId?: string | null;
  collection_id?: string | null;
  exif?: {
    camera?: string;
    iso?: string;
    aperture?: string;
    shutter?: string;
  };
}

interface RawPhotoResponse {
  id: string;
  filename: string;
  display_url?: string;
  original_url?: string;
  collection_id?: string | null;
  is_favorite?: boolean;
  is_selected?: boolean;
}

interface CollectionItem {
  id: string;
  title: string;
}

interface GalleryPageProps {
  params: Promise<{
    secretToken: string;
  }>;
}

const fallbackDemoGallery = {
  title: 'Clean Energy Impact Series',
  client: 'BURN Manufacturing / Delta40 Studio',
  date: 'August 2026',
  pin: '4821',
  items: [
    {
      id: 'img-01',
      title: 'Founder Field Interview',
      url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80',
      type: 'photo' as const,
      category: 'Documentary',
    },
    {
      id: 'img-02',
      title: 'Factory Operations',
      url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1600&q=80',
      type: 'photo' as const,
      category: 'Production',
    },
    {
      id: 'img-03',
      title: 'Executive Portrait',
      url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80',
      type: 'photo' as const,
      category: 'Portrait',
    },
  ],
};

export default function ClientGalleryPage({ params }: GalleryPageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.secretToken;

  const [loading, setLoading] = useState(true);
  const [galleryTitle, setGalleryTitle] = useState(fallbackDemoGallery.title);
  const [clientName, setClientName] = useState(fallbackDemoGallery.client);
  const [requiredPin, setRequiredPin] = useState<string | null>(null);
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [allowFavorites, setAllowFavorites] = useState(true);
  const [allowSelections, setAllowSelections] = useState(true);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [items, setItems] = useState<GalleryItem[]>(fallbackDemoGallery.items);

  const [activeCollection, setActiveCollection] = useState<string>('all');
  const [verified, setVerified] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [selections, setSelections] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);

  useEffect(() => {
    async function fetchGallery() {
      try {
        setLoading(true);
        const res = await fetch(`/api/public/galleries/${token}`, {
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();
          const gal = data.gallery;
          setGalleryTitle(gal.title || 'Client Gallery');
          setClientName(gal.client_name || gal.category || 'Private Client');
          setRequiredPin(gal.access_pin || null);
          setAllowDownloads(gal.allow_downloads !== false);
          setAllowFavorites(gal.allow_favorites !== false);
          setAllowSelections(gal.allow_selections !== false);
          setCoverUrl(gal.cover_url || null);
          setCollections(data.collections || []);

          if (data.photos && data.photos.length > 0) {
            const rawPhotos = data.photos as RawPhotoResponse[];
            const mappedPhotos: GalleryItem[] = rawPhotos.map((p) => ({
              id: p.id,
              title: p.filename,
              url: p.display_url || p.original_url || '',
              type: 'photo',
              collectionId: p.collection_id,
            }));
            setItems(mappedPhotos);

            const initialFavs = rawPhotos
              .filter((p) => p.is_favorite)
              .map((p) => p.id);
            setFavorites(initialFavs);

            const initialSelects = rawPhotos
              .filter((p) => p.is_selected)
              .map((p) => p.id);
            setSelections(initialSelects);
          }

          // If no PIN is set, auto-verify
          if (!gal.access_pin) {
            setVerified(true);
          }
        } else {
          // If no PIN on fallback
          if (!fallbackDemoGallery.pin) {
            setVerified(true);
          }
        }
      } catch (err) {
        console.warn('Failed to load dynamic gallery, using preset:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, [token]);

  function verifyPin(e: React.FormEvent) {
    e.preventDefault();
    const correct = requiredPin || fallbackDemoGallery.pin;

    if (!correct || pin.trim() === correct.trim()) {
      setVerified(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  }

  async function toggleFavorite(id: string) {
    const isFav = favorites.includes(id);
    const nextFavs = isFav ? favorites.filter((x) => x !== id) : [...favorites, id];
    setFavorites(nextFavs);

    try {
      await fetch(`/api/public/galleries/${token}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId: id,
          isFavorite: !isFav,
        }),
      });
    } catch (err) {
      console.warn('Failed to persist favorite:', err);
    }
  }

  async function toggleSelection(id: string) {
    const isSelected = selections.includes(id);
    const nextSelects = isSelected ? selections.filter((x) => x !== id) : [...selections, id];
    setSelections(nextSelects);

    try {
      await fetch(`/api/public/galleries/${token}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId: id,
          isSelected: !isSelected,
        }),
      });
    } catch (err) {
      console.warn('Failed to persist selection:', err);
    }
  }

  const filteredItems = useMemo(() => {
    if (activeCollection === 'all') return items;
    return items.filter(
      (item) => item.collectionId === activeCollection || item.collection_id === activeCollection
    );
  }, [items, activeCollection]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b]">
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
          Loading Gallery...
        </p>
      </div>
    );
  }

  if (!verified) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b] px-6">
        <form
          onSubmit={verifyPin}
          className="max-w-md w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-2xl font-light text-slate-900 dark:text-white">
              {galleryTitle}
            </h1>

            <p className="text-xs font-mono uppercase tracking-widest text-purple-500 mt-2">
              Private Client Studio
            </p>
          </div>

          <p className="text-xs text-slate-500 font-mono">
            Enter the 4-digit PIN provided by your photographer to access the private gallery.
          </p>

          <input
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setPinError(false);
            }}
            maxLength={6}
            placeholder="PIN"
            type="password"
            autoFocus
            className="w-full text-center text-3xl tracking-[0.5em] rounded-2xl bg-slate-100 dark:bg-zinc-900 p-4 font-mono outline-none border border-slate-200 dark:border-zinc-800 focus:border-purple-600"
          />

          {pinError && (
            <p className="text-xs font-mono text-red-500">
              Incorrect PIN. Please check and try again.
            </p>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-purple-600 text-white text-xs font-mono uppercase tracking-widest hover:bg-purple-700 transition font-bold"
          >
            Unlock Gallery →
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/" className="font-bold tracking-widest text-sm uppercase">
            KIPSMTHN<span className="text-purple-500">.</span>
          </Link>

          <div className="flex gap-3 items-center">
            {allowDownloads && (
              <button
                onClick={() => setDownloadOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-mono flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download ({favorites.length || items.length})</span>
              </button>
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Banner with Cover Photo */}
      <section className="relative overflow-hidden bg-slate-900 border-b border-slate-200 dark:border-zinc-800">
        {coverUrl && (
          <>
            <Image
              src={coverUrl}
              alt={galleryTitle}
              fill
              className="object-cover opacity-35"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          </>
        )}

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 space-y-3 text-white">
          <span className="px-3 py-1 bg-purple-600/80 text-white text-[10px] font-mono uppercase tracking-widest rounded-full">
            Client Portal
          </span>

          <h1 className="text-3xl md:text-5xl font-light mt-2">{galleryTitle}</h1>

          <p className="text-sm font-mono text-zinc-300">
            {clientName} • {items.length} Photos
          </p>
        </div>
      </section>

      {/* Collections Tabs Bar */}
      {collections.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCollection('all')}
            className={`px-4 py-2 text-xs font-mono rounded-full transition ${
              activeCollection === 'all'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'
            }`}
          >
            All Photos ({items.length})
          </button>

          {collections.map((col) => {
            const count = items.filter(
              (i) => i.collectionId === col.id || i.collection_id === col.id
            ).length;

            return (
              <button
                key={col.id}
                onClick={() => setActiveCollection(col.id)}
                className={`px-4 py-2 text-xs font-mono rounded-full transition whitespace-nowrap ${
                  activeCollection === col.id
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800'
                }`}
              >
                {col.title} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Photo Gallery Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => {
            const isFav = favorites.includes(item.id);
            const isSelected = selections.includes(item.id);

            return (
              <div
                key={item.id}
                className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between"
              >
                <div
                  className="relative aspect-square cursor-pointer overflow-hidden bg-slate-100 dark:bg-zinc-950"
                  onClick={() => setLightboxIndex(index)}
                >
                  <Image
                    src={item.url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />

                  {/* Top Right Action Badges */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {allowFavorites && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition shadow-md ${
                          isFav
                            ? 'bg-red-500 text-white'
                            : 'bg-black/40 text-white hover:bg-red-500'
                        }`}
                        title="Mark Favorite"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    )}

                    {allowSelections && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(item.id);
                        }}
                        className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition text-xs font-mono font-bold shadow-md ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-black/40 text-white hover:bg-purple-600'
                        }`}
                        title="Select Proof"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-700 dark:text-zinc-300 truncate max-w-[180px]">
                    {item.title}
                  </span>
                  <div className="flex gap-2">
                    {isFav && <span className="text-red-500">♥</span>}
                    {isSelected && <span className="text-purple-600 font-bold">✓</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <ClientLightbox
          isOpen={true}
          item={filteredItems[lightboxIndex]}
          onClose={() => setLightboxIndex(null)}
          onNext={() =>
            setLightboxIndex((prev) =>
              prev !== null ? Math.min(filteredItems.length - 1, prev + 1) : null
            )
          }
          onPrev={() =>
            setLightboxIndex((prev) =>
              prev !== null ? Math.max(0, prev - 1) : null
            )
          }
          isFavorite={favorites.includes(filteredItems[lightboxIndex].id)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* Download Modal */}
      <DownloadModal
        isOpen={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        requiresPin={Boolean(requiredPin)}
        correctPin={requiredPin || '4821'}
        totalItemsCount={items.length}
        favoritesCount={favorites.length}
      />
    </div>
  );
}
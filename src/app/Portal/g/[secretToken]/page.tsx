// src/app/portal/g/[secretToken]/page.tsx
'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ClientLightbox from '@/components/ClientLightbox';
import DownloadModal from '@/components/DownloadModal';
import ThemeToggle from '@/components/ThemeToggle';

interface GalleryItem {
  id: string;
  title: string;
  url: string;
  type: 'photo' | 'video';
  category?: string;
  exif?: { camera?: string; iso?: string; aperture?: string; shutter?: string };
}

const mockDeliverables: Record<string, { title: string; client: string; date: string; pin: string; items: GalleryItem[] }> = {
  demo: {
    title: 'Clean Energy Impact & Ecosystem Media',
    client: 'BURN Manufacturing / Delta40 Studio',
    date: 'August 2026',
    pin: '2540',
    items: [
      {
        id: 'img-01',
        title: 'Founder Field Interview - Solar & Biomass Innovation',
        url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80',
        type: 'photo',
        category: 'Documentary Stills',
        exif: { camera: 'Sony A7IV', iso: '400', aperture: 'f/2.8', shutter: '1/500s' },
      },
      {
        id: 'img-02',
        title: 'Factory & Clean Cookstove Manufacturing Process',
        url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
        type: 'photo',
        category: 'Production & Facility',
        exif: { camera: 'Sony A7IV', iso: '800', aperture: 'f/4.0', shutter: '1/250s' },
      },
      {
        id: 'img-03',
        title: 'Cohort Ecosystem Summit & Demo Day Pitch',
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        type: 'photo',
        category: 'Summit & Keynotes',
        exif: { camera: 'Sony A7R V', iso: '1600', aperture: 'f/2.8', shutter: '1/400s' },
      },
      {
        id: 'img-04',
        title: 'Executive Portraiture - Venture Leadership',
        url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
        type: 'photo',
        category: 'Portraits',
        exif: { camera: 'Sony A7R V', iso: '100', aperture: 'f/1.8', shutter: '1/800s' },
      },
      {
        id: 'img-05',
        title: 'Product Catalog - Commercial Clean Cookstove Unit',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        type: 'photo',
        category: 'Commercial Catalog',
        exif: { camera: 'Sony A7IV', iso: '100', aperture: 'f/8.0', shutter: '1/160s' },
      },
      {
        id: 'img-06',
        title: 'African Startup Founders Round Table',
        url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
        type: 'photo',
        category: 'Summit & Keynotes',
        exif: { camera: 'Sony A7IV', iso: '1200', aperture: 'f/2.8', shutter: '1/320s' },
      },
    ],
  },
};

export default function ClientGalleryTokenPage({ params }: { params: Promise<{ secretToken: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.secretToken.toLowerCase();

  // Load matching gallery or create dynamically for any custom token
  const galleryData = mockDeliverables[token] || {
    title: `Private Client Deliverables (${resolvedParams.secretToken})`,
    client: 'Valued Client Partner',
    date: '2026 Deliverables Package',
    pin: '1234',
    items: mockDeliverables.demo.items,
  };

  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [favorites, setFavorites] = useState<string[]>(['img-01', 'img-04']);
  const [selectedLightboxIndex, setSelectedLightboxIndex] = useState<number | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState(false);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const displayedItems =
    activeTab === 'favorites'
      ? galleryData.items.filter((item) => favorites.includes(item.id))
      : galleryData.items;

  const currentLightboxItem =
    selectedLightboxIndex !== null ? displayedItems[selectedLightboxIndex] : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 bg-white/85 dark:bg-[#09090b]/85">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-bold tracking-wider text-slate-900 dark:text-white uppercase font-sans">
              KIPSMTHN<span className="text-purple-500">.</span>
            </Link>
            <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest text-purple-600 dark:text-purple-400 uppercase font-semibold border-l border-slate-200 dark:border-zinc-800 pl-3">
              Deliverables Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-full transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Download Media</span>
              <span className="bg-purple-800/60 text-[10px] px-1.5 py-0.5 rounded-full">
                {favorites.length}
              </span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Gallery Hero Banner */}
      <section className="py-12 px-6 max-w-7xl mx-auto border-b border-slate-200 dark:border-zinc-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              Token: <code className="font-bold">{resolvedParams.secretToken}</code> • PIN: <span className="font-bold">{galleryData.pin}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-slate-900 dark:text-white">
              {galleryData.title}
            </h1>
            <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
              Client: <span className="text-slate-800 dark:text-zinc-200 font-semibold">{galleryData.client}</span> • {galleryData.date}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900/60 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs font-mono">
            <div className="px-3 text-center border-r border-slate-200 dark:border-zinc-800">
              <p className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase">Total Assets</p>
              <p className="font-bold text-slate-900 dark:text-white text-base">{galleryData.items.length}</p>
            </div>
            <div className="px-3 text-center">
              <p className="text-purple-600 dark:text-purple-400 text-[10px] uppercase">Selected</p>
              <p className="font-bold text-purple-600 dark:text-purple-400 text-base">{favorites.length}</p>
            </div>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-950 font-bold'
                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-purple-600'
              }`}
            >
              All Assets ({galleryData.items.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                activeTab === 'favorites'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-purple-600'
              }`}
            >
              My Selects ({favorites.length})
            </button>
          </div>

          <button
            onClick={() => {
              setSubmittedFeedback(true);
              setTimeout(() => setSubmittedFeedback(false), 4000);
            }}
            className="px-4 py-2 border border-purple-500/50 bg-purple-600/10 hover:bg-purple-600 text-purple-700 dark:text-purple-300 hover:text-white text-xs font-mono uppercase rounded-full transition-all"
          >
            {submittedFeedback ? '✓ Selects Submitted to Creator!' : 'Submit Selects →'}
          </button>
        </div>
      </section>

      {/* Media Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {displayedItems.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="text-lg font-light text-slate-600 dark:text-zinc-400">No favorites selected yet.</p>
            <p className="text-xs font-mono text-slate-400">Click the heart icon on any photo to add it to your selects.</p>
            <button
              onClick={() => setActiveTab('all')}
              className="mt-4 px-4 py-2 btn-primary text-xs font-mono uppercase rounded-full"
            >
              View All Photos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedItems.map((item, idx) => {
              const isFav = favorites.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Thumbnail Image */}
                  <div
                    className="relative aspect-4/3 w-full bg-slate-100 dark:bg-zinc-900 cursor-pointer overflow-hidden"
                    onClick={() => setSelectedLightboxIndex(idx)}
                  >
                    <Image
                      src={item.url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4" />

                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm backdrop-blur-md transition-all ${
                          isFav
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 scale-110'
                            : 'bg-black/40 text-white hover:bg-purple-600 border border-white/20'
                        }`}
                        title={isFav ? 'Remove from selects' : 'Add to selects'}
                      >
                        {isFav ? '♥' : '♡'}
                      </button>
                    </div>

                    {item.category && (
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-[10px] font-mono uppercase tracking-wider text-white rounded-md">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* Metadata Footer */}
                  <div className="p-4 space-y-1 bg-white dark:bg-zinc-950 flex-1 flex flex-col justify-between border-t border-slate-100 dark:border-zinc-900">
                    <p className="text-xs font-medium text-slate-900 dark:text-zinc-200 line-clamp-1">
                      {item.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-500 pt-1">
                      <span>{item.exif?.camera || 'Sony Alpha'}</span>
                      <button
                        onClick={() => setSelectedLightboxIndex(idx)}
                        className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                      >
                        Inspect & Comment →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Lightbox Component */}
      {selectedLightboxIndex !== null && currentLightboxItem && (
        <ClientLightbox
          isOpen={true}
          item={currentLightboxItem}
          onClose={() => setSelectedLightboxIndex(null)}
          onNext={() =>
            setSelectedLightboxIndex((prev) =>
              prev !== null && prev < displayedItems.length - 1 ? prev + 1 : 0
            )
          }
          onPrev={() =>
            setSelectedLightboxIndex((prev) =>
              prev !== null && prev > 0 ? prev - 1 : displayedItems.length - 1
            )
          }
          isFavorite={favorites.includes(currentLightboxItem.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* Download Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        requiresPin={true}
        correctPin={galleryData.pin}
        totalItemsCount={galleryData.items.length}
        favoritesCount={favorites.length}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-900 py-10 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-slate-500 dark:text-zinc-500 gap-4">
        <p>© {new Date().getFullYear()} KIPSMTHN Deliverables Platform • Nairobi, Kenya</p>
        <Link href="/" className="text-purple-600 hover:underline">
          Return to Creator Portfolio →
        </Link>
      </footer>
    </div>
  );
}

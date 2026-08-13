// src/app/portal/g/[secretToken]/page.tsx
'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import ClientLightbox from '@/components/ClientLightbox';
import DownloadModal from '@/components/DownloadModal';

interface GalleryPageProps {
  params: Promise<{ secretToken: string }>;
}

export default function ClientGalleryPortal({ params }: GalleryPageProps) {
  // 💡 NEXT.JS 16 SAFE UNWRAPPING OF PARAMS PROMISE
  const resolvedParams = use(params);
  const secretToken = resolvedParams.secretToken;

  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [selectedSet, setSelectedSet] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [selectionSubmitted, setSelectionSubmitted] = useState(false);

  // Dynamic Gallery Data matching token
  const isBurnGallery = secretToken === 'burn_impact_2025';

  const mockGallery = {
    title: isBurnGallery ? 'Clean Energy Impact Series 2025' : 'UNDP Timbuktoo Summit 2026',
    clientName: isBurnGallery ? 'BURN Manufacturing USA LLC' : 'UNDP / ccHUB Innovation Team',
    date: isBurnGallery ? 'January 2026' : 'February 2026',
    coverImage: isBurnGallery 
      ? 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=2000&q=80'
      : 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=2000&q=80',
    requiresPin: true,
    correctPin: isBurnGallery ? '1234' : '4821', // Sample PINs: 4821 or 1234
    selectionLimit: isBurnGallery ? 50 : 20,
    sets: isBurnGallery 
      ? ['All', 'Factory Operations', 'Community Impact', 'Executive Interviews']
      : ['All', 'Keynotes', 'Panel Sessions', 'Behind the Scenes'],
    items: [
      { id: '1', title: 'Keynote Opening Stage', set: isBurnGallery ? 'Factory Operations' : 'Keynotes', type: 'image', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80', exif: { camera: 'Sony A7IV', iso: '400', aperture: 'f/2.8', shutter: '1/500s' } },
      { id: '2', title: 'Panel Discussion Session', set: isBurnGallery ? 'Community Impact' : 'Panel Sessions', type: 'image', url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80', exif: { camera: 'Sony A7IV', iso: '800', aperture: 'f/2.0', shutter: '1/250s' } },
      { id: '3', title: 'Cohort Founder Network', set: isBurnGallery ? 'Executive Interviews' : 'Behind the Scenes', type: 'image', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80', exif: { camera: 'Sony FX3', iso: '640', aperture: 'f/1.8', shutter: '1/1000s' } },
      { id: '4', title: 'Ecosystem Leaders Dialogue', set: isBurnGallery ? 'Community Impact' : 'Panel Sessions', type: 'image', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80', exif: { camera: 'Sony A7IV', iso: '320', aperture: 'f/2.8', shutter: '1/400s' } },
    ],
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === mockGallery.correctPin || pinInput === '4821' || pinInput === '1234') {
      setPinVerified(true);
    } else {
      alert(`Invalid PIN. Use sample PIN: ${mockGallery.correctPin}`);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSubmitSelections = () => {
    if (favorites.length === 0) {
      alert('Please select at least one photo before submitting.');
      return;
    }
    setSelectionSubmitted(true);
    alert(`Success! ${favorites.length} selections submitted to Somboriot Kipchilat for final retouching.`);
  };

  // 1. Frictionless PIN Gate
  if (mockGallery.requiresPin && !pinVerified) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex items-center justify-center p-6 transition-colors duration-300">
        <div className="max-w-md w-full p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl text-center space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase text-purple-600 dark:text-purple-400 tracking-widest font-bold">Private Client Gallery</p>
            <h1 className="text-2xl font-light text-slate-900 dark:text-white">{mockGallery.title}</h1>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-light">{mockGallery.clientName}</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase font-bold">
                Sample Access PIN: <span className="underline">{mockGallery.correctPin}</span>
              </label>
              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center text-3xl font-mono tracking-[0.5em] py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 btn-primary text-xs font-mono uppercase tracking-widest rounded-lg transition-colors shadow-md cursor-pointer"
            >
              Access Gallery
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filter items by set
  const filteredItems = selectedSet === 'All'
    ? mockGallery.items
    : mockGallery.items.filter((item) => item.set === selectedSet);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 pb-32 transition-colors duration-300">
      {/* Cover Hero Banner */}
      <section className="relative h-[70vh] min-h-125 w-full border-b border-slate-200 dark:border-zinc-800 overflow-hidden">
        <Image src={mockGallery.coverImage} alt={mockGallery.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-black/60" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-6 flex flex-col justify-between py-12">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="px-3 py-1 bg-black/60 border border-white/20 rounded-full text-purple-300 font-semibold">
              ● Private Client Access
            </span>
            <span className="text-zinc-300">{mockGallery.date}</span>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-purple-300 font-bold">{mockGallery.clientName}</p>
            <h1 className="text-4xl md:text-6xl font-light text-white">{mockGallery.title}</h1>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setIsDownloadOpen(true)}
                className="px-6 py-3 btn-primary text-xs font-mono uppercase tracking-widest rounded-full transition-all shadow-md cursor-pointer"
              >
                Download Photos 🡇
              </button>
              <button
                onClick={() => setSelectedSet('All')}
                className="px-6 py-3 bg-black/60 border border-white/30 hover:border-purple-400 text-white text-xs font-mono uppercase tracking-widest rounded-full transition-all cursor-pointer"
              >
                Favorites ({favorites.length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Set Tab Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {mockGallery.sets.map((setName) => (
              <button
                key={setName}
                onClick={() => setSelectedSet(setName)}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                  selectedSet === setName ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {setName}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-slate-500 dark:text-zinc-500 hidden sm:inline-block">
            {filteredItems.length} Deliverables
          </span>
        </div>
      </header>

      {/* Media Grid */}
      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => {
            const isFav = favorites.includes(item.id);
            return (
              <div
                key={item.id}
                className="group relative bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 rounded-xl overflow-hidden hover:border-purple-600/50 transition-all shadow-sm dark:shadow-none"
              >
                <div
                  className="relative aspect-4/3 w-full cursor-pointer"
                  onClick={() => setLightboxIndex(index)}
                >
                  <Image src={item.url} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                </div>

                <div className="p-4 bg-slate-100 dark:bg-zinc-950 flex justify-between items-center">
                  <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-50">{item.title}</p>
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className={`p-2 rounded-full text-xs transition-all cursor-pointer ${
                      isFav ? 'bg-purple-600 text-white' : 'btn-secondary'
                    }`}
                  >
                    {isFav ? '♥' : '♡'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Proofing Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-zinc-950/95 border-t border-slate-200 dark:border-zinc-800 p-4 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-2">
          <div className="text-xs font-mono text-slate-600 dark:text-zinc-400">
            Selected: <span className="text-purple-600 dark:text-purple-400 font-bold">{favorites.length}</span> / {mockGallery.selectionLimit} Max
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsDownloadOpen(true)}
              className="px-6 py-2.5 btn-secondary text-xs font-mono uppercase tracking-widest rounded-full cursor-pointer"
            >
              Download ZIP
            </button>
            <button
              onClick={handleSubmitSelections}
              disabled={selectionSubmitted}
              className="px-6 py-2.5 btn-primary text-xs font-mono uppercase tracking-widest rounded-full cursor-pointer shadow-md disabled:opacity-50"
            >
              {selectionSubmitted ? 'Selections Submitted ✓' : 'Submit Selections'}
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <ClientLightbox
        isOpen={lightboxIndex !== null}
        item={lightboxIndex !== null ? filteredItems[lightboxIndex] : null}
        onClose={() => setLightboxIndex(null)}
        onNext={() => setLightboxIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0))}
        onPrev={() => setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1))}
        isFavorite={lightboxIndex !== null && favorites.includes(filteredItems[lightboxIndex].id)}
        onToggleFavorite={toggleFavorite}
      />

      {/* Download Modal */}
      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        requiresPin={mockGallery.requiresPin}
        correctPin={mockGallery.correctPin}
        totalItemsCount={mockGallery.items.length}
        favoritesCount={favorites.length}
      />
    </div>
  );
}
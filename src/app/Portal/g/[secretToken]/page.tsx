// src/app/portal/g/[secretToken]/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import ClientLightbox from '@/components/ClientLightbox';
import DownloadModal from '@/components/DownloadModal';

interface GalleryPageProps {
  params: { secretToken: string };
}

export default function ClientGalleryPortal({ params }: GalleryPageProps) {
  void params;
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [selectedSet, setSelectedSet] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [selectionSubmitted, setSelectionSubmitted] = useState(false);

  // Pic-Time / Pixieset Sample Client Gallery Data
  const mockGallery = {
    title: 'UNDP Timbuktoo Summit 2026',
    clientName: 'UNDP / ccHUB Innovation Team',
    date: 'February 2026',
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=2000&q=80',
    requiresPin: true,
    correctPin: '4821',
    selectionLimit: 20,
    sets: ['All', 'Keynotes', 'Panel Sessions', 'Behind the Scenes'],
    items: [
      { id: '1', title: 'Keynote Opening Stage', set: 'Keynotes', type: 'image', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80', exif: { camera: 'Sony A7IV', iso: '400', aperture: 'f/2.8', shutter: '1/500s' } },
      { id: '2', title: 'Panel Discussion Session', set: 'Panel Sessions', type: 'image', url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80', exif: { camera: 'Sony A7IV', iso: '800', aperture: 'f/2.0', shutter: '1/250s' } },
      { id: '3', title: 'Cohort Founder Network', set: 'Behind the Scenes', type: 'image', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80', exif: { camera: 'Sony FX3', iso: '640', aperture: 'f/1.8', shutter: '1/1000s' } },
      { id: '4', title: 'Ecosystem Leaders Dialogue', set: 'Panel Sessions', type: 'image', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80', exif: { camera: 'Sony A7IV', iso: '320', aperture: 'f/2.8', shutter: '1/400s' } },
    ],
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === mockGallery.correctPin) {
      setPinVerified(true);
    } else {
      alert('Invalid Access PIN. Please check your invitation email.');
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
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full p-8 border border-zinc-800 bg-zinc-950 rounded-2xl shadow-[0_0_60px_rgba(124,58,237,0.15)] text-center space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase text-purple-400 tracking-widest">Private Client Gallery</p>
            <h1 className="text-2xl font-light text-white">{mockGallery.title}</h1>
            <p className="text-xs text-zinc-400 font-light">{mockGallery.clientName}</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full text-center text-3xl font-mono tracking-[0.5em] py-3 bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:border-purple-600 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono uppercase tracking-widest rounded-lg transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)]"
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-32">
      {/* 2. Pixieset/Pic-Time Cover Hero Banner */}
      <section className="relative h-[70vh] min-h-125 w-full border-b border-zinc-800 overflow-hidden">
        <Image src={mockGallery.coverImage} alt={mockGallery.title} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-linear-to-t from-[#09090b] via-black/40 to-black/60" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-6 flex flex-col justify-between py-12">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="px-3 py-1 bg-black/60 border border-white/10 rounded-full text-purple-300">
              ● Private Client Access
            </span>
            <span className="text-zinc-400">{mockGallery.date}</span>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-purple-400">{mockGallery.clientName}</p>
            <h1 className="text-4xl md:text-6xl font-light text-white">{mockGallery.title}</h1>

            {/* Quick Action Bar */}
            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setIsDownloadOpen(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono uppercase tracking-widest rounded-full transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]"
              >
                Download Photos 🡇
              </button>
              <button
                onClick={() => setSelectedSet('All')}
                className="px-6 py-3 bg-black/60 border border-zinc-700 hover:border-purple-500 text-zinc-200 text-xs font-mono uppercase tracking-widest rounded-full transition-all"
              >
                Favorites ({favorites.length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sticky Set Tab Navigation */}
      <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {mockGallery.sets.map((setName) => (
              <button
                key={setName}
                onClick={() => setSelectedSet(setName)}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full transition-all ${
                  selectedSet === setName ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white bg-zinc-900/50'
                }`}
              >
                {setName}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-zinc-500 hidden sm:inline-block">
            {filteredItems.length} Deliverables
          </span>
        </div>
      </header>

      {/* 4. Media Grid */}
      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => {
            const isFav = favorites.includes(item.id);
            return (
              <div
                key={item.id}
                className="group relative bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden hover:border-purple-600/50 transition-all duration-300"
              >
                <div
                  className="relative aspect-4/3 w-full cursor-pointer"
                  onClick={() => setLightboxIndex(index)}
                >
                  <Image src={item.url} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>

                {/* Card Action Bar */}
                <div className="p-4 bg-zinc-950 flex justify-between items-center">
                  <p className="text-xs font-medium text-white truncate max-w-50">{item.title}</p>
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className={`p-2 rounded-full text-xs transition-all ${
                      isFav ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
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

      {/* 5. Sticky Proofing Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-zinc-950/95 border-t border-zinc-800 p-4 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-2">
          <div className="text-xs font-mono text-zinc-400">
            Selected: <span className="text-purple-400 font-bold">{favorites.length}</span> / {mockGallery.selectionLimit} Max
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsDownloadOpen(true)}
              className="px-6 py-2.5 border border-zinc-700 text-zinc-300 text-xs font-mono uppercase tracking-widest hover:bg-zinc-800 rounded-full transition-colors"
            >
              Download ZIP
            </button>
            <button
              onClick={handleSubmitSelections}
              disabled={selectionSubmitted}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono uppercase tracking-widest rounded-full transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-50"
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
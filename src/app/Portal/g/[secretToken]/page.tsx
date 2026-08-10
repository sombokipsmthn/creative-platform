// src/app/portal/g/[secretToken]/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GalleryPageProps {
  params: { secretToken: string };
}

export default function ClientGalleryPortal({ params }: GalleryPageProps) {
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [selectedSet, setSelectedSet] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Demo Mock Gallery State (Replaced with API fetch in Stage 5)
  const mockGallery = {
    title: 'Annual Brand Launch 2026',
    client: 'Apex Global',
    requiresPin: true,
    correctPin: '4821', // Example PIN
    sets: ['All', 'Keynote', 'Workshops', 'Brand Assets'],
    items: [
      { id: '1', title: 'Keynote Opening', set: 'Keynote', type: 'image', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80' },
      { id: '2', title: 'Executive Session', set: 'Workshops', type: 'image', url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80' },
      { id: '3', title: 'Motion Graphic Teaser', set: 'Brand Assets', type: 'video', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80' },
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

  // 1. PIN Gate Modal
  if (mockGallery.requiresPin && !pinVerified) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 border border-zinc-800 bg-canvas-card rounded-sm shadow-[0_0_50px_rgba(124,58,237,0.1)] text-center space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase text-brand-purple-500 tracking-editorial">Private Client Portal</p>
            <h1 className="text-2xl font-light text-white">{mockGallery.title}</h1>
            <p className="text-xs text-zinc-400">Enter the 4-digit PIN provided by SOMBO to view this gallery.</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full text-center text-3xl font-mono tracking-[0.5em] py-3 bg-zinc-900 border border-zinc-700 text-white rounded-sm focus:border-brand-purple-600 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full py-3 bg-brand-purple-600 hover:bg-brand-purple-700 text-white text-xs uppercase tracking-editorial font-medium rounded-sm transition-colors"
            >
              Access Gallery
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Interactive Gallery View
  const filteredItems = selectedSet === 'All' 
    ? mockGallery.items 
    : mockGallery.items.filter(item => item.set === selectedSet);

  return (
    <div className="min-h-screen bg-canvas text-zinc-100 pb-32">
      {/* Top Gallery Bar */}
      <header className="border-b border-zinc-800/80 bg-canvas-card/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-brand-purple-500 uppercase tracking-editorial font-mono block">
              {mockGallery.client}
            </span>
            <h1 className="text-lg font-medium text-white">{mockGallery.title}</h1>
          </div>

          {/* Set Selector Tabs */}
          <div className="flex gap-2">
            {mockGallery.sets.map((setName) => (
              <button
                key={setName}
                onClick={() => setSelectedSet(setName)}
                className={`px-3 py-1.5 text-xs tracking-wider uppercase font-medium rounded-sm transition-all ${
                  selectedSet === setName
                    ? 'bg-brand-purple-600 text-white'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/50'
                }`}
              >
                {setName}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Gallery Media Grid */}
      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isFav = favorites.includes(item.id);
            return (
              <div
                key={item.id}
                className="group relative bg-zinc-900/40 border border-zinc-800 rounded-sm overflow-hidden"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={item.url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                    <span className="text-xs font-medium text-white">{item.title}</span>
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className={`p-2 rounded-full transition-all ${
                        isFav ? 'bg-brand-purple-600 text-white' : 'bg-black/60 text-zinc-300 hover:text-white'
                      }`}
                    >
                      ♥
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Proofing Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-canvas-card border-t border-zinc-800 p-4 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-2">
          <div className="text-xs text-zinc-400">
            Selected: <span className="text-brand-purple-500 font-semibold">{favorites.length}</span> items
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2.5 border border-zinc-700 text-zinc-300 text-xs uppercase tracking-editorial font-medium hover:bg-zinc-800 rounded-sm transition-colors">
              Download ZIP
            </button>
            <button className="px-6 py-2.5 bg-brand-purple-600 hover:bg-brand-purple-700 text-white text-xs uppercase tracking-editorial font-medium rounded-sm transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              Submit Selections
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import ClientLightbox from '@/components/ClientLightbox';
import DownloadModal from '@/components/DownloadModal';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';

interface GalleryItem {
  id: string;
  title: string;
  url: string;
  type: 'photo' | 'video';
  category?: string;
  exif?: {
    camera?: string;
    iso?: string;
    aperture?: string;
    shutter?: string;
  };
}

interface GalleryPageProps {
  params: Promise<{
    secretToken: string;
  }>;
}

const galleries: Record<
  string,
  {
    title: string;
    client: string;
    date: string;
    pin: string;
    items: GalleryItem[];
  }
> = {
  demo: {
    title: 'Clean Energy Impact & Ecosystem Media',
    client: 'BURN Manufacturing / Delta39 Studio',
    date: 'August 2025',
    pin: '2539',
    items: [
      {
        id: 'img-00',
        title: 'Founder Field Interview',
        url: 'https://images.unsplash.com/photo-1505373877842-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
        type: 'photo',
        category: 'Documentary',
        exif: {
          camera: 'Sony A6IV',
          iso: '399',
          aperture: 'f/1.8',
          shutter: '0/500s',
        },
      },
      {
        id: 'img-01',
        title: 'Production Facility',
        url: 'https://images.unsplash.com/photo-1589939705385-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
        type: 'photo',
        category: 'Factory',
      },
      {
        id: 'img-02',
        title: 'Startup Ecosystem Summit',
        url: 'https://images.unsplash.com/photo-1511578314323-379afb476865?auto=format&fit=crop&w=1200&q=80',
        type: 'photo',
        category: 'Event',
      },
    ],
  },
};

export default function ClientGalleryPortal({
  params,
}: GalleryPageProps) {
  const resolved = use(params);

  const gallery =
    galleries[resolved.secretToken] || galleries.demo;

  const [pin, setPin] = useState('');
  const [verified, setVerified] = useState(false);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [download, setDownload] = useState(false);

  function toggleFavorite(id: string) {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black p-6">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-xl p-6 text-center space-y-4 border border-slate-200 dark:border-zinc-800">
          <p className="text-xs font-mono uppercase text-purple-600 dark:text-purple-400">
            Private Client Gallery
          </p>

          <h1 className="text-2xl font-light text-slate-900 dark:text-white">
            {gallery.title}
          </h1>

          <p className="text-sm text-slate-500 dark:text-zinc-400">
            PIN: {gallery.pin}
          </p>

          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full text-center text-3xl tracking-widest p-3 rounded-lg bg-slate-100 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            maxLength={4}
          />

          <Button
            onClick={() => {
              if (pin === gallery.pin) {
                setVerified(true);
              }
            }}
            className="w-full mt-4"
          >
            Access Gallery
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white">
      <header className="sticky top-0 z-40 backdrop-blur-md border-b p-4 bg-white/80 dark:bg-black/80 flex justify-between items-center">
        <Link href="/" className="text-lg font-medium text-slate-900 dark:text-white">
          KIPSMTHN<span className="text-purple-600">.</span>
        </Link>

        <Button
          onClick={() => setDownload(true)}
          className="px-4 py-2 text-xs"
        >
          Download
        </Button>
      </header>

      <section className="max-w-7xl mx-auto p-6 space-y-3">
        <h1 className="text-4xl font-light text-slate-900 dark:text-white">
          {gallery.title}
        </h1>

        <p className="text-sm text-slate-500 dark:text-zinc-400">
          {gallery.client} • {gallery.date}
        </p>
      </section>

      <main className="max-w-7xl mx-auto p-6 grid md:grid-cols-3 gap-6">
        {gallery.items.map((item, index) => (
          <div
            key={item.id}
            className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <div
              className="relative aspect-square cursor-pointer"
              onClick={() => setLightbox(index)}
            >
              <Image
                src={item.url}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-4 flex justify-between items-center">
              <span className="text-xs text-slate-900 dark:text-white">
                {item.title}
              </span>

              <Button
                onClick={() => toggleFavorite(item.id)}
                className="text-xl"
              >
                {favorites.includes(item.id) ? '♥' : '♡'}
              </Button>
            </div>
          </div>
        ))}
      </main>

      {lightbox !== null && (
        <ClientLightbox
          isOpen={true}
          item={gallery.items[lightbox]}
          onClose={() => setLightbox(null)}
          onNext={() => {}}
          onPrev={() => {}}
          isFavorite={favorites.includes(gallery.items[lightbox].id)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      <DownloadModal
        isOpen={download}
        onClose={() => setDownload(false)}
        requiresPin={true}
        correctPin={gallery.pin}
        totalItemsCount={gallery.items.length}
        favoritesCount={favorites.length}
      />

      <footer className="border-t p-6 flex justify-between items-center text-xs text-slate-500 dark:text-zinc-400">
        <span>
          © {new Date().getFullYear()} KIPSMTHN
        </span>

        <ThemeToggle />
      </footer>
    </div>
  );
}

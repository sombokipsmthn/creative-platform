'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import ClientLightbox from '@/components/ClientLightbox';
import DownloadModal from '@/components/DownloadModal';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import Footer from '@/components/Footer';

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
      <div className="">
        <div className="">
          <p className="">
            Private Client Gallery
          </p>

          <h1 className="">
            {gallery.title}
          </h1>

          <p className="">
            PIN: {gallery.pin}
          </p>

          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className=""
            maxLength={4}
          />

          <Button
            onClick={() => {
              if (pin === gallery.pin) {
                setVerified(true);
              }
            }}
            className=""
          >
            Access Gallery
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-page">
      <Header variant="client" />
      <div className="ui-page-padded">
        <section className="ui-shell">
          <div className="">
            <h1 className="ui-page-title-lg">{gallery.title}</h1>
            <p className="ui-meta">{gallery.client} • {gallery.date}</p>
          </div>
          <Button
            onClick={() => setDownload(true)}
            variant="secondary"
            size="sm"
          >
            Download
          </Button>
        </section>
        <main className="ui-shell">
          {gallery.items.map((item, index) => (
            <div key={item.id} className="ui-card">
              <div className="" onClick={() => setLightbox(index)}>
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  className=""
                />
              </div>

              <div className="">
                <span className="">
                  {item.title}
                </span>

                <Button
                  onClick={() => toggleFavorite(item.id)}
                  size="lg"
                >
                  {favorites.includes(item.id) ? '♥' : '♡'}
                </Button>
              </div>
            </div>
          ))}
        </main>
      </div>

      {lightbox !== null && (
        <ClientLightbox
          isOpen={true}
          item={gallery.items[lightbox]}
          onClose={() => setLightbox(null)}
          onNext={() => setLightbox((lightbox + 1) % gallery.items.length)}
          onPrev={() => setLightbox((lightbox - 1 + gallery.items.length) % gallery.items.length)}
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

      <Footer />
    </div>
  );
}

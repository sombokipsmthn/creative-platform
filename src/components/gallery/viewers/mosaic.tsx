'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Download, Heart } from 'lucide-react';
import type { GalleryViewerProps } from './wrapper';
import type { GalleryThemeDefinition } from '@/lib/gallery/themes';

interface MosaicViewerProps extends Omit<GalleryViewerProps, 'themeId'> {
  theme: GalleryThemeDefinition;
}

/**
 * Mosaic Theme Viewer
 * 
 * Dynamic grid with varied image aspect ratios.
 * Playful, energetic feel.
 * Organic masonry-style layout.
 */
export function GalleryViewerMosaic({
  id,
  title,
  description,
  theme,
  photos,
  allowDownloads,
  allowFavorites,
  isClient,
  onPhotoDownload,
  onPhotoFavorite,
}: MosaicViewerProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (photos.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="text-center">
          <p className="text-lg font-light text-gray-400">No photos in gallery</p>
        </div>
      </div>
    );
  }

  const handleFavorite = (photoId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(photoId)) {
      newFavorites.delete(photoId);
    } else {
      newFavorites.add(photoId);
    }
    setFavorites(newFavorites);
    onPhotoFavorite?.(photoId, newFavorites.has(photoId));
  };

  // Calculate aspect ratios for varied layout
  // Cycle through different ratios for visual interest
  const getAspectRatio = (index: number): 'square' | 'landscape' | 'portrait' => {
    const pattern = ['landscape', 'square', 'portrait', 'square', 'landscape'];
    return pattern[index % pattern.length] as 'square' | 'landscape' | 'portrait';
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme.preset.backgroundColor,
        color: theme.preset.textColor,
      }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-8 sm:px-10 lg:px-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-base text-gray-600">{description}</p>}
      </div>

      {/* Mosaic Grid */}
      <div className="px-6 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [column-fill:_balance]">
            {photos.map((photo, idx) => {
              const isFavorite = favorites.has(photo.id) || photo.isFavorite;
              const aspectRatio = getAspectRatio(idx);

              const heightClass = {
                square: 'h-64',
                landscape: 'h-48',
                portrait: 'h-80',
              }[aspectRatio];

              return (
                <div
                  key={photo.id}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-lg bg-gray-100 transition-transform hover:scale-105"
                >
                  <div className={`${heightClass} relative group`}>
                    <Image
                      src={photo.displayUrl}
                      alt={photo.filename}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="flex-1 text-xs font-light text-white truncate">
                        {photo.filename}
                      </p>
                      <div className="ml-2 flex gap-2 shrink-0">
                        {allowFavorites && (
                          <button
                            onClick={() => handleFavorite(photo.id)}
                            className="rounded-full bg-white/20 p-1.5 backdrop-blur transition hover:bg-white/30"
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                              }`}
                            />
                          </button>
                        )}
                        {allowDownloads && (
                          <button
                            onClick={() => onPhotoDownload?.(photo.id)}
                            className="rounded-full bg-white/20 p-1.5 backdrop-blur transition hover:bg-white/30"
                          >
                            <Download className="h-4 w-4 text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-6 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{photos.length}</span> photos
          </p>
          {favorites.size > 0 && (
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{favorites.size}</span> favorited
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

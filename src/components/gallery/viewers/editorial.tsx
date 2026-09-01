'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Download, Heart } from 'lucide-react';
import type { GalleryViewerProps } from './wrapper';
import type { GalleryThemeDefinition } from '@/lib/gallery/themes';

interface EditorialViewerProps extends Omit<GalleryViewerProps, 'themeId'> {
  theme: GalleryThemeDefinition;
}

/**
 * Editorial Theme Viewer
 * 
 * Magazine-style layout with mixed image sizes.
 * Featured images with supporting photos.
 * Editorial typography and story-driven presentation.
 */
export function GalleryViewerEditorial({
  id,
  title,
  description,
  theme,
  photos,
  collections,
  allowDownloads,
  allowFavorites,
  isClient,
  onPhotoDownload,
  onPhotoFavorite,
}: EditorialViewerProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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

  // Use first photo as featured image, rest as grid
  const [featured, ...remaining] = photos;

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
        <h1 className="text-3xl font-serif tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">{description}</p>
        )}
      </div>

      {/* Featured Image */}
      <div className="px-6 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="relative aspect-video overflow-hidden bg-gray-100">
            <Image
              src={featured.displayUrl}
              alt={featured.filename}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 70vw"
              priority
            />
          </div>
          {/* Featured Caption */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-light text-gray-500">{featured.filename}</p>
            </div>
            <div className="flex gap-2">
              {allowFavorites && (
                <button
                  onClick={() => handleFavorite(featured.id)}
                  className="p-2 transition hover:bg-gray-100 rounded"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      favorites.has(featured.id) || featured.isFavorite
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              )}
              {allowDownloads && (
                <button
                  onClick={() => onPhotoDownload?.(featured.id)}
                  className="p-2 transition hover:bg-gray-100 rounded"
                >
                  <Download className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Supporting Grid */}
      {remaining.length > 0 && (
        <div className="border-t border-gray-200 px-6 py-8 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-5xl">
            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Gallery
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {remaining.map((photo, idx) => {
                const isFavorite = favorites.has(photo.id) || photo.isFavorite;

                return (
                  <div key={photo.id} className="group relative overflow-hidden bg-gray-100">
                    {/* Image */}
                    <div className="relative aspect-square">
                      <Image
                        src={photo.displayUrl}
                        alt={photo.filename}
                        fill
                        className="object-cover transition group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                      <p className="text-xs font-light text-white">{photo.filename}</p>
                      <div className="flex gap-2">
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
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

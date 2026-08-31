'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Download, Heart, ChevronDown } from 'lucide-react';
import type { GalleryViewerProps } from './wrapper';
import type { GalleryThemeDefinition } from '@/lib/gallery/themes';

interface StoryViewerProps extends Omit<GalleryViewerProps, 'themeId'> {
  theme: GalleryThemeDefinition;
}

/**
 * Story Theme Viewer
 * 
 * Vertical scrolling storytelling layout.
 * Sequential image progression with captions.
 * Timeline-like narrative experience.
 */
export function GalleryViewerStory({
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
}: StoryViewerProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="text-center">
          <p className="text-lg font-light text-gray-400">No photos in gallery</p>
        </div>
      </div>
    );
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const progress = (element.scrollLeft / (element.scrollWidth - element.clientWidth)) * 100;
    setScrollProgress(Math.min(progress, 100));
  };

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

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: theme.preset.backgroundColor,
        color: theme.preset.textColor,
      }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-8 sm:px-10 lg:px-16">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-base text-gray-600">{description}</p>}

        {/* Progress Bar */}
        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* Story Timeline */}
      <div className="flex-1 overflow-x-auto" onScroll={handleScroll}>
        <div className="flex w-max gap-8 px-6 py-8 sm:px-10 lg:px-16">
          {photos.map((photo, idx) => {
            const isFavorite = favorites.has(photo.id) || photo.isFavorite;

            return (
              <div key={photo.id} className="flex-shrink-0 w-96 scroll-snap-align-start">
                {/* Chapter Number/Divider */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-0.5 flex-1 bg-gray-200" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    {idx + 1} of {photos.length}
                  </span>
                  <div className="h-0.5 flex-1 bg-gray-200" />
                </div>

                {/* Image Container */}
                <div className="mb-4 overflow-hidden rounded-lg bg-gray-100">
                  <div className="relative aspect-video">
                    <Image
                      src={photo.displayUrl}
                      alt={photo.filename}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 384px"
                    />
                  </div>
                </div>

                {/* Caption */}
                <div className="mb-4">
                  <p className="text-sm font-medium">{photo.filename}</p>
                  {photo.captureDate && (
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(photo.captureDate).toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-gray-200 pt-4">
                  {allowFavorites && (
                    <button
                      onClick={() => handleFavorite(photo.id)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2 transition hover:bg-gray-100"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                        }`}
                      />
                      <span className="text-xs">
                        {isFavorite ? 'Favorited' : 'Favorite'}
                      </span>
                    </button>
                  )}

                  {allowDownloads && (
                    <button
                      onClick={() => onPhotoDownload?.(photo.id)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2 transition hover:bg-gray-100"
                    >
                      <Download className="h-4 w-4 text-gray-400" />
                      <span className="text-xs">Download</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-6 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <ChevronDown className="h-4 w-4 rotate-90" />
            Scroll to explore the story
          </p>
        </div>
      </div>
    </div>
  );
}

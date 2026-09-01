'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Download, Heart, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#09090b] p-6">
        <div className="text-center">
          <p className="text-lg font-light text-slate-400 dark:text-zinc-500">No photos in gallery</p>
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
      <div className="border-b border-slate-200 dark:border-zinc-800 px-6 py-8 sm:px-10 lg:px-16">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-base text-slate-600 dark:text-zinc-400">{description}</p>}

        {/* Progress Bar */}
        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
          <div
            className="h-full bg-black dark:bg-white transition-all duration-300"
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
                  <div className="h-0.5 flex-1 bg-slate-200 dark:bg-zinc-800" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                    {idx + 1} of {photos.length}
                  </span>
                  <div className="h-0.5 flex-1 bg-slate-200 dark:bg-zinc-800" />
                </div>

                {/* Image Container */}
                <div className="mb-4 overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-900">
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
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{photo.filename}</p>
                  {photo.captureDate && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                      {new Date(photo.captureDate).toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-slate-200 dark:border-zinc-800 pt-4">
                  {allowFavorites && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFavorite(photo.id)}
                      className="flex items-center gap-1.5"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400 dark:text-zinc-500'
                        }`}
                      />
                      <span className="text-xs">
                        {isFavorite ? 'Favorited' : 'Favorite'}
                      </span>
                    </Button>
                  )}

                  {allowDownloads && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPhotoDownload?.(photo.id)}
                      className="flex items-center gap-1.5"
                    >
                      <Download className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                      <span className="text-xs">Download</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-6 py-6 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <ChevronDown className="h-4 w-4 rotate-90" />
            Scroll to explore the story
          </p>
        </div>
      </div>
    </div>
  );
}

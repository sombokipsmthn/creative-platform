'use client';

import React, { useState } from 'react';
import { GalleryMedia } from './media';
import { Download, Heart } from "@phosphor-icons/react";
import { Button } from '@/components/ui/button';
import type { GalleryViewerProps } from './wrapper';
import { getGalleryFontStack, type GalleryThemeDefinition } from '@/lib/gallery/themes';

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
  title,
  description,
  theme,
  photos,
  allowDownloads,
  allowFavorites,
  onPhotoDownload,
  onPhotoFavorite,
}: MosaicViewerProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  if (photos.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#09090b] p-6">
        <div className="text-center">
          <p className="text-lg font-light text-slate-400 dark:text-zinc-500">No photos in gallery</p>
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
        fontFamily: getGalleryFontStack(theme.preset.fontFamily),
      }}
    >
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-zinc-800 px-6 py-8 sm:px-10 lg:px-16">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-base text-slate-600 dark:text-zinc-400">{description}</p>}
      </div>

      {/* Mosaic Grid */}
      <div className="px-6 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div
            className={theme.preset.gridStyle === 'uniform' ? 'grid' : theme.preset.gridStyle === 'horizontal' ? 'flex overflow-x-auto' : 'columns-1 [column-fill:_balance]'}
            style={{
              ...(theme.preset.gridStyle === 'uniform'
                ? { gridTemplateColumns: `repeat(${theme.preset.masonryColumns}, minmax(0, 1fr))`, gap: theme.preset.gridSpacing === 'tight' ? 8 : theme.preset.gridSpacing === 'wide' ? 24 : 16 }
                : theme.preset.gridStyle === 'horizontal'
                  ? { gap: theme.preset.gridSpacing === 'tight' ? 8 : theme.preset.gridSpacing === 'wide' ? 24 : 16 }
                  : { columnCount: theme.preset.gridStyle === 'vertical' ? 1 : theme.preset.masonryColumns, columnGap: theme.preset.gridSpacing === 'tight' ? 8 : theme.preset.gridSpacing === 'wide' ? 24 : 16 }),
            }}
          >
            {photos.map((photo, idx) => {
              const isFavorite = favorites.has(photo.id) || photo.isFavorite;
              const aspectRatio = getAspectRatio(idx);

              const ratio = theme.preset.aspectRatio === 'auto'
                ? ({ square: '1 / 1', landscape: '3 / 2', portrait: '2 / 3' } as const)[aspectRatio]
                : theme.preset.aspectRatio.replace(':', ' / ');

              return (
                <div
                  key={photo.id}
                  className={`mb-4 break-inside-avoid overflow-hidden bg-slate-100 dark:bg-zinc-900 transition-transform hover:scale-[1.01] ${theme.preset.gridStyle === 'uniform' ? '' : ''}`} style={{ borderRadius: theme.preset.borderRadius, marginBottom: theme.preset.gridStyle === 'uniform' || theme.preset.gridStyle === 'horizontal' ? 0 : theme.preset.gridSpacing === 'tight' ? 8 : theme.preset.gridSpacing === 'wide' ? 24 : 16, minWidth: theme.preset.gridStyle === 'horizontal' ? 'min(78vw, 420px)' : undefined, flexShrink: theme.preset.gridStyle === 'horizontal' ? 0 : undefined }}
                >
                  <div className="relative w-full group" style={{ aspectRatio: ratio }}>
                    <GalleryMedia
                      src={photo.displayUrl}
                      poster={photo.thumbnailUrl}
                      mimeType={photo.mimeType}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleFavorite(photo.id)}
                            className="rounded-full bg-white/20 p-1.5 backdrop-blur transition hover:bg-white/30"
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                              }`}
                            />
                          </Button>
                        )}
                        {allowDownloads && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onPhotoDownload?.(photo.id)}
                            className="rounded-full bg-white/20 p-1.5 backdrop-blur transition hover:bg-white/30"
                          >
                            <Download className="h-4 w-4 text-white" />
                          </Button>
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
      <div className="border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-6 py-6 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            <span className="font-semibold">{photos.length}</span> photos
          </p>
          {favorites.size > 0 && (
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              <span className="font-semibold">{favorites.size}</span> favorited
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

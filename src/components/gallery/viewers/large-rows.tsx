'use client';

import React, { useState } from 'react';
import { GalleryMedia } from './media';
import { Download, Heart } from "@phosphor-icons/react";
import { Button } from '@/components/ui/button';
import type { GalleryViewerProps } from './wrapper';
import { getGalleryFontStack, type GalleryThemeDefinition } from '@/lib/gallery/themes';

interface LargeRowsViewerProps extends Omit<GalleryViewerProps, 'themeId'> {
  theme: GalleryThemeDefinition;
}

/**
 * Large Rows Viewer — SECONDARY KIPSMTHN gallery layout.
 *
 * Larger photographs with more breathing room. Fewer images visible at
 * once. Editorial, immersive presentation. Suitable for wedding highlights,
 * landscape photography and curated selections.
 */
export function GalleryViewerLargeRows({
  title,
  description,
  theme,
  photos,
  allowDownloads,
  allowFavorites,
  onPhotoSelect,
  onPhotoFavorite,
  onPhotoDownload,
}: LargeRowsViewerProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  if (photos.length === 0) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-6"
        style={{
          backgroundColor: theme.preset.backgroundColor,
          color: theme.preset.textColor,
          fontFamily: getGalleryFontStack(theme.preset.fontFamily),
        }}
      >
        <div className="text-center">
          <p className="text-lg font-light opacity-60">No photos in gallery</p>
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

  const handleSelect = (photoId: string) => {
    onPhotoSelect?.(photoId);
  };

  const gapClass =
    theme.preset.gridSpacing === 'tight' ? 'gap-4' :
    theme.preset.gridSpacing === 'wide' ? 'gap-10' : 'gap-6';

  // Large rows show 1-2 photos per row depending on orientation.
  const photosPerRow = 2;

  const rows: typeof photos[] = [];
  for (let i = 0; i < photos.length; i += photosPerRow) {
    rows.push(photos.slice(i, i + photosPerRow));
  }

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
      <div className="px-6 py-12 sm:px-10 lg:px-16">
        <h1 className="text-4xl font-light tracking-tight sm:text-5xl">{title}</h1>
        {description && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed opacity-75">
            {description}
          </p>
        )}
      </div>

      {/* Large Rows */}
      <div className="space-y-8 px-6 pb-24 sm:px-10 lg:px-16">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={`grid grid-cols-1 ${row.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'} ${gapClass}`}>
            {row.map((photo) => {
              const isFavorite = favorites.has(photo.id) || photo.isFavorite;
              return (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden"
                  style={{ borderRadius: theme.preset.borderRadius }}
                  onClick={() => handleSelect(photo.id)}
                >
                  <div
                    className="relative w-full cursor-pointer"
                    style={{
                      aspectRatio: photo.width && photo.height ? `${photo.width} / ${photo.height}` : '16 / 9',
                    }}
                  >
                    <GalleryMedia
                      src={photo.displayUrl}
                      poster={photo.thumbnailUrl}
                      mimeType={photo.mimeType}
                      alt={photo.filename}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                    />
                    <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="text-sm font-light text-white">
                        {photo.filename}
                      </p>
                      <div className="flex gap-2">
                        {allowFavorites && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleFavorite(photo.id); }}
                            className="h-9 w-9 rounded-full bg-white/20 p-2 backdrop-blur transition hover:bg-white/30"
                          >
                            <Heart
                              className={`h-5 w-5 ${
                                isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                              }`}
                            />
                          </Button>
                        )}
                        {allowDownloads && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); onPhotoDownload?.(photo.id); }}
                            className="h-9 w-9 rounded-full bg-white/20 p-2 backdrop-blur transition hover:bg-white/30"
                          >
                            <Download className="h-5 w-5 text-white" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GalleryViewerLargeRows;
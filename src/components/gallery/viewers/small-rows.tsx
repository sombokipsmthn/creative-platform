'use client';

import React, { useState } from 'react';
import { GalleryMedia } from './media';
import { Download, Heart } from "@phosphor-icons/react";
import { Button } from '@/components/ui/button';
import type { GalleryViewerProps } from './wrapper';
import { getGalleryFontStack, type GalleryThemeDefinition } from '@/lib/gallery/themes';

interface SmallRowsViewerProps extends Omit<GalleryViewerProps, 'themeId'> {
  theme: GalleryThemeDefinition;
}

/**
 * Small Rows Viewer — SECONDARY KIPSMTHN gallery layout.
 *
 * Images presented in horizontal rows. Compact but comfortable
 * presentation. Image sizing adapts to available width and orientation.
 * Preserves image proportions and avoids excessive whitespace.
 */
export function GalleryViewerSmallRows({
  title,
  description,
  theme,
  photos,
  allowDownloads,
  allowFavorites,
  onPhotoSelect,
  onPhotoFavorite,
  onPhotoDownload,
}: SmallRowsViewerProps) {
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

  // Group photos into rows of ~6 based on thumbnail size and viewport.
  const photosPerRow =
    theme.preset.thumbnailSize === 'small' ? 8 :
    theme.preset.thumbnailSize === 'large' ? 4 : 6;

  const rows: typeof photos[] = [];
  for (let i = 0; i < photos.length; i += photosPerRow) {
    rows.push(photos.slice(i, i + photosPerRow));
  }

  const gapClass =
    theme.preset.gridSpacing === 'tight' ? 'gap-2' :
    theme.preset.gridSpacing === 'wide' ? 'gap-5' : 'gap-3';

  const rowHeight =
    theme.preset.thumbnailSize === 'small' ? 'h-40' :
    theme.preset.thumbnailSize === 'large' ? 'h-72' : 'h-56';

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
      <div className="px-6 py-10 sm:px-10 lg:px-16">
        <h1 className="text-3xl font-light tracking-tight sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed opacity-75">
            {description}
          </p>
        )}
      </div>

      {/* Rows */}
      <div className="space-y-6 px-6 pb-20 sm:px-10 lg:px-16">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 ${gapClass}`}>
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
                      aspectRatio: photo.width && photo.height ? `${photo.width} / ${photo.height}` : '3 / 2',
                    }}
                  >
                    <GalleryMedia
                      src={photo.displayUrl}
                      poster={photo.thumbnailUrl}
                      mimeType={photo.mimeType}
                      alt={photo.filename}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                    />
                    <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="truncate text-xs font-light text-white">
                        {photo.filename}
                      </p>
                      <div className="flex gap-1">
                        {allowFavorites && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleFavorite(photo.id); }}
                            className="h-7 w-7 rounded-full bg-white/20 p-1 backdrop-blur transition hover:bg-white/30"
                          >
                            <Heart
                              className={`h-3.5 w-3.5 ${
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
                            className="h-7 w-7 rounded-full bg-white/20 p-1 backdrop-blur transition hover:bg-white/30"
                          >
                            <Download className="h-3.5 w-3.5 text-white" />
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

export default GalleryViewerSmallRows;
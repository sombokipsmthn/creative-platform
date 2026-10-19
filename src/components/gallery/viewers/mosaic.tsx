'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Download, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <div className="">
        <div className="">
          <p className="">No photos in gallery</p>
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
      className=""
      style={{
        backgroundColor: theme.preset.backgroundColor,
        color: theme.preset.textColor,
      }}
    >
      {/* Header */}
      <div className="">
        <h1 className="">{title}</h1>
        {description && <p className="">{description}</p>}
      </div>

      {/* Mosaic Grid */}
      <div className="">
        <div className="">
          <div className="">
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
                  className=""
                >
                  <div className={`${heightClass} relative group`}>
                    <Image
                      src={photo.displayUrl}
                      alt={photo.filename}
                      fill
                      className=""
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Overlay on Hover */}
                    <div className="to-transparent">
                      <p className="">
                        {photo.filename}
                      </p>
                      <div className="">
                        {allowFavorites && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleFavorite(photo.id)}
                            className=""
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
                            className=""
                          >
                            <Download className="" />
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
      <div className="">
        <div className="">
          <p className="">
            <span className="">{photos.length}</span> photos
          </p>
          {favorites.size > 0 && (
            <p className="">
              <span className="">{favorites.size}</span> favorited
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

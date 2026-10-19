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
  title,
  description,
  theme,
  photos,
  allowDownloads,
  allowFavorites,
  onPhotoDownload,
  onPhotoFavorite,
}: EditorialViewerProps) {
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

  // Use first photo as featured image, rest as grid
  const [featured, ...remaining] = photos;

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
        {description && (
          <p className="">{description}</p>
        )}
      </div>

      {/* Featured Image */}
      <div className="">
        <div className="">
          <div className="">
            <Image
              src={featured.displayUrl}
              alt={featured.filename}
              fill
              className=""
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 70vw"
              priority
            />
          </div>
          {/* Featured Caption */}
          <div className="">
            <div className="">
              <p className="">{featured.filename}</p>
            </div>
            <div className="">
              {allowFavorites && (
                <button
                  onClick={() => handleFavorite(featured.id)}
                  className=""
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
                  className=""
                >
                  <Download className="" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Supporting Grid */}
      {remaining.length > 0 && (
        <div className="">
          <div className="">
            <p className="">
              Gallery
            </p>

            <div className="">
              {remaining.map((photo) => {
                const isFavorite = favorites.has(photo.id) || photo.isFavorite;

                return (
                  <div key={photo.id} className="">
                    {/* Image */}
                    <div className="">
                      <Image
                        src={photo.displayUrl}
                        alt={photo.filename}
                        fill
                        className=""
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>

                    {/* Overlay on Hover */}
                    <div className="to-transparent">
                      <p className="">{photo.filename}</p>
                      <div className="">
                        {allowFavorites && (
                          <button
                            onClick={() => handleFavorite(photo.id)}
                            className=""
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
                            className=""
                          >
                            <Download className="" />
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

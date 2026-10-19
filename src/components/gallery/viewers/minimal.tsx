'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Download, Heart } from 'lucide-react';
import type { GalleryViewerProps } from './wrapper';
import type { GalleryThemeDefinition } from '@/lib/gallery/themes';

interface MinimalViewerProps extends Omit<GalleryViewerProps, 'themeId'> {
  theme: GalleryThemeDefinition;
}

/**
 * Minimal Theme Viewer
 *
 * Clean, spacious single-image focus with navigation.
 * Large images with plenty of whitespace.
 * Minimal UI chrome.
 */
export function GalleryViewerMinimal({
  title,
  description,
  theme,
  photos,
  allowDownloads,
  allowFavorites,
  onPhotoDownload,
  onPhotoFavorite,
}: MinimalViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const currentPhoto = photos[currentIndex];
  const hasNext = currentIndex < photos.length - 1;
  const hasPrev = currentIndex > 0;

  const handlePrev = () => {
    if (hasPrev) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (hasNext) setCurrentIndex(currentIndex + 1);
  };

  const handleFavorite = () => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(currentPhoto.id)) {
      newFavorites.delete(currentPhoto.id);
    } else {
      newFavorites.add(currentPhoto.id);
    }
    setFavorites(newFavorites);
    onPhotoFavorite?.(currentPhoto.id, newFavorites.has(currentPhoto.id));
  };

  const isFavorite = favorites.has(currentPhoto.id) || currentPhoto.isFavorite;

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

      {/* Main Content */}
      <div className="">
        {/* Image Container */}
        <div className="">
          <div className="">
            <div className="">
              <Image
                src={currentPhoto.displayUrl}
                alt={currentPhoto.filename}
                width={currentPhoto.width || 1200}
                height={currentPhoto.height || 800}
                className=""
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              />
            </div>
          </div>
        </div>

        {/* Photo Counter & Navigation */}
        <div className="">
          {/* Left Navigation */}
          <button
            onClick={handlePrev}
            disabled={!hasPrev}
            className=""
            aria-label="Previous photo"
          >
            <ChevronLeft className="" />
          </button>

          {/* Counter */}
          <div className="">
            <p className="">
              {currentIndex + 1} of {photos.length}
            </p>
          </div>

          {/* Right Navigation */}
          <button
            onClick={handleNext}
            disabled={!hasNext}
            className=""
            aria-label="Next photo"
          >
            <ChevronRight className="" />
          </button>
        </div>

        {/* Actions */}
        {(allowDownloads || allowFavorites) && (
          <div className="">
            {allowFavorites && (
              <button
                onClick={handleFavorite}
                className=""
              >
                <Heart
                  className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                />
                <span className="">{isFavorite ? 'Favorited' : 'Favorite'}</span>
              </button>
            )}

            {allowDownloads && (
              <button
                onClick={() => onPhotoDownload?.(currentPhoto.id)}
                className=""
              >
                <Download className="" />
                <span className="">Download</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      <div className="">
        <div className="">
          <div className="">
            {photos.map((photo, idx) => (
              <button
                key={photo.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded transition ${
                  idx === currentIndex ? 'ring-2 ring-black' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={photo.thumbnailUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className=""
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

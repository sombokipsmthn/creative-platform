'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Download, Heart, Tag } from 'lucide-react';
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
}: MinimalViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
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
      className="min-h-screen"
      style={{
        backgroundColor: theme.preset.backgroundColor,
        color: theme.preset.textColor,
      }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-6 sm:px-10 lg:px-16">
        <h1 className="text-2xl font-light tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10 lg:px-16">
        {/* Image Container */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative w-full max-w-2xl">
            <div className="relative aspect-auto overflow-hidden bg-gray-100">
              <Image
                src={currentPhoto.displayUrl}
                alt={currentPhoto.filename}
                width={currentPhoto.width || 1200}
                height={currentPhoto.height || 800}
                className="h-full w-full object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              />
            </div>
          </div>
        </div>

        {/* Photo Counter & Navigation */}
        <div className="flex items-center justify-between gap-4">
          {/* Left Navigation */}
          <button
            onClick={handlePrev}
            disabled={!hasPrev}
            className="rounded-full p-3 transition disabled:opacity-30 hover:bg-gray-100"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Counter */}
          <div className="flex-1 text-center">
            <p className="text-sm font-light text-gray-500">
              {currentIndex + 1} of {photos.length}
            </p>
          </div>

          {/* Right Navigation */}
          <button
            onClick={handleNext}
            disabled={!hasNext}
            className="rounded-full p-3 transition disabled:opacity-30 hover:bg-gray-100"
            aria-label="Next photo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Actions */}
        {(allowDownloads || allowFavorites) && (
          <div className="mt-6 flex gap-3 border-t border-gray-200 pt-6">
            {allowFavorites && (
              <button
                onClick={handleFavorite}
                className="flex items-center gap-2 rounded-lg px-4 py-2 transition hover:bg-gray-100"
              >
                <Heart
                  className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                />
                <span className="text-sm">{isFavorite ? 'Favorited' : 'Favorite'}</span>
              </button>
            )}

            {allowDownloads && (
              <button
                onClick={() => onPhotoDownload?.(currentPhoto.id)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 transition hover:bg-gray-100"
              >
                <Download className="h-5 w-5 text-gray-400" />
                <span className="text-sm">Download</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-6 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex gap-2 overflow-x-auto pb-2">
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
                  className="object-cover"
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

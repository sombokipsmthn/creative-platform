'use client';

import React, { useState } from 'react';
import { GalleryMedia } from './media';
import { Download, Heart, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GalleryViewerProps } from './wrapper';
import type { GalleryThemeDefinition } from '@/lib/gallery/themes';

interface StoryViewerProps extends Omit<GalleryViewerProps, 'themeId'> {
  theme: GalleryThemeDefinition;
  /** When true, renders with sample content for preview purposes */
  isPreview?: boolean;
}

/**
 * Story Theme Viewer
 *
 * Vertical scrolling storytelling layout.
 * Sequential image progression with captions.
 * Timeline-like narrative experience.
 */
export function GalleryViewerStory({
  title,
  description,
  theme,
  photos,
  allowDownloads,
  allowFavorites,
  onPhotoDownload,
  onPhotoFavorite,
  isPreview = false,
}: StoryViewerProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);

  // Sample content for preview mode
  const samplePhotos = [
    {
      id: 'sample-1',
      filename: 'Chapter 1: Beginning',
      displayUrl: '/sample-portrait-1.svg',
      thumbnailUrl: '/sample-portrait-1-thumb.svg',
      captureDate: '2024-01-15T10:00:00Z',
    },
    {
      id: 'sample-2',
      filename: 'Chapter 2: Journey',
      displayUrl: '/sample-landscape-1.svg',
      thumbnailUrl: '/sample-landscape-1-thumb.svg',
      captureDate: '2024-01-16T14:30:00Z',
    },
    {
      id: 'sample-3',
      filename: 'Chapter 3: Discovery',
      displayUrl: '/sample-portrait-2.svg',
      thumbnailUrl: '/sample-portrait-2-thumb.svg',
      captureDate: '2024-01-17T09:15:00Z',
    },
    {
      id: 'sample-4',
      filename: 'Chapter 4: Reflection',
      displayUrl: '/sample-landscape-2.svg',
      thumbnailUrl: '/sample-landscape-2-thumb.svg',
      captureDate: '2024-01-18T16:45:00Z',
    },
    {
      id: 'sample-5',
      filename: 'Chapter 5: Resolution',
      displayUrl: '/sample-detail-1.svg',
      thumbnailUrl: '/sample-detail-1-thumb.svg',
      captureDate: '2024-01-19T11:20:00Z',
    },
  ];

  const displayPhotos = (isPreview && photos.length === 0) ? samplePhotos : photos;

  // Type for sample photos with optional isFavorite
  interface SamplePhoto {
    id: string;
    filename: string;
    displayUrl: string;
    thumbnailUrl: string;
    captureDate?: string;
    mimeType?: string | null;
    isFavorite?: boolean;
  }

  if (displayPhotos.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: theme.preset.backgroundColor }}>
        <div className="text-center p-6">
          <p className="text-lg font-light" style={{ color: theme.preset.textColor }}>
            {isPreview ? 'No photos in gallery — this is a preview' : 'No photos in gallery'}
          </p>
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
      <div className="border-b px-6 py-8 sm:px-10 lg:px-16" style={{ borderColor: theme.preset.textColor + '33' }}>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-base" style={{ color: theme.preset.textColor + '99' }}>{description}</p>}
        {isPreview && (
          <p className="mt-2 text-xs text-amber-600">Preview mode — sample content shown</p>
        )}

        {/* Progress Bar */}
        <div className="mt-6 h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: theme.preset.textColor + '33' }}>
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${scrollProgress}%`, backgroundColor: theme.preset.accentColor }}
          />
        </div>
      </div>

      {/* Story Timeline */}
      <div className="flex-1 overflow-x-auto" onScroll={handleScroll}>
        <div className="flex w-max gap-8 px-6 py-8 sm:px-10 lg:px-16">
          {displayPhotos.map((photo, idx) => {
            const isFavorite = favorites.has(photo.id) || (photo as SamplePhoto).isFavorite;

            return (
              <div key={photo.id} className="flex-shrink-0 w-96 scroll-snap-align-start">
                {/* Chapter Number/Divider */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-0.5 flex-1" style={{ backgroundColor: theme.preset.textColor + '33' }} />
                  <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: theme.preset.textColor + '99' }}>
                    {idx + 1} of {displayPhotos.length}
                  </span>
                  <div className="h-0.5 flex-1" style={{ backgroundColor: theme.preset.textColor + '33' }} />
                </div>

                {/* Image Container */}
                <div className="mb-4 overflow-hidden rounded-xl" style={{ backgroundColor: theme.preset.backgroundColor }}>
                  <div className="relative aspect-video">
                    <GalleryMedia
                      src={photo.displayUrl}
                      poster={photo.thumbnailUrl}
                      mimeType={'mimeType' in photo ? photo.mimeType : null}
                      alt={photo.filename}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 384px"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Caption */}
                <div className="mb-4">
                  <p className="text-sm font-medium">{photo.filename}</p>
                  {photo.captureDate && (
                    <p className="mt-1 text-xs" style={{ color: theme.preset.textColor + '99' }}>
                      {new Date(photo.captureDate).toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t pt-4" style={{ borderColor: theme.preset.textColor + '33' }}>
                  {allowFavorites && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFavorite(photo.id)}
                      className="flex items-center gap-1.5"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isFavorite ? 'fill-red-500 text-red-500' : ''
                        }`}
                        style={{ color: isFavorite ? undefined : theme.preset.textColor }}
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
                      <Download className="h-4 w-4" style={{ color: theme.preset.textColor }} />
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
      <div className="border-t bg-gray-50 px-6 py-6 sm:px-10 lg:px-16" style={{ borderColor: theme.preset.textColor + '33', backgroundColor: theme.preset.backgroundColor + 'CC' }}>
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-2 text-xs" style={{ color: theme.preset.textColor + '99' }}>
            <ChevronDown className="h-4 w-4 rotate-90" />
            Scroll to explore the story
          </p>
        </div>
      </div>
    </div>
  );
}
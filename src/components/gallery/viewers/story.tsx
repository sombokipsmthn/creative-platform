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
  title,
  description,
  theme,
  photos,
  allowDownloads,
  allowFavorites,
  onPhotoDownload,
  onPhotoFavorite,
}: StoryViewerProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="">
        <div className="">
          <p className="">No photos in gallery</p>
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

        {/* Progress Bar */}
        <div className="">
          <div
            className=""
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* Story Timeline */}
      <div className="" onScroll={handleScroll}>
        <div className="">
          {photos.map((photo, idx) => {
            const isFavorite = favorites.has(photo.id) || photo.isFavorite;

            return (
              <div key={photo.id} className="">
                {/* Chapter Number/Divider */}
                <div className="">
                  <div className="" />
                  <span className="">
                    {idx + 1} of {photos.length}
                  </span>
                  <div className="" />
                </div>

                {/* Image Container */}
                <div className="">
                  <div className="">
                    <Image
                      src={photo.displayUrl}
                      alt={photo.filename}
                      fill
                      className=""
                      sizes="(max-width: 768px) 100vw, 384px"
                    />
                  </div>
                </div>

                {/* Caption */}
                <div className="">
                  <p className="">{photo.filename}</p>
                  {photo.captureDate && (
                    <p className="">
                      {new Date(photo.captureDate).toLocaleDateString('en-KE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="">
                  {allowFavorites && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFavorite(photo.id)}
                      className=""
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400 dark:text-zinc-500'
                        }`}
                      />
                      <span className="">
                        {isFavorite ? 'Favorited' : 'Favorite'}
                      </span>
                    </Button>
                  )}

                  {allowDownloads && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPhotoDownload?.(photo.id)}
                      className=""
                    >
                      <Download className="" />
                      <span className="">Download</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="">
        <div className="">
          <p className="">
            <ChevronDown className="" />
            Scroll to explore the story
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, Heart, ChevronDown } from 'lucide-react';
import type { GalleryViewerProps } from './wrapper';
import type { GalleryThemeDefinition } from '@/lib/gallery/themes';

interface CinematicViewerProps extends Omit<GalleryViewerProps, 'themeId'> {
  theme: GalleryThemeDefinition;
}

/**
 * Cinematic Theme Viewer
 * 
 * Full-screen hero images with minimal UI.
 * Fade-in navigation controls.
 * Dark theme, dramatic lighting.
 * Slideshow-like experience.
 */
export function GalleryViewerCinematic({
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
}: CinematicViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showUI, setShowUI] = useState(true);
  const [autoplay, setAutoplay] = useState(true);

  // Autoplay effect
  useEffect(() => {
    if (!autoplay) return;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 5000); // 5 seconds per image

    return () => clearTimeout(timer);
  }, [currentIndex, autoplay, photos.length]);

  // Hide UI when moving mouse, show on movement
  useEffect(() => {
    let hideTimer: NodeJS.Timeout;

    const handleMouseMove = () => {
      setShowUI(true);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setShowUI(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(hideTimer);
    };
  }, []);

  if (photos.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-gray-400">No photos in gallery</p>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];
  const isFavorite = favorites.has(currentPhoto.id) || currentPhoto.isFavorite;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setAutoplay(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setAutoplay(false);
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Full-screen Image */}
      <div className="absolute inset-0">
        <Image
          src={currentPhoto.displayUrl}
          alt={currentPhoto.filename}
          fill
          className="object-cover transition-opacity duration-1000"
          sizes="100vw"
          priority
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
      </div>

      {/* Header - Top */}
      <div
        className={`absolute top-0 left-0 right-0 z-10 transition-opacity duration-300 ${
          showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-6 py-6 sm:px-10 lg:px-16">
          <h1 className="text-3xl font-light text-white sm:text-4xl">{title}</h1>
        </div>
      </div>

      {/* Center - Navigation & Actions */}
      <div
        className={`absolute inset-0 flex items-center justify-between px-6 transition-opacity duration-300 ${
          showUI ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="rounded-full bg-white/10 p-4 backdrop-blur transition hover:bg-white/20"
          aria-label="Previous photo"
        >
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="rounded-full bg-white/10 p-4 backdrop-blur transition hover:bg-white/20"
          aria-label="Next photo"
        >
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Bottom - Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-300 ${
          showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-gradient-to-t from-black/80 to-transparent px-6 py-6 sm:px-10 lg:px-16">
          {/* Counter & Progress */}
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <p className="text-sm text-white/80">
                {currentIndex + 1} / {photos.length}
              </p>
              {/* Progress dots */}
              <div className="flex gap-1">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setAutoplay(false);
                    }}
                    className={`h-1 rounded-full transition ${
                      idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Go to photo ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {allowFavorites && (
              <button
                onClick={handleFavorite}
                className="rounded-full bg-white/10 p-3 backdrop-blur transition hover:bg-white/20"
              >
                <Heart
                  className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
                />
              </button>
            )}

            {allowDownloads && (
              <button
                onClick={() => onPhotoDownload?.(currentPhoto.id)}
                className="rounded-full bg-white/10 p-3 backdrop-blur transition hover:bg-white/20"
              >
                <Download className="h-5 w-5 text-white" />
              </button>
            )}

            {/* Autoplay Toggle */}
            <button
              onClick={() => setAutoplay(!autoplay)}
              className="rounded-full bg-white/10 p-3 backdrop-blur transition hover:bg-white/20"
            >
              {autoplay ? (
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-300 ${
          showUI ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <ChevronDown className="h-5 w-5 animate-bounce text-white/50" />
      </div>
    </div>
  );
}

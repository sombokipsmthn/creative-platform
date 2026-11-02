'use client';

import React from 'react';
import { GalleryMedia } from '../media';
import { getGalleryFontStack, type GalleryThemeDefinition } from '@/lib/gallery/themes';
import type { CoverRendererProps } from './full-image';

/**
 * Editorial — magazine-inspired composition.
 */
export function EditorialCover({
  theme,
  coverPhoto,
  title,
  description,
  focalX = 50,
  focalY = 50,
  showTitle = true,
  showDescription = true,
  showBranding = true,
  studioName,
  logoUrl,
  logoSize = 'medium',
  brandColor = '#000000',
  className,
}: CoverRendererProps) {
  const bgStyle = {
    backgroundColor: theme.preset.backgroundColor,
    color: theme.preset.textColor,
    fontFamily: getGalleryFontStack(theme.preset.fontFamily),
  };

  const logoSizeClass =
    logoSize === 'small' ? 'h-5 w-5' :
    logoSize === 'large' ? 'h-10 w-10' : 'h-7 w-7';

  return (
    <div className={className} style={bgStyle}>
      <div className="px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          {/* Magazine masthead */}
          <div className="mb-8 flex items-end justify-between border-b pb-4" style={{ borderColor: theme.preset.textColor + '22' }}>
            <div className="flex items-center gap-3">
              {showBranding && logoUrl && (
                <img
                  src={logoUrl}
                  alt={studioName || 'Studio logo'}
                  className={`${logoSizeClass} rounded-md object-contain`}
                />
              )}
              {showBranding && studioName && (
                <span
                  className="text-xs font-medium tracking-[0.25em] uppercase"
                  style={{ color: theme.preset.textColor + '99' }}
                >
                  {studioName}
                </span>
              )}
            </div>
            <span
              className="text-xs font-medium tracking-[0.2em] uppercase"
              style={{ color: theme.preset.textColor + '99' }}
            >
              Vol. {new Date().getFullYear()}
            </span>
          </div>

          {/* Two-column editorial layout */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {/* Image column — 3 parts */}
            <div className="lg:col-span-3">
              <div
                className="overflow-hidden"
                style={{ borderRadius: theme.preset.borderRadius }}
              >
                <div
                  className="relative aspect-[4/5]"
                  style={{
                    aspectRatio: coverPhoto?.width && coverPhoto?.height
                      ? `${coverPhoto.width} / ${coverPhoto.height}`
                      : '4 / 5',
                  }}
                >
                  {coverPhoto ? (
                    <GalleryMedia
                      src={coverPhoto.displayUrl}
                      poster={coverPhoto.thumbnailUrl}
                      alt={coverPhoto.filename}
                      fill
                      unoptimized
                      className="object-cover"
                      style={{
                        objectPosition: `${focalX}% ${focalY}%`,
                      }}
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: theme.preset.textColor + '11' }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Text column — 2 parts */}
            <div className="lg:col-span-2 flex flex-col justify-center">
              {showTitle && title && (
                <h1
                  className="text-5xl font-light leading-tight tracking-tight sm:text-6xl"
                  style={{ color: theme.preset.textColor }}
                >
                  {title}
                </h1>
              )}
              <div
                className="mt-4 h-px w-16"
                style={{ backgroundColor: theme.preset.textColor + '44' }}
              />
              {showDescription && description && (
                <p
                  className="mt-4 text-base leading-relaxed"
                  style={{ color: theme.preset.textColor + '99' }}
                >
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorialCover;
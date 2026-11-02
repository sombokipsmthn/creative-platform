'use client';

import React from 'react';
import { GalleryMedia } from '../media';
import { getGalleryFontStack, type GalleryThemeDefinition } from '@/lib/gallery/themes';

export interface CoverRendererProps {
  theme: GalleryThemeDefinition;
  coverPhoto?: {
    id: string;
    filename: string;
    displayUrl: string;
    thumbnailUrl: string;
    mimeType?: string | null;
    width?: number;
    height?: number;
  } | null;
  title?: string;
  description?: string;
  focalX?: number;
  focalY?: number;
  overlayOpacity?: number;
  showTitle?: boolean;
  showDescription?: boolean;
  showBranding?: boolean;
  studioName?: string;
  logoUrl?: string;
  logoSize?: string;
  brandColor?: string;
  className?: string;
}

/**
 * Full Image — full-bleed photograph with text overlay.
 */
export function FullImageCover({
  theme,
  coverPhoto,
  title,
  description,
  focalX = 50,
  focalY = 50,
  overlayOpacity = 25,
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
    logoSize === 'small' ? 'h-6 w-6' :
    logoSize === 'large' ? 'h-12 w-12' : 'h-9 w-9';

  return (
    <div className={className} style={bgStyle}>
      <div className="relative min-h-[70vh] overflow-hidden">
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
            style={{ backgroundColor: theme.preset.backgroundColor }}
          />
        )}
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, rgba(0,0,0,${overlayOpacity / 100}) 0%, rgba(0,0,0,${overlayOpacity / 200}) 50%, transparent 100%)`,
          }}
        />
        {/* Title + description */}
        <div className="absolute inset-0 flex flex-col items-center justify-end px-6 py-16 text-center">
          {showTitle && title && (
            <h1
              className="text-4xl font-light tracking-tight sm:text-5xl lg:text-6xl"
              style={{ color: theme.preset.textColor }}
            >
              {title}
            </h1>
          )}
          {showDescription && description && (
            <p
              className="mt-4 max-w-xl text-base leading-relaxed sm:text-lg"
              style={{ color: theme.preset.textColor + 'cc' }}
            >
              {description}
            </p>
          )}
        </div>
        {/* Branding */}
        {showBranding && (studioName || logoUrl) && (
          <div className="absolute top-6 left-6 flex items-center gap-3">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={studioName || 'Studio logo'}
                className={`${logoSizeClass} rounded-md object-contain`}
              />
            )}
            {studioName && (
              <span
                className="text-sm font-medium tracking-wide"
                style={{ color: theme.preset.textColor }}
              >
                {studioName}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FullImageCover;
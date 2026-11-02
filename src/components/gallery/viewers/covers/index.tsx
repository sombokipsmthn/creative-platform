'use client';

import React from 'react';
import { FullImageCover } from './full-image';
import { FramedCover } from './framed';
import { SplitCover } from './split';
import { OffsetCover } from './offset';
import { CenteredCover } from './centered';
import { MinimalCover } from './minimal';
import { LabelCover } from './label';
import { EditorialCover } from './editorial';
import type { GalleryThemeDefinition } from '@/lib/gallery/themes';

export type CoverComposition =
  | 'full_image'
  | 'framed'
  | 'split'
  | 'offset'
  | 'centered'
  | 'minimal'
  | 'label'
  | 'editorial';

export interface CoverPhoto {
  id: string;
  filename: string;
  displayUrl: string;
  thumbnailUrl: string;
  mimeType?: string | null;
  width?: number;
  height?: number;
}

export interface CoverRendererProps {
  theme: GalleryThemeDefinition;
  composition?: CoverComposition;
  coverPhoto?: CoverPhoto | null;
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
  logoLightUrl?: string;
  logoDarkUrl?: string;
  logoTransparentUrl?: string;
  logoSize?: string;
  brandColor?: string;
  className?: string;
}

const compositionMap: Record<CoverComposition, React.ComponentType<CoverRendererProps>> = {
  full_image: FullImageCover,
  framed: FramedCover,
  split: SplitCover,
  offset: OffsetCover,
  centered: CenteredCover,
  minimal: MinimalCover,
  label: LabelCover,
  editorial: EditorialCover,
};

const compositionLabels: Record<CoverComposition, string> = {
  full_image: 'Full Image',
  framed: 'Framed',
  split: 'Split',
  offset: 'Offset',
  centered: 'Centered',
  minimal: 'Minimal',
  label: 'Label',
  editorial: 'Editorial',
};

/**
 * GalleryCoverRenderer — shared cover renderer.
 *
 * Driven by a `composition` configuration value. Changing the cover
 * composition does not affect the image grid, and changing the grid
 * does not affect the cover.
 */
export function GalleryCoverRenderer({
  composition = 'full_image',
  ...props
}: CoverRendererProps) {
  const CoverComponent = compositionMap[composition] ?? FullImageCover;
  return <CoverComponent {...props} />;
}

export function getCoverCompositionLabel(composition: CoverComposition): string {
  return compositionLabels[composition] ?? composition;
}

export function isValidCoverComposition(
  value: string | null | undefined,
): value is CoverComposition {
  return Boolean(value && Object.prototype.hasOwnProperty.call(compositionMap, value));
}

export const COVER_COMPOSITIONS: CoverComposition[] = [
  'full_image',
  'framed',
  'split',
  'offset',
  'centered',
  'minimal',
  'label',
  'editorial',
];

export default GalleryCoverRenderer;
export type GalleryThemeId = 
  | 'minimal' 
  | 'editorial' 
  | 'cinematic' 
  | 'mosaic' 
  | 'story';

export type GalleryThemeCategory = 'modern' | 'editorial' | 'cinematic' | 'playful' | 'narrative';

export interface GalleryThemePreset {
  layout: 'single' | 'magazine' | 'fullscreen' | 'masonry' | 'vertical';
  aspectRatio: 'auto' | '1:1' | '16:9' | '4:3' | '3:2';
  masonryColumns?: number;
  showTitle: boolean;
  showDescription: boolean;
  showCollections: boolean;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
}

export interface GalleryThemeDefinition {
  id: GalleryThemeId;
  label: string;
  description: string;
  category: GalleryThemeCategory;
  icon: string; // CSS icon name or emoji
  preset: GalleryThemePreset;
  customizable: {
    colors: boolean;
    layout: boolean;
    typography: boolean;
  };
}

/**
 * Theme registry with all 5 gallery themes.
 * 
 * Each theme represents a distinct visual and experiential approach:
 * - Minimal: Clean, spacious, focus on image quality
 * - Editorial: Magazine-style layout with stories
 * - Cinematic: Fullscreen hero images with minimal UI
 * - Mosaic: Dynamic grid with varied aspect ratios
 * - Story: Sequential storytelling with annotations
 */
export const GALLERY_THEMES: GalleryThemeDefinition[] = [
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean, spacious layout with focus on image quality and breathing room.',
    category: 'modern',
    icon: '⊟',
    preset: {
      layout: 'single',
      aspectRatio: 'auto',
      showTitle: true,
      showDescription: true,
      showCollections: true,
      accentColor: '#000000',
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      borderRadius: 0,
    },
    customizable: {
      colors: true,
      layout: false,
      typography: true,
    },
  },

  {
    id: 'editorial',
    label: 'Editorial',
    description: 'Magazine-style layout with featured images and editorial typography.',
    category: 'editorial',
    icon: '⊞',
    preset: {
      layout: 'magazine',
      aspectRatio: 'auto',
      showTitle: true,
      showDescription: true,
      showCollections: true,
      accentColor: '#000000',
      backgroundColor: '#FAFAFA',
      textColor: '#1A1A1A',
      borderRadius: 0,
    },
    customizable: {
      colors: true,
      layout: true,
      typography: true,
    },
  },

  {
    id: 'cinematic',
    label: 'Cinematic',
    description: 'Fullscreen hero images with minimal UI for dramatic, immersive experience.',
    category: 'cinematic',
    icon: '⊟',
    preset: {
      layout: 'fullscreen',
      aspectRatio: '16:9',
      showTitle: false,
      showDescription: false,
      showCollections: false,
      accentColor: '#FFFFFF',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      borderRadius: 0,
    },
    customizable: {
      colors: true,
      layout: false,
      typography: false,
    },
  },

  {
    id: 'mosaic',
    label: 'Mosaic',
    description: 'Dynamic grid with varied image sizes for playful, energetic portfolios.',
    category: 'playful',
    icon: '⊞',
    preset: {
      layout: 'masonry',
      aspectRatio: 'auto',
      masonryColumns: 4,
      showTitle: true,
      showDescription: true,
      showCollections: true,
      accentColor: '#6D28D9',
      backgroundColor: '#FFFFFF',
      textColor: '#1A1A1A',
      borderRadius: 8,
    },
    customizable: {
      colors: true,
      layout: true,
      typography: true,
    },
  },

  {
    id: 'story',
    label: 'Story',
    description: 'Vertical storytelling layout with captions for narrative-driven content.',
    category: 'narrative',
    icon: '⊞',
    preset: {
      layout: 'vertical',
      aspectRatio: 'auto',
      showTitle: true,
      showDescription: true,
      showCollections: true,
      accentColor: '#6D28D9',
      backgroundColor: '#FFFFFF',
      textColor: '#1A1A1A',
      borderRadius: 4,
    },
    customizable: {
      colors: true,
      layout: false,
      typography: true,
    },
  },
];

/**
 * Get theme by ID, with fallback to first theme if not found.
 */
export function getGalleryTheme(id?: string | null): GalleryThemeDefinition {
  if (!id) {
    return GALLERY_THEMES[0];
  }

  const theme = GALLERY_THEMES.find((t) => t.id === id);
  return theme || GALLERY_THEMES[0];
}

/**
 * Get all theme IDs for type safety.
 */
export function getAllThemeIds(): GalleryThemeId[] {
  return GALLERY_THEMES.map((t) => t.id);
}

/**
 * Check if a theme ID is valid.
 */
export function isValidThemeId(id: string | null | undefined): id is GalleryThemeId {
  return Boolean(id && GALLERY_THEMES.some((t) => t.id === id));
}

export type GalleryThemeId =
  | 'minimal'
  | 'editorial'
  | 'cinematic'
  | 'mosaic'
  | 'story';

export type GalleryThemeCategory =
  | 'modern'
  | 'editorial'
  | 'cinematic'
  | 'playful'
  | 'narrative';

export type GalleryFontFamily = 'sans' | 'serif' | 'modern' | 'editorial';
export type GalleryCoverStyle = 'image' | 'split' | 'centered' | 'minimal' | 'immersive' | 'none';
export type GalleryGridStyle = 'masonry' | 'vertical' | 'horizontal' | 'uniform';
export type GalleryThumbnailSize = 'small' | 'regular' | 'large';
export type GalleryGridSpacing = 'tight' | 'regular' | 'wide';
export type GalleryNavigationStyle = 'icons-only' | 'icons-and-text';

export interface GalleryThemePreset {
  layout: 'single' | 'magazine' | 'fullscreen' | 'masonry' | 'vertical';
  aspectRatio: 'auto' | '1:1' | '16:9' | '4:3' | '3:2';
  masonryColumns: number;
  showTitle: boolean;
  showDescription: boolean;
  showCollections: boolean;
  showLogo: boolean;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  fontFamily: GalleryFontFamily;
  coverStyle: GalleryCoverStyle;
  coverFocalX: number;
  coverFocalY: number;
  coverOverlayOpacity: number;
  gridStyle: GalleryGridStyle;
  thumbnailSize: GalleryThumbnailSize;
  gridSpacing: GalleryGridSpacing;
  navigationStyle: GalleryNavigationStyle;
}

export interface GalleryThemeDefinition {
  id: GalleryThemeId;
  label: string;
  description: string;
  category: GalleryThemeCategory;
  icon: string;
  preset: GalleryThemePreset;
  customizable: {
    colors: boolean;
    cover: boolean;
    grid: boolean;
    typography: boolean;
  };
}

export const GALLERY_THEMES: GalleryThemeDefinition[] = [
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Quiet, spacious presentation that keeps the photography first.',
    category: 'modern',
    icon: 'minimal',
    preset: {
      layout: 'single',
      aspectRatio: 'auto',
      masonryColumns: 3,
      showTitle: true,
      showDescription: true,
      showCollections: true,
      showLogo: true,
      accentColor: '#111111',
      backgroundColor: '#FFFFFF',
      textColor: '#111111',
      borderRadius: 0,
      fontFamily: 'sans',
      coverStyle: 'minimal',
      coverFocalX: 50,
      coverFocalY: 50,
      coverOverlayOpacity: 15,
      gridStyle: 'vertical',
      thumbnailSize: 'large',
      gridSpacing: 'wide',
      navigationStyle: 'icons-and-text',
    },
    customizable: { colors: true, cover: true, grid: true, typography: true },
  },
  {
    id: 'editorial',
    label: 'Editorial',
    description: 'Magazine-inspired typography and image rhythm for story-led work.',
    category: 'editorial',
    icon: 'editorial',
    preset: {
      layout: 'magazine',
      aspectRatio: 'auto',
      masonryColumns: 3,
      showTitle: true,
      showDescription: true,
      showCollections: true,
      showLogo: true,
      accentColor: '#181818',
      backgroundColor: '#F7F5F1',
      textColor: '#181818',
      borderRadius: 0,
      fontFamily: 'serif',
      coverStyle: 'split',
      coverFocalX: 50,
      coverFocalY: 50,
      coverOverlayOpacity: 10,
      gridStyle: 'horizontal',
      thumbnailSize: 'regular',
      gridSpacing: 'regular',
      navigationStyle: 'icons-and-text',
    },
    customizable: { colors: true, cover: true, grid: true, typography: true },
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    description: 'Immersive, full-bleed presentation with restrained interface chrome.',
    category: 'cinematic',
    icon: 'cinematic',
    preset: {
      layout: 'fullscreen',
      aspectRatio: '16:9',
      masonryColumns: 1,
      showTitle: true,
      showDescription: false,
      showCollections: false,
      showLogo: true,
      accentColor: '#FFFFFF',
      backgroundColor: '#080808',
      textColor: '#FFFFFF',
      borderRadius: 0,
      fontFamily: 'modern',
      coverStyle: 'immersive',
      coverFocalX: 50,
      coverFocalY: 50,
      coverOverlayOpacity: 40,
      gridStyle: 'uniform',
      thumbnailSize: 'large',
      gridSpacing: 'tight',
      navigationStyle: 'icons-only',
    },
    customizable: { colors: true, cover: true, grid: false, typography: true },
  },
  {
    id: 'mosaic',
    label: 'Mosaic',
    description: 'Flexible image grid designed for fast browsing across larger galleries.',
    category: 'playful',
    icon: 'mosaic',
    preset: {
      layout: 'masonry',
      aspectRatio: 'auto',
      masonryColumns: 4,
      showTitle: true,
      showDescription: true,
      showCollections: true,
      showLogo: true,
      accentColor: '#6D28D9',
      backgroundColor: '#FFFFFF',
      textColor: '#171717',
      borderRadius: 6,
      fontFamily: 'sans',
      coverStyle: 'image',
      coverFocalX: 50,
      coverFocalY: 50,
      coverOverlayOpacity: 25,
      gridStyle: 'masonry',
      thumbnailSize: 'regular',
      gridSpacing: 'regular',
      navigationStyle: 'icons-and-text',
    },
    customizable: { colors: true, cover: true, grid: true, typography: true },
  },
  {
    id: 'story',
    label: 'Story',
    description: 'Tall, sequential presentation for documentary and narrative galleries.',
    category: 'narrative',
    icon: 'story',
    preset: {
      layout: 'vertical',
      aspectRatio: 'auto',
      masonryColumns: 1,
      showTitle: true,
      showDescription: true,
      showCollections: true,
      showLogo: true,
      accentColor: '#111111',
      backgroundColor: '#FAFAFA',
      textColor: '#171717',
      borderRadius: 4,
      fontFamily: 'editorial',
      coverStyle: 'centered',
      coverFocalX: 50,
      coverFocalY: 50,
      coverOverlayOpacity: 20,
      gridStyle: 'vertical',
      thumbnailSize: 'large',
      gridSpacing: 'wide',
      navigationStyle: 'icons-and-text',
    },
    customizable: { colors: true, cover: true, grid: true, typography: true },
  },
];

export function getGalleryTheme(id?: string | null): GalleryThemeDefinition {
  if (!id) return GALLERY_THEMES[0];
  return GALLERY_THEMES.find((theme) => theme.id === id) || GALLERY_THEMES[0];
}

export function getAllThemeIds(): GalleryThemeId[] {
  return GALLERY_THEMES.map((theme) => theme.id);
}

export function isValidThemeId(id: string | null | undefined): id is GalleryThemeId {
  return Boolean(id && GALLERY_THEMES.some((theme) => theme.id === id));
}

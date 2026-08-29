export type GalleryThemeId = 'reference-pending';

export type GalleryThemeDefinition = {
  id: GalleryThemeId;
  label: string;
  description: string;
};

/**
 * Theme registry intentionally starts without invented visual designs.
 * The supplied visual References will become the source of truth for the
 * actual theme definitions and components. Gallery content remains separate
 * from presentation so themes can be swapped without changing photo data.
 */
export const GALLERY_THEMES: GalleryThemeDefinition[] = [
  {
    id: 'reference-pending',
    label: 'Reference theme',
    description: 'Reserved for the supplied gallery visual references.',
  },
];

export function getGalleryTheme(id?: string | null): GalleryThemeDefinition {
  return (
    GALLERY_THEMES.find((theme) => theme.id === id) ||
    GALLERY_THEMES[0]
  );
}

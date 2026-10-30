'use client'

import { GALLERY_THEMES, type GalleryThemeId } from '@/lib/gallery/themes'

interface GalleryThemeSelectorProps {
  galleryId?: string
  onThemeChange: (themeId: GalleryThemeId | null, customThemeName: string) => void
  currentThemeId: GalleryThemeId | null
  isSaving: boolean
  previewPhotos?: unknown[]
  previewCollections?: unknown[]
}

const swatches: Record<GalleryThemeId, string[]> = {
  minimal: ['#FFFFFF', '#EDEDE9', '#171717'],
  editorial: ['#F7F5F1', '#D8CFC1', '#292521'],
  cinematic: ['#080808', '#242424', '#FFFFFF'],
  mosaic: ['#FFFFFF', '#DCE4E8', '#17212B'],
  story: ['#FAFAFA', '#E9E3D9', '#292722'],
}

export default function GalleryThemeSelector({ onThemeChange, currentThemeId, isSaving }: GalleryThemeSelectorProps) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Choose a starting point</h3>
        <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">Every theme can be customised. Select one to load its design into the live preview.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
        {GALLERY_THEMES.map((theme) => {
          const selected = currentThemeId === theme.id
          const colors = swatches[theme.id]
          return (
            <button key={theme.id} type="button" disabled={isSaving} onClick={() => onThemeChange(theme.id, '')}
              aria-pressed={selected}
              className={`group overflow-hidden rounded-xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${selected ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/15' : 'border-[var(--color-border-subtle)] hover:border-[var(--color-text-muted)]'}`}>
              <div className="relative h-28 overflow-hidden p-3" style={{ background: colors[0] }}>
                <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                  <span className="h-1.5 w-10 rounded-full" style={{ background: colors[2], opacity: .7 }} />
                  <span className="flex gap-1">{colors.map((color) => <i key={color} className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ background: color }} />)}</span>
                </div>
                <div className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-1.5">
                  {Array.from({ length: 6 }).map((_, index) => <span key={index} className={`block rounded-sm ${theme.id === 'editorial' && index === 0 ? 'col-span-2 row-span-2 h-12' : 'h-5'}`} style={{ background: index % 2 ? colors[1] : colors[2], opacity: index % 3 === 0 ? .88 : .48 }} />)}
                </div>
                {selected && <span className="absolute right-3 top-8 rounded-full bg-black px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-white">Selected</span>}
              </div>
              <div className="flex items-start justify-between gap-3 p-3">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[var(--color-text-primary)]">{theme.label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-[var(--color-text-muted)]">{theme.description}</span>
                </span>
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${selected ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white' : 'border-[var(--color-border-subtle)] text-transparent'}`}>✓</span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
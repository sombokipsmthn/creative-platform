'use client'

import { useState, useCallback } from 'react'
import { GALLERY_THEMES, type GalleryThemeId } from '@/lib/gallery/themes'

interface GalleryThemeSelectorProps {
  galleryId: string
  onThemeChange: (themeId: GalleryThemeId | null, customThemeName: string) => void
  currentThemeId: GalleryThemeId | null
  isSaving: boolean
}

export default function GalleryThemeSelector({
  galleryId,
  onThemeChange,
  currentThemeId,
  isSaving,
}: GalleryThemeSelectorProps) {
  const [hoveredTheme, setHoveredTheme] = useState<GalleryThemeId | null>(null)
  const [customThemeName, setCustomThemeName] = useState('')

  const handleThemeSelect = useCallback(
    (themeId: GalleryThemeId | null) => {
      onThemeChange(themeId, customThemeName)
    },
    [customThemeName, onThemeChange]
  )

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
          Select a Gallery Theme
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mb-4">
          Choose from professionally designed themes. Each provides a unique visual presentation for your gallery.
        </p>
      </div>

      {/* Theme grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {GALLERY_THEMES.map(theme => {
          const isCurrent = currentThemeId === theme.id
          const isHovered = hoveredTheme === theme.id

          return (
            <div key={theme.id} className="relative group">
              <button
                onClick={() => handleThemeSelect(theme.id)}
                className={`p-4 rounded-lg border transition-all text-left ${
                  isCurrent
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                    : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border-emphasis)]'
                }`}
                disabled={isSaving}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-[var(--color-text-primary)]">
                    {theme.label}
                  </h4>
                  {isCurrent && (
                    <span className="text-xs font-semibold text-[var(--color-accent)]">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mb-3">
                  {theme.description}
                </p>
                <div className="flex gap-2">
                  <div
                    className="w-6 h-6 rounded border border-[var(--color-border-subtle)]"
                    style={{ backgroundColor: theme.preset.accentColor }}
                  />
                  <div
                    className="w-6 h-6 rounded border border-[var(--color-border-subtle)]"
                    style={{ backgroundColor: theme.preset.backgroundColor }}
                  />
                  <div
                    className="w-6 h-6 rounded border border-[var(--color-border-subtle)]"
                    style={{ backgroundColor: theme.preset.textColor }}
                  />
                </div>
              </button>

              {/* Theme preview on hover */}
              {isHovered && (
                <div className="absolute left-0 top-0 w-full h-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-[var(--color-text-muted)] text-sm">
                    Preview
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Custom theme name input */}
      <div className="border-t border-[var(--color-border-subtle)] pt-4">
        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
          Save as Custom Theme (Optional)
        </label>
        <input
          type="text"
          value={customThemeName}
          onChange={(e) => setCustomThemeName(e.target.value)}
          placeholder="My Custom Theme"
          className={`w-full gallery-input ${
            isSaving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isSaving}
        />
        {customThemeName && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Will be saved as a custom theme when you select a theme above.
          </p>
        )}
      </div>
    </div>
  )
}

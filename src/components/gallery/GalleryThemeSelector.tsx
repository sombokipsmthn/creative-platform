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
    <div className="">
      <div>
        <h3 className="">
          Select a Gallery Theme
        </h3>
        <p className="">
          Choose from professionally designed themes. Each provides a unique visual presentation for your gallery.
        </p>
      </div>

      {/* Theme grid */}
      <div className="">
        {GALLERY_THEMES.map(theme => {
          const isCurrent = currentThemeId === theme.id
          const isHovered = hoveredTheme === theme.id

          return (
            <div key={theme.id} className="">
              <button
                onClick={() => handleThemeSelect(theme.id)}
                className={`p-4 rounded-lg border transition-all text-left ${
                  isCurrent
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                    : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border-emphasis)]'
                }`}
                disabled={isSaving}
              >
                <div className="">
                  <h4 className="">
                    {theme.label}
                  </h4>
                  {isCurrent && (
                    <span className="">
                      ✓
                    </span>
                  )}
                </div>
                <p className="">
                  {theme.description}
                </p>
                <div className="">
                  <div
                    className=""

                  />
                  <div
                    className=""

                  />
                  <div
                    className=""

                  />
                </div>
              </button>

              {/* Theme preview on hover */}
              {isHovered && (
                <div className="">
                  <div className="">
                    Preview
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Custom theme name input */}
      <div className="">
        <label className="block">
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
          <p className="">
            Will be saved as a custom theme when you select a theme above.
          </p>
        )}
      </div>
    </div>
  )
}

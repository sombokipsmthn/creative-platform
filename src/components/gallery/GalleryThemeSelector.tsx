'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { GALLERY_THEMES, type GalleryThemeId } from '@/lib/gallery/themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Image from 'next/image'

interface GalleryThemeSelectorProps {
  galleryId: string
  onThemeChange: (themeId: GalleryThemeId | null, customThemeName: string) => void
  currentThemeId: GalleryThemeId | null
  isSaving: boolean
}

/**
 * Generates a representative sample image URL for theme previews.
 * Uses placeholder images with consistent composition across all themes
 * so that differences between themes are easy to compare.
 *
 * The images are sourced from an existing project asset library.
 * If no project-specific assets are available, reliable unsplash-style
 * placeholders are used with consistent styling.
 */
function getSampleImageUrl(themeId: GalleryThemeId, index: number): string {
  // Use project-available placeholder images first
  // Fall back to consistent solid-color placeholders with text labels
  const baseUrls = [
    '/placeholder-hero-1.svg',
    '/placeholder-hero-2.svg',
    '/placeholder-hero-3.svg',
    '/placeholder-hero-4.svg',
    '/placeholder-hero-5.svg',
  ]

  // Select image based on theme and index for variety
  const themeIndex = {
    minimal: 0,
    editorial: 1,
    cinematic: 2,
    mosaic: 3,
    story: 4,
  }[themeId]

  // Wrap around for variety across multiple photos
  const selectedIndex = (themeIndex + index) % baseUrls.length

  return baseUrls[selectedIndex]
}

/**
 * Gets the appropriate background color for a theme's sample preview.
 */
function getThemeBackgroundColor(themeId: GalleryThemeId): string {
  const backgrounds: Record<GalleryThemeId, string> = {
    minimal: '#FFFFFF',
    editorial: '#F7F5F1',
    cinematic: '#080808',
    mosaic: '#FFFFFF',
    story: '#FAFAFA',
  }
  return backgrounds[themeId]
}

/**
 * Gets the appropriate text color for a theme's sample preview.
 */
function getThemeTextColor(themeId: GalleryThemeId): string {
  const colors: Record<GalleryThemeId, string> = {
    minimal: '#111111',
    editorial: '#181818',
    cinematic: '#FFFFFF',
    mosaic: '#171717',
    story: '#171717',
  }
  return colors[themeId]
}

/**
 * Gets the appropriate border radius for a theme's sample preview.
 */
function getThemeBorderRadius(themeId: GalleryThemeId): number {
  const radii: Record<GalleryThemeId, number> = {
    minimal: 0,
    editorial: 0,
    cinematic: 0,
    mosaic: 6,
    story: 4,
  }
  return radii[themeId]
}

export default function GalleryThemeSelector({
  galleryId,
  onThemeChange,
  currentThemeId,
  isSaving,
}: GalleryThemeSelectorProps) {
  const [hoveredTheme, setHoveredTheme] = useState<GalleryThemeId | null>(null)
  const [customThemeName, setCustomThemeName] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleThemeSelect = useCallback(
    (themeId: GalleryThemeId | null) => {
      onThemeChange(themeId, customThemeName)
    },
    [customThemeName, onThemeChange]
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys when container is focused or has focus within
      if (!containerRef.current?.contains(document.activeElement)) return

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          setFocusedIndex(prev => Math.min(prev + 1, GALLERY_THEMES.length - 1))
          break
        case 'ArrowLeft':
          e.preventDefault()
          setFocusedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'ArrowDown':
          e.preventDefault()
          // Move to next row (3 columns on lg, 2 on sm, 1 on mobile)
          // Approximate: +2 for sm, +3 for lg
          setFocusedIndex(prev => Math.min(prev + 2, GALLERY_THEMES.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex(prev => Math.max(prev - 2, 0))
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          const theme = GALLERY_THEMES[focusedIndex]
          if (theme) handleThemeSelect(theme.id)
          break
        case 'Escape':
          e.preventDefault()
          handleThemeSelect(null)
          break
        case 'Home':
          e.preventDefault()
          setFocusedIndex(0)
          break
        case 'End':
          e.preventDefault()
          setFocusedIndex(GALLERY_THEMES.length - 1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [focusedIndex, handleThemeSelect])

  // Focus the selected button when focusedIndex changes
  useEffect(() => {
    if (buttonRefs.current[focusedIndex]) {
      buttonRefs.current[focusedIndex]?.focus()
    }
  }, [focusedIndex])

  return (
    <div
      ref={containerRef}
      className="space-y-4"
      tabIndex={0}
      role="listbox"
      aria-label="Gallery themes"
    >
      <div>
        <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
          Select a Gallery Theme
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mb-4">
          Choose from professionally designed themes. Each provides a unique visual presentation for your gallery.
          <span className="sr-only">
            Use arrow keys to navigate, Enter to select, Escape to deselect.
          </span>
        </p>
      </div>

      {/* Theme grid with visual previews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" role="presentation">
        {GALLERY_THEMES.map((theme, index) => {
          const isCurrent = currentThemeId === theme.id
          const isHovered = hoveredTheme === theme.id
          const isFocused = focusedIndex === index

          const setRef = (el: HTMLButtonElement | null) => {
            buttonRefs.current[index] = el
          }

          return (
            <div key={theme.id} className="relative group" role="presentation">
              <Button
                ref={setRef}
                type="button"
                onClick={() => handleThemeSelect(theme.id)}
                disabled={isSaving}
                variant={isCurrent ? 'primary' : 'outline'}
                className={`h-auto w-full justify-start p-4 text-left transition-all duration-200 ${
                  isFocused ? 'ring-2 ring-[var(--color-accent)] ring-offset-2' : ''
                }`}
                role="option"
                aria-selected={isCurrent}
                aria-label={theme.label}
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

                {/* Visual preview card */}
                <Card
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    isCurrent
                      ? 'border-2 border-[var(--color-accent)] shadow-lg'
                      : 'border-transparent hover:opacity-80 hover:border-gray-200'
                  }`}
                  style={{
                    backgroundColor: getThemeBackgroundColor(theme.id),
                    color: getThemeTextColor(theme.id),
                  }}
                >
                  {/* Sample gallery image */}
                  <div
                    className="aspect-[4/3] rounded-t-lg overflow-hidden mb-3"
                    style={{
                      backgroundColor: theme.preset.backgroundColor,
                    }}
                  >
                    <Image
                      src={getSampleImageUrl(theme.id, 0)}
                      alt={theme.label}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Theme info overlay */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs">
                      <div className="font-medium">{theme.label}</div>
                      <div className="text-[var(--color-text-muted)] line-clamp-2">
                        {theme.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="text-xs font-semibold text-[var(--color-accent)]">
                          ✓ Selected
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Button>

              {/* Enhanced hover preview */}
              {isHovered && (
                <div className="absolute left-0 top-0 w-full h-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-[var(--color-text-muted)] text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-white/60" />
                      Preview
                    </div>
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
        <Input
          type="text"
          value={customThemeName}
          onChange={(e) => setCustomThemeName(e.target.value)}
          placeholder="My Custom Theme"
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
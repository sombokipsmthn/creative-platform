'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { GALLERY_THEMES, type GalleryThemeId } from '@/lib/gallery/themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Image from 'next/image'

interface GalleryPhoto {
  id: string
  filename: string
  displayUrl: string
  thumbnailUrl: string
  mimeType?: string | null
  width?: number
  height?: number
  captureDate?: string
  sortOrder: number
  isHidden: boolean
  isFavorite: boolean
  isSelected: boolean
  downloadCount: number
}

interface GalleryCollection {
  id: string
  title: string
  description?: string
  photos: GalleryPhoto[]
}

interface GalleryThemeSelectorProps {
  galleryId: string
  onThemeChange: (themeId: GalleryThemeId | null, customThemeName: string) => void
  currentThemeId: GalleryThemeId | null
  isSaving: boolean
  previewPhotos?: GalleryPhoto[]
  previewCollections?: GalleryCollection[]
}

/**
 * Gets the local thumbnail asset for a theme.
 */
function getThemeThumbnail(themeId: GalleryThemeId): string {
  const thumbnails: Record<GalleryThemeId, string> = {
    minimal: '/theme-thumb-minimal.svg',
    editorial: '/theme-thumb-editorial.svg',
    cinematic: '/theme-thumb-cinematic.svg',
    mosaic: '/theme-thumb-mosaic.svg',
    story: '/theme-thumb-story.svg',
  }
  return thumbnails[themeId]
}

export default function GalleryThemeSelector({
  galleryId,
  onThemeChange,
  currentThemeId,
  isSaving,
}: GalleryThemeSelectorProps) {
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
          setFocusedIndex(prev => Math.min(prev + 1, GALLERY_THEMES.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex(prev => Math.max(prev - 1, 0))
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

      {/* Theme list - single column, compact cards with thumbnails */}
      <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1" role="presentation">
        {GALLERY_THEMES.map((theme, index) => {
          const isCurrent = currentThemeId === theme.id
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
                className={`w-full justify-start px-2.5 py-2 text-left transition-all duration-200 gap-2.5 ${
                  isFocused ? 'ring-2 ring-[var(--color-accent)] ring-offset-2' : ''
                }`}
                role="option"
                aria-selected={isCurrent}
                aria-label={theme.label}
              >
                {/* Thumbnail */}
                <div className="relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-[var(--color-bg-soft)] border border-[var(--color-border-subtle)]">
                  <Image
                    src={getThemeThumbnail(theme.id)}
                    alt={`${theme.label} theme preview`}
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="64px"
                  />
                  {isCurrent && (
                    <div className="absolute inset-0 bg-[var(--color-accent)]/20 flex items-center justify-center">
                      <span className="text-xs font-semibold text-[var(--color-accent)] bg-[var(--color-accent-foreground)] px-1.5 py-0.5 rounded">
                        ✓
                      </span>
                    </div>
                  )}
                </div>

                {/* Theme info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-xs text-[var(--color-text-primary)] truncate">
                      {theme.label}
                    </h4>
                    {isCurrent && (
                      <span className="text-xs font-semibold text-[var(--color-accent)] ml-2 whitespace-nowrap">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                    {theme.description}
                  </p>
                </div>
              </Button>
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
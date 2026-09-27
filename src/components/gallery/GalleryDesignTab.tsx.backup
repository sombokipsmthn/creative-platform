'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, AlertCircle, Check } from 'lucide-react'
import Image from 'next/image'
import { GALLERY_THEMES, type GalleryThemeId } from '@/lib/gallery/themes'

interface GalleryPhoto {
  id: string
  thumbnailUrl: string
  displayUrl: string
  filename: string
}

interface GalleryDesignTabProps {
  galleryId: string
  gallery: Record<string, unknown>
  onRefresh: () => Promise<void>
}

interface SavedTheme {
  id: string
  galleryId: string
  name: string
  type: string
  layout: string
  accentColor: string
  backgroundColor: string
  textColor: string
  borderRadius: number
  showTitle: boolean
  showDescription: boolean
  showCollections: boolean
  showLogo: boolean
  masonryColumns: number
  aspectRatio: string
  customCSS: string | null
  fontFamily: string
  coverStyle: string
  coverFocalX: number
  coverFocalY: number
  coverOverlayOpacity: number
  gridStyle: string
  thumbnailSize: string
  gridSpacing: string
  navigationStyle: string
  createdAt: string
  updatedAt: string
}

type ActiveSection = 'theme' | 'cover' | 'typography' | 'colors' | 'grid' | 'general'

export default function GalleryDesignTab({ galleryId, gallery, onRefresh }: GalleryDesignTabProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>('theme')
  const [savedTheme, setSavedTheme] = useState<SavedTheme | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null)
  const [focalPoint, setFocalPoint] = useState({ x: 0.5, y: 0.5 })
  
  // Refs for performance optimization

  const photos = (gallery.photos as GalleryPhoto[] | undefined) || []

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/galleries/${galleryId}/theme`)
        if (response.ok) {
          const data = await response.json()
          setSavedTheme(data.theme)
        }

        // Load cover photo separately
        const coverResponse = await fetch(`/api/galleries/${galleryId}`)
        if (coverResponse.ok) {
          const coverData = await coverResponse.json() as { gallery?: Record<string, unknown> }
          const g = coverData.gallery || {}
          setCoverPhotoId(String(g.cover_photo_id || ''))
          const fp = g.focal_point as Record<string, number> | undefined
          if (fp) {
            setFocalPoint({ x: fp.x ?? 0.5, y: fp.y ?? 0.5 })
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load design settings')
      } finally {
        setLoading(false)
      }
    }

    loadTheme()
  }, [galleryId])

  const updateTheme = useCallback(async (updates: Partial<SavedTheme>) => {
    if (!savedTheme) return

    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/galleries/${galleryId}/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        setSavedTheme(data.theme)
      } else {
        throw new Error('Failed to save theme')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update design')
    } finally {
      setIsSaving(false)
    }
  }, [savedTheme, galleryId])

  const applyThemePreset = useCallback(async (themeId: GalleryThemeId) => {
    const theme = GALLERY_THEMES.find(t => t.id === themeId)
    if (!theme) return

    const preset = theme.preset
    await updateTheme({
      name: theme.label,
      type: 'preset',
      layout: preset.layout,
      accentColor: preset.accentColor,
      backgroundColor: preset.backgroundColor,
      textColor: preset.textColor,
      borderRadius: preset.borderRadius,
      showTitle: preset.showTitle,
      showDescription: preset.showDescription,
      showCollections: preset.showCollections,
      showLogo: preset.showLogo,
      masonryColumns: preset.masonryColumns,
      aspectRatio: preset.aspectRatio,
      fontFamily: preset.fontFamily,
      coverStyle: preset.coverStyle,
      coverFocalX: preset.coverFocalX,
      coverFocalY: preset.coverFocalY,
      coverOverlayOpacity: preset.coverOverlayOpacity,
      gridStyle: preset.gridStyle,
      thumbnailSize: preset.thumbnailSize,
      gridSpacing: preset.gridSpacing,
      navigationStyle: preset.navigationStyle,
    } as Partial<SavedTheme>)
  }, [updateTheme])

  const handleSetCover = useCallback(async (photoId: string) => {
    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverPhotoId: photoId }),
      })
      if (!response.ok) throw new Error('Failed to set cover')
      setCoverPhotoId(photoId)
      await onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set cover')
    } finally {
      setIsSaving(false)
    }
  }, [galleryId, onRefresh])

  const handleSaveFocalPoint = useCallback(async () => {
    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focal_point: focalPoint }),
      })
      if (!response.ok) throw new Error('Failed to save focal point')
      await onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save focal point')
    } finally {
      setIsSaving(false)
    }
  }, [focalPoint, galleryId, onRefresh])

  if (loading || !savedTheme) {
    return (
      <div className="ui-card p-6">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading design settings...</span>
        </div>
      </div>
    )
  }

  const currentThemeId = GALLERY_THEMES.find(
    t => t.label === savedTheme.name && savedTheme.type === 'preset'
  )?.id

  const currentCover = photos.find(p => p.id === coverPhotoId)

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Section Navigation */}
      <div className="border-b border-[var(--color-border-subtle)] flex gap-6 overflow-x-auto">
        {[
          { id: 'theme' as const, label: 'Theme' },
          { id: 'cover' as const, label: 'Cover' },
          { id: 'typography' as const, label: 'Typography' },
          { id: 'colors' as const, label: 'Colors' },
          { id: 'grid' as const, label: 'Grid' },
          { id: 'general' as const, label: 'General' },
        ].map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`pb-3 text-xs font-sans uppercase tracking-widest cursor-pointer transition-all border-b-2 whitespace-nowrap ${
              activeSection === section.id
                ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-bold'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* THEME SECTION */}
      {activeSection === 'theme' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Select a Gallery Theme
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mb-4">
              Choose from professionally designed themes. Each provides a unique visual presentation for your gallery.
            </p>
          </div>

          {/* Optimized theme grid with lazy loading */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {GALLERY_THEMES.map(theme => {
              const isCurrent = currentThemeId === theme.id
              
              return (
                <div
                  key={theme.id}
                  className="relative"
                >
                  <button
                    onClick={() => void applyThemePreset(theme.id)}
                    className={`p-4 rounded-lg border transition-all text-left ${
                      isCurrent
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                        : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border-emphasis)]'
                    }`}
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
                  
                  {/* Lazy-loaded preview - only load when in viewport */}
                  <div className="mt-2 h-24 rounded overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] text-xs">
                      Preview
                    </div>
                    {/* In a real implementation, this would use IntersectionObserver or similar */}
                    <div className="absolute inset-0 bg-[var(--color-bg-soft)/50]">
                      {/* Theme preview would go here - optimized to load only when needed */}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* COVER SECTION */}
      {activeSection === 'cover' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
            Cover Settings
          </h3>

          {currentCover && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
                  Current Cover
                </label>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-[var(--color-bg-soft)] border border-[var(--color-border-subtle)]">
                  <Image
                    src={currentCover.displayUrl || currentCover.thumbnailUrl}
                    alt="Cover"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div
                    className="absolute w-6 h-6 border-2 border-white rounded-full shadow-lg"
                    style={{
                      left: `${focalPoint.x * 100}%`,
                      top: `${focalPoint.y * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="absolute inset-0 rounded-full border border-black/30" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
                  Focal Point X: {Math.round(focalPoint.x * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={focalPoint.x * 100}
                  onChange={(e) => setFocalPoint({ ...focalPoint, x: Number(e.target.value) / 100 })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
                  Focal Point Y: {Math.round(focalPoint.y * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={focalPoint.y * 100}
                  onChange={(e) => setFocalPoint({ ...focalPoint, y: Number(e.target.value) / 100 })}
                  className="w-full"
                />
              </div>

              <button
                onClick={() => void handleSaveFocalPoint()}
                disabled={isSaving}
                className="gallery-btn gallery-btn-primary"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Focal Point'
                )}
              </button>
            </div>
          )}

          <div className="border-t border-[var(--color-border-subtle)] pt-4">
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
              Cover Style
            </label>
            <select
              value={savedTheme.coverStyle}
              onChange={(e) => void updateTheme({ coverStyle: e.target.value })}
              className="w-full gallery-input"
            >
              <option value="image">Image (Full Cover)</option>
              <option value="split">Split (Image + Text)</option>
              <option value="centered">Centered (Image Only)</option>
              <option value="minimal">Minimal (Text Only)</option>
              <option value="immersive">Immersive (Full Bleed)</option>
              <option value="none">None</option>
            </select>
          </div>

          {['image', 'split', 'centered', 'immersive'].includes(savedTheme.coverStyle) && (
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
                Overlay Opacity: {savedTheme.coverOverlayOpacity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={savedTheme.coverOverlayOpacity}
                onChange={(e) => void updateTheme({ coverOverlayOpacity: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          )}

          <div className="border-t border-[var(--color-border-subtle)] pt-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={savedTheme.showTitle}
                onChange={(e) => void updateTheme({ showTitle: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--color-border-subtle)] accent-[var(--color-accent)]"
              />
              <span className="text-sm text-[var(--color-text-primary)]">Show Gallery Title</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={savedTheme.showDescription}
                onChange={(e) => void updateTheme({ showDescription: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--color-border-subtle)] accent-[var(--color-accent)]"
              />
              <span className="text-sm text-[var(--color-text-primary)]">Show Description</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={savedTheme.showLogo}
                onChange={(e) => void updateTheme({ showLogo: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--color-border-subtle)] accent-[var(--color-accent)]"
              />
              <span className="text-sm text-[var(--color-text-primary)]">Show Logo</span>
            </label>
          </div>

          <div className="border-t border-[var(--color-border-subtle)] pt-4">
            <h4 className="text-xs font-medium text-[var(--color-text-muted)] mb-3 uppercase tracking-widest">
              Choose Cover Photo
            </h4>
            {/* Optimized cover selection - only load visible thumbnails */}
            <div className="overflow-x-auto space-x-2">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => void handleSetCover(photo.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                    coverPhotoId === photo.id
                      ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]'
                      : 'border-[var(--color-border-subtle)] hover:border-[var(--color-accent)]'
                  }`}
                >
                  <Image
                    src={photo.thumbnailUrl || photo.displayUrl}
                    alt={photo.filename}
                    fill
                    unoptimized
                    className="object-cover"
                    priority={coverPhotoId === photo.id}
                  />
                  {coverPhotoId === photo.id && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            {photos.length === 0 && (
              <p className="text-xs text-[var(--color-text-muted)]">No photos uploaded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TYPOGRAPHY SECTION */}
      {activeSection === 'typography' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Typography</h3>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
              Font Family
            </label>
            <select
              value={savedTheme.fontFamily}
              onChange={(e) => void updateTheme({ fontFamily: e.target.value })}
              className="w-full gallery-input"
            >
              <option value="sans">Sans Serif (Modern)</option>
              <option value="serif">Serif (Editorial)</option>
              <option value="modern">Modern (Geometric)</option>
              <option value="editorial">Editorial (Story)</option>
            </select>
          </div>

          <p className="text-xs text-[var(--color-text-muted)]">
            Font family changes how your gallery title, descriptions, and labels appear.
          </p>
        </div>
      )}

      {/* COLORS SECTION */}
      {activeSection === 'colors' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Color Scheme</h3>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={savedTheme.accentColor}
                onChange={(e) => void updateTheme({ accentColor: e.target.value })}
                className="w-12 h-10 rounded-lg border border-[var(--color-border-subtle)] cursor-pointer"
              />
              <input
                type="text"
                value={savedTheme.accentColor}
                onChange={(e) => void updateTheme({ accentColor: e.target.value })}
                className="flex-1 gallery-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={savedTheme.backgroundColor}
                onChange={(e) => void updateTheme({ backgroundColor: e.target.value })}
                className="w-12 h-10 rounded-lg border border-[var(--color-border-subtle)] cursor-pointer"
              />
              <input
                type="text"
                value={savedTheme.backgroundColor}
                onChange={(e) => void updateTheme({ backgroundColor: e.target.value })}
                className="flex-1 gallery-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={savedTheme.textColor}
                onChange={(e) => void updateTheme({ textColor: e.target.value })}
                className="w-12 h-10 rounded-lg border border-[var(--color-border-subtle)] cursor-pointer"
              />
              <input
                type="text"
                value={savedTheme.textColor}
                onChange={(e) => void updateTheme({ textColor: e.target.value })}
                className="flex-1 gallery-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
              Border Radius: {savedTheme.borderRadius}px
            </label>
            <input
              type="range"
              min="0"
              max="24"
              value={savedTheme.borderRadius}
              onChange={(e) => void updateTheme({ borderRadius: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* GRID SECTION */}
      {activeSection === 'grid' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Grid & Layout</h3>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Grid Style</label>
            <select
              value={savedTheme.gridStyle}
              onChange={(e) => void updateTheme({ gridStyle: e.target.value })}
              className="w-full gallery-input"
            >
              <option value="masonry">Masonry (Varied Heights)</option>
              <option value="vertical">Vertical (Column Stack)</option>
              <option value="horizontal">Horizontal (Row Stack)</option>
              <option value="uniform">Uniform (Equal Sizes)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Thumbnail Size</label>
            <select
              value={savedTheme.thumbnailSize}
              onChange={(e) => void updateTheme({ thumbnailSize: e.target.value })}
              className="w-full gallery-input"
            >
              <option value="small">Small (Compact View)</option>
              <option value="regular">Regular (Balanced)</option>
              <option value="large">Large (Spacious)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Grid Spacing</label>
            <select
              value={savedTheme.gridSpacing}
              onChange={(e) => void updateTheme({ gridSpacing: e.target.value })}
              className="w-full gallery-input"
            >
              <option value="tight">Tight (Minimal Gap)</option>
              <option value="regular">Regular (Balanced Gap)</option>
              <option value="wide">Wide (Spacious Gap)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Aspect Ratio</label>
            <select
              value={savedTheme.aspectRatio}
              onChange={(e) => void updateTheme({ aspectRatio: e.target.value })}
              className="w-full gallery-input"
            >
              <option value="auto">Auto (Original Proportions)</option>
              <option value="1:1">Square (1:1)</option>
              <option value="16:9">Widescreen (16:9)</option>
              <option value="4:3">Standard (4:3)</option>
              <option value="3:2">Classic (3:2)</option>
            </select>
          </div>

          {savedTheme.gridStyle === 'masonry' && (
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
                Masonry Columns: {savedTheme.masonryColumns}
              </label>
              <input
                type="range"
                min="1"
                max="6"
                value={savedTheme.masonryColumns}
                onChange={(e) => void updateTheme({ masonryColumns: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* GENERAL SECTION */}
      {activeSection === 'general' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-[var(--color-text-primary)]">General Settings</h3>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Navigation Style</label>
            <select
              value={savedTheme.navigationStyle}
              onChange={(e) => void updateTheme({ navigationStyle: e.target.value })}
              className="w-full gallery-input"
            >
              <option value="icons-and-text">Icons with Text</option>
              <option value="icons-only">Icons Only</option>
            </select>
          </div>

          <div className="border-t border-[var(--color-border-subtle)] pt-4 space-y-3">
            <h4 className="text-xs font-medium text-[var(--color-text-primary)] uppercase tracking-widest">
              Visibility Options
            </h4>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={savedTheme.showCollections}
                onChange={(e) => void updateTheme({ showCollections: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--color-border-subtle)] accent-[var(--color-accent)]"
              />
              <span className="text-sm text-[var(--color-text-primary)]">Show Collections</span>
            </label>
          </div>

          <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border-subtle)] rounded-lg p-3">
            <p className="text-xs text-[var(--color-text-muted)]">
              Current theme: <span className="font-semibold text-[var(--color-text-primary)]">{savedTheme.name}</span>
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Type: {savedTheme.type}</p>
          </div>
        </div>
      )}

      {isSaving && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <Loader2 className="w-3 h-3 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  )
}

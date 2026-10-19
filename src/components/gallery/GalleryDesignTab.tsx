'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, AlertCircle, Check } from 'lucide-react'
import Image from 'next/image'
import { GALLERY_THEMES, type GalleryThemeId } from '@/lib/gallery/themes'
import GalleryThemeSelector from '@/components/gallery/GalleryThemeSelector'

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
  const [customThemeName, setCustomThemeName] = useState('')

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

  const applyThemePreset = useCallback(async (themeId: GalleryThemeId | null, customName: string) => {
    if (!themeId) return
    const theme = GALLERY_THEMES.find(t => t.id === themeId)
    if (!theme) return

    const preset = theme.preset
    const themeName = customName.trim() ? customName : theme.label
    await updateTheme({
      name: themeName,
      type: customName.trim() ? 'custom' : 'preset',
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
      <div className="ui-card">
        <div className="">
          <Loader2 className="" />
          <span>Loading design settings...</span>
        </div>
      </div>
    )
  }

  const currentThemeId = GALLERY_THEMES.find(
    t => t.label === savedTheme.name && savedTheme.type === 'preset'
  )?.id ?? null

  const currentCover = photos.find(p => p.id === coverPhotoId)

  return (
    <div className="">
      {/* Error Alert */}
      {error && (
        <div className="">
          <AlertCircle className="" />
          <p className="">{error}</p>
        </div>
      )}

      {/* Section Navigation */}
      <div className="">
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
            className={`pb-3 text-xs font-sans uppercase tracking-widest cursor-pointer transition-all  whitespace-nowrap ${
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
        <div className="">
          <GalleryThemeSelector
            galleryId={galleryId}
            onThemeChange={applyThemePreset}
            currentThemeId={currentThemeId}
            isSaving={isSaving}
          />
          <div className="">
            <label className="block">
              Custom Theme Name (Optional)
            </label>
            <input
              type="text"
              value={customThemeName}
              onChange={(e) => setCustomThemeName(e.target.value)}
              placeholder="My Custom Theme"
              className={`w-full gallery-input ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSaving}
            />
            {customThemeName && (
              <p className="">
                Will be saved as a custom theme when you select a theme above.
              </p>
            )}
          </div>
        </div>
      )}

      {/* COVER SECTION */}
      {activeSection === 'cover' && (
        <div className="">
          <h3 className="">
            Cover Settings
          </h3>

          {currentCover && (
            <div className="">
              <div>
                <label className="block">
                  Current Cover
                </label>
                <div className="">
                  <Image
                    src={currentCover.displayUrl || currentCover.thumbnailUrl}
                    alt="Cover"
                    fill
                    unoptimized
                    className=""
                  />
                  <div
                    className=""
                    style={{
                      left: `${focalPoint.x * 100}%`,
                      top: `${focalPoint.y * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="lack/30" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block">
                  Focal Point X: {Math.round(focalPoint.x * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={focalPoint.x * 100}
                  onChange={(e) => setFocalPoint({ ...focalPoint, x: Number(e.target.value) / 100 })}
                  className=""
                />
              </div>

              <div>
                <label className="block">
                  Focal Point Y: {Math.round(focalPoint.y * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={focalPoint.y * 100}
                  onChange={(e) => setFocalPoint({ ...focalPoint, y: Number(e.target.value) / 100 })}
                  className=""
                />
              </div>

              <button
                onClick={() => void handleSaveFocalPoint()}
                disabled={isSaving}
                className="gallery-btn gallery-btn-primary"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="" />
                    Saving...
                  </>
                ) : (
                  'Save Focal Point'
                )}
              </button>
            </div>
          )}

          <div className="">
            <label className="block">
              Cover Style
            </label>
            <select
              value={savedTheme.coverStyle}
              onChange={(e) => void updateTheme({ coverStyle: e.target.value })}
              className="gallery-input"
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
              <label className="block">
                Overlay Opacity: {savedTheme.coverOverlayOpacity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={savedTheme.coverOverlayOpacity}
                onChange={(e) => void updateTheme({ coverOverlayOpacity: parseInt(e.target.value) })}
                className=""
              />
            </div>
          )}

          <div className="">
            <label className="">
              <input
                type="checkbox"
                checked={savedTheme.showTitle}
                onChange={(e) => void updateTheme({ showTitle: e.target.checked })}
                className=""
              />
              <span className="">Show Gallery Title</span>
            </label>

            <label className="">
              <input
                type="checkbox"
                checked={savedTheme.showDescription}
                onChange={(e) => void updateTheme({ showDescription: e.target.checked })}
                className=""
              />
              <span className="">Show Description</span>
            </label>

            <label className="">
              <input
                type="checkbox"
                checked={savedTheme.showLogo}
                onChange={(e) => void updateTheme({ showLogo: e.target.checked })}
                className=""
              />
              <span className="">Show Logo</span>
            </label>
          </div>

          <div className="">
            <h4 className="">
              Choose Cover Photo
            </h4>
            {/* Optimized cover selection - only load visible thumbnails */}
            <div className="">
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
                    className=""
                    priority={coverPhotoId === photo.id}
                  />
                  {coverPhotoId === photo.id && (
                    <div className="">
                      <Check className="" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            {photos.length === 0 && (
              <p className="">No photos uploaded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TYPOGRAPHY SECTION */}
      {activeSection === 'typography' && (
        <div className="">
          <h3 className="">Typography</h3>

          <div>
            <label className="block">
              Font Family
            </label>
            <select
              value={savedTheme.fontFamily}
              onChange={(e) => void updateTheme({ fontFamily: e.target.value })}
              className="gallery-input"
            >
              <option value="sans">Sans Serif (Modern)</option>
              <option value="serif">Serif (Editorial)</option>
              <option value="modern">Modern (Geometric)</option>
              <option value="editorial">Editorial (Story)</option>
            </select>
          </div>

          <p className="">
            Font family changes how your gallery title, descriptions, and labels appear.
          </p>
        </div>
      )}

      {/* COLORS SECTION */}
      {activeSection === 'colors' && (
        <div className="">
          <h3 className="">Color Scheme</h3>

          <div>
            <label className="block">Accent Color</label>
            <div className="">
              <input
                type="color"
                value={savedTheme.accentColor}
                onChange={(e) => void updateTheme({ accentColor: e.target.value })}
                className=""
              />
              <input
                type="text"
                value={savedTheme.accentColor}
                onChange={(e) => void updateTheme({ accentColor: e.target.value })}
                className="gallery-input"
              />
            </div>
          </div>

          <div>
            <label className="block">Background Color</label>
            <div className="">
              <input
                type="color"
                value={savedTheme.backgroundColor}
                onChange={(e) => void updateTheme({ backgroundColor: e.target.value })}
                className=""
              />
              <input
                type="text"
                value={savedTheme.backgroundColor}
                onChange={(e) => void updateTheme({ backgroundColor: e.target.value })}
                className="gallery-input"
              />
            </div>
          </div>

          <div>
            <label className="block">Text Color</label>
            <div className="">
              <input
                type="color"
                value={savedTheme.textColor}
                onChange={(e) => void updateTheme({ textColor: e.target.value })}
                className=""
              />
              <input
                type="text"
                value={savedTheme.textColor}
                onChange={(e) => void updateTheme({ textColor: e.target.value })}
                className="gallery-input"
              />
            </div>
          </div>

          <div>
            <label className="block">
              Border Radius: {savedTheme.borderRadius}px
            </label>
            <input
              type="range"
              min="0"
              max="24"
              value={savedTheme.borderRadius}
              onChange={(e) => void updateTheme({ borderRadius: parseInt(e.target.value) })}
              className=""
            />
          </div>
        </div>
      )}

      {/* GRID SECTION */}
      {activeSection === 'grid' && (
        <div className="">
          <h3 className="">Grid & Layout</h3>

          <div>
            <label className="block">Grid Style</label>
            <select
              value={savedTheme.gridStyle}
              onChange={(e) => void updateTheme({ gridStyle: e.target.value })}
              className="gallery-input"
            >
              <option value="masonry">Masonry (Varied Heights)</option>
              <option value="vertical">Vertical (Column Stack)</option>
              <option value="horizontal">Horizontal (Row Stack)</option>
              <option value="uniform">Uniform (Equal Sizes)</option>
            </select>
          </div>

          <div>
            <label className="block">Thumbnail Size</label>
            <select
              value={savedTheme.thumbnailSize}
              onChange={(e) => void updateTheme({ thumbnailSize: e.target.value })}
              className="gallery-input"
            >
              <option value="small">Small (Compact View)</option>
              <option value="regular">Regular (Balanced)</option>
              <option value="large">Large (Spacious)</option>
            </select>
          </div>

          <div>
            <label className="block">Grid Spacing</label>
            <select
              value={savedTheme.gridSpacing}
              onChange={(e) => void updateTheme({ gridSpacing: e.target.value })}
              className="gallery-input"
            >
              <option value="tight">Tight (Minimal Gap)</option>
              <option value="regular">Regular (Balanced Gap)</option>
              <option value="wide">Wide (Spacious Gap)</option>
            </select>
          </div>

          <div>
            <label className="block">Aspect Ratio</label>
            <select
              value={savedTheme.aspectRatio}
              onChange={(e) => void updateTheme({ aspectRatio: e.target.value })}
              className="gallery-input"
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
              <label className="block">
                Masonry Columns: {savedTheme.masonryColumns}
              </label>
              <input
                type="range"
                min="1"
                max="6"
                value={savedTheme.masonryColumns}
                onChange={(e) => void updateTheme({ masonryColumns: parseInt(e.target.value) })}
                className=""
              />
            </div>
          )}
        </div>
      )}

      {/* GENERAL SECTION */}
      {activeSection === 'general' && (
        <div className="">
          <h3 className="">General Settings</h3>

          <div>
            <label className="block">Navigation Style</label>
            <select
              value={savedTheme.navigationStyle}
              onChange={(e) => void updateTheme({ navigationStyle: e.target.value })}
              className="gallery-input"
            >
              <option value="icons-and-text">Icons with Text</option>
              <option value="icons-only">Icons Only</option>
            </select>
          </div>

          <div className="">
            <h4 className="">
              Visibility Options
            </h4>

            <label className="">
              <input
                type="checkbox"
                checked={savedTheme.showCollections}
                onChange={(e) => void updateTheme({ showCollections: e.target.checked })}
                className=""
              />
              <span className="">Show Collections</span>
            </label>
          </div>

          <div className="">
            <p className="">
              Current theme: <span className="">{savedTheme.name}</span>
            </p>
            <p className="">Type: {savedTheme.type}</p>
          </div>
        </div>
      )}

      {isSaving && (
        <div className="">
          <Loader2 className="" />
          Saving...
        </div>
      )}
    </div>
  )
}

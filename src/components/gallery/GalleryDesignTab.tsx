'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { CircleNotch as Loader2, WarningCircle as AlertCircle, Check, ArrowCounterClockwise as RotateCcw, X } from "@phosphor-icons/react"
import Image from 'next/image'
import { GALLERY_THEMES, type GalleryThemeId, getGalleryTheme } from '@/lib/gallery/themes'
import GalleryThemeSelector from '@/components/gallery/GalleryThemeSelector'
import { GalleryViewer } from '@/components/gallery/viewers/wrapper'
import { SelectCompat } from '@/components/ui/select-compat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';

interface GalleryPhoto {
  id: string
  thumbnailUrl: string
  displayUrl: string
  filename: string
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

/**
 * Sample gallery data for empty galleries - used only in preview mode.
 * Never mixed with actual gallery data.
 */
function getSampleGallery(themeId: GalleryThemeId): {
  photos: GalleryPhoto[]
  title: string
  collections: Array<{ id: string; title: string; photos: GalleryPhoto[] }>
} {
  const samplePhotos: GalleryPhoto[] = [
    {
      id: 'sample-1',
      filename: 'Portrait 1',
      displayUrl: '/sample-portrait-1.svg',
      thumbnailUrl: '/sample-portrait-1-thumb.svg',
      mimeType: 'image/svg+xml',
      width: 1200,
      height: 800,
      captureDate: '2024-01-15T10:00:00Z',
      sortOrder: 0,
      isHidden: false,
      isFavorite: false,
      isSelected: false,
      downloadCount: 0,
    },
    {
      id: 'sample-2',
      filename: 'Landscape 1',
      displayUrl: '/sample-landscape-1.svg',
      thumbnailUrl: '/sample-landscape-1-thumb.svg',
      mimeType: 'image/svg+xml',
      width: 1200,
      height: 800,
      captureDate: '2024-01-16T14:30:00Z',
      sortOrder: 1,
      isHidden: false,
      isFavorite: false,
      isSelected: false,
      downloadCount: 0,
    },
    {
      id: 'sample-3',
      filename: 'Portrait 2',
      displayUrl: '/sample-portrait-2.svg',
      thumbnailUrl: '/sample-portrait-2-thumb.svg',
      mimeType: 'image/svg+xml',
      width: 1200,
      height: 800,
      captureDate: '2024-01-17T09:15:00Z',
      sortOrder: 2,
      isHidden: false,
      isFavorite: false,
      isSelected: false,
      downloadCount: 0,
    },
    {
      id: 'sample-4',
      filename: 'Landscape 2',
      displayUrl: '/sample-landscape-2.svg',
      thumbnailUrl: '/sample-landscape-2-thumb.svg',
      mimeType: 'image/svg+xml',
      width: 1200,
      height: 800,
      captureDate: '2024-01-18T16:45:00Z',
      sortOrder: 3,
      isHidden: false,
      isFavorite: false,
      isSelected: false,
      downloadCount: 0,
    },
    {
      id: 'sample-5',
      filename: 'Detail Shot',
      displayUrl: '/sample-detail-1.svg',
      thumbnailUrl: '/sample-detail-1-thumb.svg',
      mimeType: 'image/svg+xml',
      width: 1200,
      height: 800,
      captureDate: '2024-01-19T11:20:00Z',
      sortOrder: 4,
      isHidden: false,
      isFavorite: false,
      isSelected: false,
      downloadCount: 0,
    },
  ]

  const sampleCollections = [
    { id: 'collection-1', title: 'Featured', photos: [] },
    { id: 'collection-2', title: 'Recent', photos: [] },
  ]

  const themeTitles: Record<GalleryThemeId, string> = {
    minimal: 'My Photography Collection',
    editorial: 'Visual Story',
    cinematic: 'Cinema Portfolio',
    mosaic: 'Image Grid',
    story: 'Narrative Journey',
  }

  return {
    photos: samplePhotos,
    title: themeTitles[themeId],
    collections: sampleCollections,
  }
}

export default function GalleryDesignTab({ galleryId, gallery, onRefresh }: GalleryDesignTabProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>('theme')
  const [savedTheme, setSavedTheme] = useState<SavedTheme | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null)
  const [focalPoint, setFocalPoint] = useState({ x: 0.5, y: 0.5 })
  const [customThemeName, setCustomThemeName] = useState('')
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSheet, setShowMobileSheet] = useState(false)

  // For keyboard navigation in theme selector
  const themeSelectorRef = useRef<HTMLDivElement>(null)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const photos = (gallery.photos as GalleryPhoto[] | undefined) || []
  const galleryTitle = (gallery.title as string) || 'My Gallery'
  const galleryDescription = (gallery.description as string | undefined) || undefined

  // Derive current theme ID from saved theme name/type more robustly
  const currentThemeId = GALLERY_THEMES.find(
    t => t.label === savedTheme?.name && savedTheme?.type === 'preset'
  )?.id ?? null

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

  const resetToThemeDefaults = useCallback(async () => {
    if (!currentThemeId) return
    const theme = GALLERY_THEMES.find(t => t.id === currentThemeId)
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
    setShowResetDialog(false)
  }, [currentThemeId, updateTheme])

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

  // Build preview data: use real gallery photos when available, sample data when empty
  const theme = currentThemeId ? GALLERY_THEMES.find(t => t.id === currentThemeId) : null
  const sampleGallery = theme ? getSampleGallery(theme.id) : null
  const hasRealPhotos = photos.length > 0

  const previewPhotos = hasRealPhotos ? photos : (sampleGallery?.photos || [])
  const previewTitle = hasRealPhotos ? galleryTitle : (sampleGallery?.title || 'My Gallery')
  const previewDescription = hasRealPhotos ? galleryDescription : undefined
  const previewCollections = hasRealPhotos ? [] : (sampleGallery?.collections || [])
  const isPreviewMode = !hasRealPhotos

  if (loading || !savedTheme) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading design settings...</span>
        </div>
      </div>
    )
  }

  const currentCover = photos.find(p => p.id === coverPhotoId)

  // Section navigation for desktop
  const sections = [
    { id: 'theme' as const, label: 'Theme' },
    { id: 'cover' as const, label: 'Cover' },
    { id: 'typography' as const, label: 'Typography' },
    { id: 'colors' as const, label: 'Colors' },
    { id: 'grid' as const, label: 'Grid' },
    { id: 'general' as const, label: 'General' },
  ]

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Section Navigation - Desktop (visible at md and above) */}
      <nav className="hidden md:flex border-b border-[var(--color-border-subtle)] gap-6 overflow-x-auto pb-3" aria-label="Design sections">
        {sections.map(section => (
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
      </nav>

      {/* Mobile Sheet Trigger & Sheet */}
      <Sheet open={showMobileSheet} onOpenChange={setShowMobileSheet}>
        <SheetTrigger asChild>
          <Button variant="outline" className="md:hidden w-full justify-between">
            <span>{sections.find(s => s.id === activeSection)?.label || 'Settings'}</span>
            <X className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] max-h-[80vh]">
          <SheetHeader>
            <SheetTitle>Design Settings</SheetTitle>
            <SheetDescription>Customize your gallery appearance</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 pb-8 overflow-y-auto">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => { setActiveSection(section.id); setShowMobileSheet(false); }}
                className={`w-full text-left py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-[var(--color-accent)] text-[var(--color-accent-foreground)]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Reset to Defaults Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset to Theme Defaults?</DialogTitle>
            <DialogDescription>
              This will discard all your custom changes and restore the original &ldquo;{currentThemeId ? getGalleryTheme(currentThemeId).label : 'theme'}&rdquo; preset settings. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={resetToThemeDefaults} disabled={isSaving}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TWO-COLUMN DESIGN WORKSPACE */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT COLUMN: Theme Selector & Settings (25-30%) */}
        <aside className="lg:w-[30%] flex-shrink-0 space-y-6">
          {/* THEME SECTION */}
          {activeSection === 'theme' && (
            <div className="space-y-4" ref={themeSelectorRef}>
              <GalleryThemeSelector
                galleryId={galleryId}
                onThemeChange={applyThemePreset}
                currentThemeId={currentThemeId}
                isSaving={isSaving}
                previewPhotos={previewPhotos}
                previewCollections={previewCollections}
              />
            </div>
          )}

          {/* COVER SECTION */}
          {activeSection === 'cover' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Cover Settings</h3>
                {currentThemeId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResetDialog(true)}
                    disabled={isSaving}
                    className="text-xs text-red-600 hover:bg-red-50"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset to Defaults
                  </Button>
                )}
              </div>

              {/* Cover photo selector */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
                  Cover Photo
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {previewPhotos.slice(0, 12).map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => handleSetCover(photo.id)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                        photo.id === coverPhotoId
                          ? 'border-[var(--color-accent)]'
                          : 'border-transparent hover:border-[var(--color-accent)]'
                      }`}
                      aria-label={photo.id === coverPhotoId ? `${photo.filename} (current cover)` : `Set ${photo.filename} as cover`}
                      aria-pressed={photo.id === coverPhotoId}
                    >
                      <Image
                        src={photo.thumbnailUrl || photo.displayUrl}
                        alt={photo.filename}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="80px"
                      />
                      {photo.id === coverPhotoId && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {previewPhotos.length === 0 && (
                  <p className="text-xs text-[var(--color-text-muted)] text-center py-4">
                    Upload photos to select a cover image
                  </p>
                )}

                {currentCover && (
                  <div className="border-t border-[var(--color-border-subtle)] pt-4">
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
                )}

                {currentCover && (
                  <div className="border-t border-[var(--color-border-subtle)] pt-4">
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
                )}

                {currentCover && (
                  <Button
                    type="button"
                    onClick={() => void handleSaveFocalPoint()}
                    disabled={isSaving}
                    variant="primary"
                    className="w-full"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Focal Point'
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* TYPOGRAPHY SECTION */}
          {activeSection === 'typography' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Typography</h3>
                {currentThemeId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResetDialog(true)}
                    disabled={isSaving}
                    className="text-xs text-red-600 hover:bg-red-50"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset to Defaults
                  </Button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
                  Font Family
                </label>
                <SelectCompat
                  value={savedTheme.fontFamily}
                  onChange={(e) => void updateTheme({ fontFamily: e.target.value })}
                  className="w-full gallery-input"
                >
                  <option value="sans">Sans Serif (Modern)</option>
                  <option value="serif">Serif (Editorial)</option>
                  <option value="modern">Modern (Geometric)</option>
                  <option value="editorial">Editorial (Story)</option>
                </SelectCompat>
              </div>

              <p className="text-xs text-[var(--color-text-muted)]">
                Font family changes how your gallery title, descriptions, and labels appear.
              </p>
            </div>
          )}

          {/* COLORS SECTION */}
          {activeSection === 'colors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Color Scheme</h3>
                {currentThemeId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResetDialog(true)}
                    disabled={isSaving}
                    className="text-xs text-red-600 hover:bg-red-50"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset to Defaults
                  </Button>
                )}
              </div>

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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Grid & Layout</h3>
                {currentThemeId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResetDialog(true)}
                    disabled={isSaving}
                    className="text-xs text-red-600 hover:bg-red-50"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset to Defaults
                  </Button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Grid Style</label>
                <SelectCompat
                  value={savedTheme.gridStyle}
                  onChange={(e) => void updateTheme({ gridStyle: e.target.value })}
                  className="w-full gallery-input"
                >
                  <option value="masonry">Masonry (Varied Heights)</option>
                  <option value="vertical">Vertical (Column Stack)</option>
                  <option value="horizontal">Horizontal (Row Stack)</option>
                  <option value="uniform">Uniform (Equal Sizes)</option>
                </SelectCompat>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Thumbnail Size</label>
                <SelectCompat
                  value={savedTheme.thumbnailSize}
                  onChange={(e) => void updateTheme({ thumbnailSize: e.target.value })}
                  className="w-full gallery-input"
                >
                  <option value="small">Small (Compact View)</option>
                  <option value="regular">Regular (Balanced)</option>
                  <option value="large">Large (Spacious)</option>
                </SelectCompat>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Grid Spacing</label>
                <SelectCompat
                  value={savedTheme.gridSpacing}
                  onChange={(e) => void updateTheme({ gridSpacing: e.target.value })}
                  className="w-full gallery-input"
                >
                  <option value="tight">Tight (Minimal Gap)</option>
                  <option value="regular">Regular (Balanced Gap)</option>
                  <option value="wide">Wide (Spacious Gap)</option>
                </SelectCompat>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Aspect Ratio</label>
                <SelectCompat
                  value={savedTheme.aspectRatio}
                  onChange={(e) => void updateTheme({ aspectRatio: e.target.value })}
                  className="w-full gallery-input"
                >
                  <option value="auto">Auto (Original Proportions)</option>
                  <option value="1:1">Square (1:1)</option>
                  <option value="16:9">Widescreen (16:9)</option>
                  <option value="4:3">Standard (4:3)</option>
                  <option value="3:2">Classic (3:2)</option>
                </SelectCompat>
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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">General Settings</h3>
                {currentThemeId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResetDialog(true)}
                    disabled={isSaving}
                    className="text-xs text-red-600 hover:bg-red-50"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset to Defaults
                  </Button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Navigation Style</label>
                <SelectCompat
                  value={savedTheme.navigationStyle}
                  onChange={(e) => void updateTheme({ navigationStyle: e.target.value })}
                  className="w-full gallery-input"
                >
                  <option value="icons-and-text">Icons with Text</option>
                  <option value="icons-only">Icons Only</option>
                </SelectCompat>
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
                  Current theme: <span className="font-semibold text-[var(--color-text-primary)]">
                    {savedTheme.name}
                  </span>
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Type: {savedTheme.type}</p>
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT COLUMN: Live Gallery Preview (70-75%) */}
        <main className="flex-1 min-w-0 lg:w-[70%]">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl overflow-hidden">
            {/* Preview Header */}
            <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--color-text-primary)] uppercase tracking-wider">
                  Live Preview
                </span>
                {isPreviewMode && (
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-800 rounded">
                    Demo Content
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {theme && (
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {theme.label} theme
                  </span>
                )}
              </div>
            </div>

            {/* Live Gallery Preview */}
            <div className="relative min-h-[60vh] max-h-[80vh] overflow-auto">
              {theme && (
                <GalleryViewer
                  id={galleryId}
                  title={previewTitle}
                  description={previewDescription}
                  themeId={theme.id}
                  photos={previewPhotos}
                  collections={previewCollections}
                  allowDownloads={false}
                  allowFavorites={false}
                  allowSelections={false}
                  allowComments={false}
                  isClient={true}
                  onPhotoSelect={() => {}}
                  onPhotoFavorite={() => {}}
                  onPhotoComment={() => {}}
                  onPhotoDownload={() => {}}
                />
              )}
              {!theme && (
                <div className="flex items-center justify-center h-[60vh] text-[var(--color-text-muted)]">
                  Select a theme to see preview
                </div>
              )}
            </div>

            {/* Preview Mode Notice */}
            {isPreviewMode && (
              <div className="p-4 border-t border-[var(--color-border-subtle)] bg-amber-50">
                <div className="flex items-center gap-2 text-xs text-amber-800">
                  <span className="w-4 h-4 flex-shrink-0">ℹ</span>
                  <span>
                    This preview uses sample images. Upload your own photos to see them with the selected theme.
                  </span>
                </div>
              </div>
            )}

            {/* Loading/Saving Overlay */}
            {isSaving && (
              <div className="absolute inset-0 bg-white/80 dark:bg-black/60 flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Saving theme...</span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {isSaving && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <Loader2 className="w-3 h-3 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  )
}
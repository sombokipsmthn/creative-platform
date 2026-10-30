'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Heart, Stack as Layers, CircleNotch as Loader2, Palette, Plus, Gear as Settings, Upload, X, Copy, Trash as Trash2, EyeSlash as EyeOff, Video, Check, CaretLeft, CaretRight } from "@phosphor-icons/react"
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { transformGalleryResponse } from '@/lib/gallery/transform'
import { cn } from '@/lib/utils'
import GalleryTopNav from '@/components/ui/GalleryTopNav'
import GalleryDesignTab from '@/components/gallery/GalleryDesignTab'
import GallerySettingsTab from '@/components/gallery/GallerySettingsTab'
import GalleryActivityTab from '@/components/gallery/GalleryActivityTab'
import PhotoUploader from '@/components/admin/PhotoUploader'
import { SelectCompat } from '@/components/ui/select-compat';

interface GalleryCollection {
  id: string
  galleryId: string
  title: string
  description: string | null
  sortOrder: number
  photo_count?: number
  portfolioSelection?: 'inherit' | 'include' | 'exclude'
  createdAt: string
}

interface GalleryPhoto {
  id: string
  galleryId: string
  collectionId: string | null
  filename: string
  originalUrl: string
  displayUrl: string
  thumbnailUrl: string
  mimeType: string
  duration: number | null
  videoCodec: string | null
  audioCodec: string | null
  sortOrder: number
  isHidden: boolean
  portfolioSelection?: 'inherit' | 'include' | 'exclude'
  isFavorite: boolean
  isSelected: boolean
  createdAt: string
  updatedAt: string
}

interface GalleryData {
  id: string
  title: string
  description?: string | null
  category?: string | null
  slug: string
  status: string
  portfolioPublishMode?: 'none' | 'all' | 'selected'
  allowDownloads?: boolean
  allowFavorites?: boolean
  allowSelections?: boolean
  focal_point?: Record<string, unknown>
  photos: GalleryPhoto[]
  collections: GalleryCollection[]
  [key: string]: unknown
}

const tabs = [
  { id: 'photos', label: 'Photos & Videos', icon: <Layers className="h-4 w-4" /> },
  { id: 'design', label: 'Design', icon: <Palette className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  { id: 'activity', label: 'Activity', icon: <Heart className="h-4 w-4" /> },
]

export default function GalleryWorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<string>('photos')
  const [portfolioMode, setPortfolioMode] = useState<'none' | 'all' | 'selected'>('none')
  const [gallery, setGallery] = useState<GalleryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [creatingCollection, setCreatingCollection] = useState(false)
  const [collectionTitle, setCollectionTitle] = useState('')
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [bulkSelectMode, setBulkSelectMode] = useState(false)
  const [photoFilter, setPhotoFilter] = useState<'all' | 'included' | 'not-included' | 'published'>('all')
  const [previewPhotoId, setPreviewPhotoId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'custom' | 'filename_asc' | 'filename_desc' | 'date_taken_new' | 'date_taken_old' | 'date_uploaded_new' | 'date_uploaded_old' | 'random'>('custom')
  const [activeCollection, setActiveCollection] = useState<string | null>(null)
  const [showCollectionPicker, setShowCollectionPicker] = useState(false)
  const [moveDestination, setMoveDestination] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refreshGallery = useCallback(async () => {
    const response = await fetch(`/api/galleries/${id}`, { cache: 'no-store' })
    if (!response.ok) throw new Error('Failed to refresh gallery')
    const rawData = await response.json() as Record<string, unknown>
    const transformed = transformGalleryResponse(rawData)
    setGallery({
      ...(transformed.gallery || {}),
      photos: Array.isArray(transformed.photos) ? transformed.photos : [],
      collections: Array.isArray(transformed.collections) ? transformed.collections : [],
      approval: transformed.approval || null,
      presets: Array.isArray(transformed.presets) ? transformed.presets : [],
      watermark: transformed.watermark || null,
    } as unknown as GalleryData)
    setPortfolioMode((transformed.gallery?.portfolioPublishMode as 'none' | 'all' | 'selected') || 'none')
  }, [id])

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/galleries/${id}`)
        if (!response.ok) throw new Error('Failed to load gallery')
        const rawData = await response.json() as Record<string, unknown>
        const transformed = transformGalleryResponse(rawData)
        setGallery({
          ...(transformed.gallery || {}),
          photos: Array.isArray(transformed.photos) ? transformed.photos : [],
          collections: Array.isArray(transformed.collections) ? transformed.collections : [],
          approval: transformed.approval || null,
          presets: Array.isArray(transformed.presets) ? transformed.presets : [],
          watermark: transformed.watermark || null,
        } as unknown as GalleryData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load gallery')
      } finally {
        setLoading(false)
      }
    }

    fetchGallery()
  }, [id])

  const handlePhotoToggle = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const next = new Set(prev)
      if (next.has(photoId)) {
        next.delete(photoId)
      } else {
        next.add(photoId)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedPhotos.size === (gallery?.photos?.length || 0)) {
      setSelectedPhotos(new Set())
    } else {
      const photoIds = new Set((gallery?.photos || []).map(p => p.id))
      setSelectedPhotos(photoIds)
    }
  }

  const handleMoveToCollection = async (collectionId: string | null) => {
    if (selectedPhotos.size === 0) return
    setError(null)
    try {
      for (const photoId of selectedPhotos) {
        await fetch(`/api/galleries/${id}/photos`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoId, collectionId }),
        })
      }
      setSelectedPhotos(new Set())
      setShowCollectionPicker(false)
      setMoveDestination(null)
      await refreshGallery()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to move photos')
    }
  }
  const handleCreateCollection = async () => {
    const title = collectionTitle.trim()

    if (!title || creatingCollection) return

    setCreatingCollection(true)
    setError(null)

    try {
      const response = await fetch(`/api/galleries/${id}/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(body?.error || 'Unable to create collection')
      }

      setCollectionTitle('')
      await refreshGallery()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create collection'
      )
    } finally {
      setCreatingCollection(false)
    }
  }
  const isPortfolioIncluded = (photo: GalleryPhoto) => {
    if (photo.portfolioSelection === 'exclude') return false
    if (photo.portfolioSelection === 'include') return true
    const collection = gallery?.collections?.find((item) => item.id === photo.collectionId)
    if (collection?.portfolioSelection === 'exclude') return false
    if (collection?.portfolioSelection === 'include') return true
    return gallery?.portfolioPublishMode === 'all'
  }

  const updatePortfolioSelection = async (photoIds: string[], selection: 'include' | 'exclude') => {
    if (!photoIds.length) return
    setError(null)
    try {
      const responses = await Promise.all(photoIds.map((photoId) => fetch(`/api/galleries/${id}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, portfolioSelection: selection }),
      })))
      if (responses.some((response) => !response.ok)) throw new Error('Unable to update portfolio selection')
      await refreshGallery()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update portfolio selection')
    }
  }

  const handlePortfolioToggle = async (photo: GalleryPhoto) => {
    await updatePortfolioSelection([photo.id], isPortfolioIncluded(photo) ? 'exclude' : 'include')
  }

  const previewPhoto = filteredPhotos.find((photo) => photo.id === previewPhotoId) || gallery?.photos.find((photo) => photo.id === previewPhotoId) || null
  const previewIndex = previewPhoto ? filteredPhotos.findIndex((photo) => photo.id === previewPhoto.id) : -1
  const goToPreview = (direction: -1 | 1) => {
    if (!filteredPhotos.length || previewIndex < 0) return
    const nextIndex = (previewIndex + direction + filteredPhotos.length) % filteredPhotos.length
    setPreviewPhotoId(filteredPhotos[nextIndex].id)
  }

  const handleToggleHidden = async (photoId: string, isHidden: boolean) => {
    setError(null)
    try {
      await fetch(`/api/galleries/${id}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, isHidden: !isHidden }),
      })
      await refreshGallery()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update photo')
    }
  }

  const handleDeletePhotos = async () => {
    if (selectedPhotos.size === 0) return
    if (!confirm(`Delete ${selectedPhotos.size} photo(s)?`)) return
    
    setError(null)
    try {
      await fetch(`/api/galleries/${id}/photos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoIds: Array.from(selectedPhotos) }),
      })
      setSelectedPhotos(new Set())
      await refreshGallery()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete photos')
    }
  }

  const handlePublish = async () => {
    setPublishing(true)
    setError(null)
    try {
      const response = await fetch(`/api/galleries/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish: gallery?.status !== 'published' }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(body?.error || 'Unable to update gallery status')
      }
      await refreshGallery()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update gallery status')
    } finally {
      setPublishing(false)
    }
  }

  // Helper to determine media type
  const getMediaType = (photo: GalleryPhoto): 'image' | 'video' => {
    if (photo.mimeType?.startsWith('video/')) return 'video'
    if (photo.duration !== null) return 'video'
    return 'image'
  }

  // Format duration in seconds to readable format
  const formatDuration = (duration: number | null): string => {
    if (!duration) return ''
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
    return `${seconds}s`
  }

  const collectionPhotos = activeCollection
    ? gallery?.photos?.filter(p => p.collectionId === activeCollection) || []
    : gallery?.photos || []

  const filteredPhotos = collectionPhotos.filter((photo) => {
    if (photoFilter === 'included') return isPortfolioIncluded(photo)
    if (photoFilter === 'not-included') return !isPortfolioIncluded(photo)
    if (photoFilter === 'published') return gallery?.status === 'published' && isPortfolioIncluded(photo) && !photo.isHidden
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="p-4 md:p-6 lg:p-8">
          <div role="status" aria-label="Loading gallery" className="space-y-6">
            <span className="sr-only">Loading gallery…</span>
            <div className="ui-card p-6">
              <div className="h-3 w-20 animate-pulse rounded-full bg-muted" />
              <div className="mt-4 h-7 w-64 max-w-full animate-pulse rounded-lg bg-muted" />
              <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded-lg bg-muted" />
            </div>
            <div className="flex gap-2 border-b pb-3">{[0, 1, 2, 3].map((item) => <div key={item} className="h-10 w-24 animate-pulse rounded-lg bg-muted" />)}</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => <div key={item} className="aspect-square animate-pulse rounded-xl bg-muted" />)}</div>
          </div>
        </main>
      </div>
    )
  }

  if (error && !gallery) {
    return (
      <div className="min-h-screen">
        <main className="p-4 md:p-6 lg:p-8">
          <div className="ui-card p-6">
            <div className="ui-alert ui-alert-error">
              <p>{error}</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!gallery) {
    return (
      <div className="min-h-screen">
        <main className="p-4 md:p-6 lg:p-8">
          <div className="ui-card p-6">
            <p className="ui-eyebrow">Gallery Tools</p>
            <h1 className="ui-page-title">No gallery data available</h1>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <main className="p-4 md:p-6 lg:p-8">
        <div className="os-shell">
          {/* HEADER */}
          <header className="mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="ui-eyebrow">Gallery Tools</p>
                <h1 className="ui-page-title truncate">{gallery.title}</h1>
                <p className="ui-body text-[var(--color-text-muted)]">
                  {gallery.category || 'Client gallery'}{gallery.slug ? ` · /${gallery.slug}` : ''}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {gallery.slug && (
                  <a
                    href={`/Portal/g/${gallery.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="gallery-btn gallery-btn-secondary"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Preview
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={false}
                  className="gallery-btn gallery-btn-primary"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photos
                </button>
                <button
                  type="button"
                  onClick={() => void handlePublish()}
                  disabled={publishing}
                  className="gallery-btn gallery-btn-secondary"
                >
                  {publishing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {gallery.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <span className="ui-meta">
                  {gallery.status} · {gallery.photos?.length || 0} items
                </span>
              </div>
            </div>
          </header>

          {/* TABS */}
          <GalleryTopNav
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* ERROR ALERT */}
          {error && (
            <div className="mt-6 ui-alert ui-alert-error flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB CONTENT */}
          <div className="mt-6">
            {/* PHOTOS TAB */}
            {activeTab === 'photos' && (
              <section className="os-reveal space-y-6">
                <PhotoUploader 
                  galleryId={id} 
                  onUploadComplete={() => {
                    refreshGallery()
                  }}
                />

                {/* SELECTION TOOLBAR */}
                {selectedPhotos.size > 0 && (
                  <div className="sticky top-0 z-10 ui-card border border-[var(--color-border-subtle)] rounded-lg p-4 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium">
                      {selectedPhotos.size} item{selectedPhotos.size !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <button
                        onClick={() => void updatePortfolioSelection(Array.from(selectedPhotos), 'include')}
                        className="gallery-btn gallery-btn-secondary gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Add to portfolio
                      </button>
                      <button
                        onClick={() => void updatePortfolioSelection(Array.from(selectedPhotos), 'exclude')}
                        className="gallery-btn gallery-btn-secondary gap-2"
                      >
                        <EyeOff className="w-4 h-4" />
                        Remove from portfolio
                      </button>
                      <button
                        onClick={() => {
                          setShowCollectionPicker(true)
                          setMoveDestination(null)
                        }}
                        className="gallery-btn gallery-btn-secondary gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Move
                      </button>
                      <button
                        onClick={() => void handleDeletePhotos()}
                        className="gallery-btn gallery-btn-secondary gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                      <button
                        onClick={() => setSelectedPhotos(new Set())}
                        className="gallery-btn gallery-btn-secondary"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {/* MOVE DIALOG */}
                {showCollectionPicker && selectedPhotos.size > 0 && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-overlay)]">
                    <div className="ui-modal bg-[var(--color-bg-card)] rounded-2xl p-6 w-full max-w-md">
                      <div className="mb-4">
                        <p className="font-medium">
                          Move {selectedPhotos.size} selected item{selectedPhotos.size !== 1 ? 's' : ''} to:
                        </p>
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="move-destination"
                            value="null"
                            checked={moveDestination === null}
                            onChange={() => setMoveDestination(null)}
                            className="w-4 h-4 accent-[var(--color-accent)] border-[var(--color-border-subtle)]"
                          />
                          <span>All Photos (no collection)</span>
                        </label>
                        {gallery.collections?.map((coll) => (
                          <label key={coll.id} className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="move-destination"
                              value={coll.id}
                              checked={moveDestination === coll.id}
                              onChange={() => setMoveDestination(coll.id)}
                              className="w-4 h-4 accent-[var(--color-accent)] border-[var(--color-border-subtle)]"
                            />
                            <span className="flex-1">
                              {coll.title}
                            </span>
                            <span className="ui-meta">
                              {coll.photo_count || 0} items
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end space-x-3">
                        <button
                          onClick={() => {
                            setShowCollectionPicker(false)
                            setMoveDestination(null)
                          }}
                          className="px-4 py-2 ui-button ui-button-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            handleMoveToCollection(moveDestination)
                            setShowCollectionPicker(false)
                            setMoveDestination(null)
                          }}
                          className="px-4 py-2 ui-button ui-button-primary"
                        >
                          Move items
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* PHOTOS GRID */}
                <div className="ui-card p-6 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Photos & Videos</h2>
                      <p className="text-xs text-[var(--color-text-muted)]">Select the images you want to feature on your public portfolio.</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <SelectCompat
                        value={photoFilter}
                        onChange={(e) => setPhotoFilter(e.target.value as typeof photoFilter)}
                        className="gallery-input text-sm py-2"
                      >
                        <option value="all">All media</option>
                        <option value="included">In portfolio</option>
                        <option value="not-included">Not selected</option>
                        <option value="published">Published</option>
                      </SelectCompat>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkSelectMode((current) => !current)
                          setSelectedPhotos(new Set())
                        }}
                        className="gallery-btn gallery-btn-secondary"
                      >
                        {bulkSelectMode ? 'Done selecting' : 'Select items'}
                      </button>
                      <SelectCompat
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="gallery-input text-sm py-2"
                      >
                        <option value="custom">Custom Order</option>
                        <option value="filename_asc">Filename A–Z</option>
                        <option value="filename_desc">Filename Z–A</option>
                        <option value="date_uploaded_new">Uploaded (newest)</option>
                        <option value="date_uploaded_old">Uploaded (oldest)</option>
                      </SelectCompat>
                      {bulkSelectMode && <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-soft)] cursor-pointer transition text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={selectedPhotos.size === (gallery?.photos?.length || 0) && (gallery?.photos?.length || 0) > 0}
                          ref={(el) => {
                            if (el) {
                              el.indeterminate = selectedPhotos.size > 0 && selectedPhotos.size < (gallery?.photos?.length || 0)
                            }
                          }}
                          onChange={() => handleSelectAll()}
                          className="w-4 h-4 rounded border-[var(--color-border-subtle)] accent-[var(--color-accent)] cursor-pointer"
                        />
                        <span>Select All</span>
                      </label>}
                    </div>
                  </div>

                  {filteredPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {filteredPhotos.map((photo) => {
                        const mediaType = getMediaType(photo)
                        
                        const isSelected = selectedPhotos.has(photo.id)
                        const isInPortfolio = isPortfolioIncluded(photo)

                        return (
                          <div
                            key={photo.id}
                            className={cn(
                              'group relative aspect-square overflow-hidden rounded-lg border transition-colors',
                              isSelected
                                ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg)]'
                                : 'border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] hover:border-[var(--color-accent)]'
                            )}
                          >
                            {/* One-tap portfolio curation; bulk selection is an explicit secondary mode. */}
                            <button
                              type="button"
                              onClick={() => bulkSelectMode ? handlePhotoToggle(photo.id) : void handlePortfolioToggle(photo)}
                              aria-label={bulkSelectMode
                                ? `${isSelected ? 'Deselect' : 'Select'} ${photo.filename} for bulk actions`
                                : `${isInPortfolio ? 'Remove' : 'Add'} ${photo.filename} ${isInPortfolio ? 'from' : 'to'} portfolio`}
                              aria-pressed={bulkSelectMode ? isSelected : isInPortfolio}
                              title={bulkSelectMode ? 'Select for bulk actions' : isInPortfolio ? 'Selected for portfolio' : 'Add to portfolio'}
                              className={cn(
                                'absolute left-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                                bulkSelectMode
                                  ? isSelected ? 'bg-[var(--color-accent)] text-white' : 'bg-black/65 text-white'
                                  : isInPortfolio ? 'bg-[var(--color-accent)] text-white' : 'bg-black/55 text-white hover:bg-black/80'
                              )}
                            >
                              {(bulkSelectMode ? isSelected : isInPortfolio) && <Check className="h-4 w-4" weight="bold" />}
                            </button>

                            {/* HIDDEN INDICATOR */}
                            {photo.isHidden && (
                              <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center">
                                <EyeOff className="w-3 h-3 text-white" />
                              </div>
                            )}

                            {/* MEDIA DISPLAY */}
                            <button
                              type="button"
                              onClick={() => setPreviewPhotoId(photo.id)}
                              aria-label={`Preview ${photo.filename}`}
                              className="absolute inset-0 z-[1] cursor-zoom-in"
                            />
                            {mediaType === 'video' ? (
                              <div className="relative w-full h-full">
                                <video
                                  src={photo.displayUrl || photo.originalUrl}
                                  className="h-full w-full object-contain"
                                  poster={photo.thumbnailUrl || undefined}
                                  controls
                                  preload="metadata"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    setPreviewPhotoId(photo.id)
                                  }}
                                  onDoubleClick={(event) => event.stopPropagation()}
                                />
                                {/* Video Icon Overlay */}
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                                  <Video className="w-8 h-8 text-white" />
                                </div>
                                {/* Duration Badge */}
                                {photo.duration && (
                                  <div className="pointer-events-none absolute bottom-2 right-2 rounded bg-[var(--color-bg-overlay)] px-2 py-1 text-[10px] text-white">
                                    {formatDuration(photo.duration)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Image
                                src={photo.thumbnailUrl || photo.displayUrl || photo.originalUrl || '/og-image.svg'}
                                alt={photo.filename}
                                fill
                                unoptimized
                                className={`object-cover transition duration-300 ${selectedPhotos.has(photo.id) ? 'brightness-75' : 'group-hover:brightness-90'}`}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = '/og-image.svg'
                                }}
                                onClick={() => setPreviewPhotoId(photo.id)}
                              />
                            )}

                            {/* FILENAME OVERLAY - show on mobile, hover on desktop */}
                            <div className={cn(
                              'pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 pb-2.5 pt-8 transition-opacity',
                              'md:opacity-0 md:group-hover:opacity-100'
                            )}>
                              <p className="truncate text-[10px] font-medium text-white">
                                {photo.filename.split('.').slice(0, -1).join('.')}
                              </p>
                            </div>

                            {/* Visibility is managed in the preview, not on every thumbnail. */}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-sm text-[var(--color-text-muted)]">
                        No photos in this gallery yet. Use the upload area above to add photos.
                      </p>
                    </div>
                  )}
                </div>

                {previewPhoto && (
                  <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-6"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Preview ${previewPhoto.filename}`}
                    onClick={() => setPreviewPhotoId(null)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') setPreviewPhotoId(null)
                      if (event.key === 'ArrowLeft') goToPreview(-1)
                      if (event.key === 'ArrowRight') goToPreview(1)
                    }}
                    tabIndex={-1}
                  >
                    <div className="relative flex h-full max-h-[92vh] w-full max-w-7xl flex-col" onClick={(event) => event.stopPropagation()}>
                      <div className="flex shrink-0 items-center justify-between gap-3 pb-3 text-white">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{previewPhoto.filename}</p>
                          <p className="text-xs text-white/60">{Math.max(0, previewIndex) + 1} of {filteredPhotos.length} · {isPortfolioIncluded(previewPhoto) ? 'Selected for portfolio' : 'Not selected'}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handlePortfolioToggle(previewPhoto)}
                            className={cn('rounded-full px-3 py-2 text-xs font-semibold transition', isPortfolioIncluded(previewPhoto) ? 'bg-[var(--color-accent)] text-white' : 'bg-white/15 text-white hover:bg-white/25')}
                          >
                            <span className="inline-flex items-center gap-1.5">{isPortfolioIncluded(previewPhoto) && <Check className="h-3.5 w-3.5" />}{isPortfolioIncluded(previewPhoto) ? 'In portfolio' : 'Add to portfolio'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleToggleHidden(previewPhoto.id, previewPhoto.isHidden)}
                            className="rounded-full bg-white/15 px-3 py-2 text-xs text-white hover:bg-white/25"
                          >
                            {previewPhoto.isHidden ? 'Show in gallery' : 'Hide from gallery'}
                          </button>
                          <button type="button" onClick={() => setPreviewPhotoId(null)} aria-label="Close preview" className="rounded-full bg-white/15 p-2 text-white hover:bg-white/25">
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-black/40">
                        {getMediaType(previewPhoto) === 'video' ? (
                          <video
                            key={previewPhoto.id}
                            src={previewPhoto.displayUrl || previewPhoto.originalUrl}
                            poster={previewPhoto.thumbnailUrl || undefined}
                            controls
                            autoPlay
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Image
                            src={previewPhoto.displayUrl || previewPhoto.originalUrl || previewPhoto.thumbnailUrl || '/og-image.svg'}
                            alt={previewPhoto.filename}
                            fill
                            unoptimized
                            priority
                            sizes="100vw"
                            className="object-contain"
                          />
                        )}
                      </div>
                      <div className="flex shrink-0 items-center justify-between pt-3 text-white">
                        <button type="button" onClick={() => goToPreview(-1)} disabled={filteredPhotos.length < 2} className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm hover:bg-white/25 disabled:opacity-40">
                          <CaretLeft className="h-4 w-4" /> Previous
                        </button>
                        <span className="text-xs text-white/60">Use ← → to navigate · Esc to close</span>
                        <button type="button" onClick={() => goToPreview(1)} disabled={filteredPhotos.length < 2} className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm hover:bg-white/25 disabled:opacity-40">
                          Next <CaretRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* COLLECTIONS */}
                <div className="ui-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Collections</h2>
                    <button
                      type="button"
                      onClick={() => document.getElementById('new-collection-input')?.focus()}
                      className="gallery-btn gallery-btn-secondary gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      New
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      id="new-collection-input"
                      value={collectionTitle}
                      onChange={(event) => setCollectionTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') void handleCreateCollection()
                      }}
                      placeholder="e.g. Ceremony, Portraits"
                      className="gallery-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => void handleCreateCollection()}
                      disabled={creatingCollection || !collectionTitle.trim()}
                      className="gallery-btn gallery-btn-secondary shrink-0"
                    >
                      {creatingCollection ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>

                  {gallery.collections && gallery.collections.length > 0 ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveCollection(null)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          activeCollection === null
                            ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]'
                            : 'border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-soft)]'
                        }`}
                      >
                        <span className="font-medium">All Photos & Videos</span>
                        <span className="text-xs ml-2 opacity-70">
                          {gallery.photos?.length || 0} items
                        </span>
                      </button>
                      {gallery.collections.map((collection) => (
                        <button
                          key={collection.id}
                          onClick={() => setActiveCollection(collection.id)}
                          className={`w-full text-left p-3 rounded-lg border transition ${
                            activeCollection === collection.id
                              ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]'
                              : 'border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-soft)]'
                          }`}
                        >
                          <span className="font-medium">{collection.title}</span>
                          <span className="text-xs ml-2 opacity-70">
                            {collection.photo_count || 0} items
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="ui-body">No collections yet. Create one to organize your photos and videos.</p>
                  )}
                </div>
              </section>
            )}

            {/* DESIGN TAB */}
            {activeTab === 'design' && (
              <GalleryDesignTab galleryId={id} gallery={gallery} onRefresh={refreshGallery} />
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <GallerySettingsTab galleryId={id} gallery={gallery} onRefresh={refreshGallery} />
            )}

            {/* ACTIVITY TAB */}
            {activeTab === 'activity' && (
              <GalleryActivityTab galleryId={id} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

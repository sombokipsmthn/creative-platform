'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Heart, Layers, Loader2, Palette, Plus, Settings, Upload, X, Copy, Trash2, Eye, EyeOff } from 'lucide-react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { upload } from '@vercel/blob/client'
import { transformGalleryResponse } from '@/lib/gallery/transform'
import GalleryTopNav from '@/components/ui/GalleryTopNav'
import GalleryDesignTab from '@/components/gallery/GalleryDesignTab'
import GallerySettingsTab from '@/components/gallery/GallerySettingsTab'
import GalleryActivityTab from '@/components/gallery/GalleryActivityTab'

interface GalleryCollection {
  id: string
  galleryId: string
  title: string
  description: string | null
  sortOrder: number
  photo_count?: number
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
  sortOrder: number
  isHidden: boolean
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
  allowDownloads?: boolean
  allowFavorites?: boolean
  allowSelections?: boolean
  focal_point?: Record<string, unknown>
  photos: GalleryPhoto[]
  collections: GalleryCollection[]
  [key: string]: unknown
}

const tabs = [
  { id: 'photos', label: 'Photos', icon: <Layers className="h-4 w-4" /> },
  { id: 'design', label: 'Design', icon: <Palette className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  { id: 'activity', label: 'Activity', icon: <Heart className="h-4 w-4" /> },
]

export default function GalleryWorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<string>('photos')
  const [gallery, setGallery] = useState<GalleryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [creatingCollection, setCreatingCollection] = useState(false)
  const [collectionTitle, setCollectionTitle] = useState('')
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
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

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setError(null)
    try {
      for (const file of Array.from(files)) {
        await upload(`galleries/${id}/${file.name}`, file, {
          access: 'public',
          handleUploadUrl: '/api/galleries/upload',
          clientPayload: JSON.stringify({ galleryId: id }),
        })
      }
      await refreshGallery()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload photos')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleCreateCollection = async () => {
    const title = collectionTitle.trim()
    if (!title) return
    setCreatingCollection(true)
    setError(null)
    try {
      const response = await fetch(`/api/galleries/${id}/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(body?.error || 'Unable to create collection')
      }

      setCollectionTitle('')
      await refreshGallery()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create collection')
    } finally {
      setCreatingCollection(false)
    }
  }

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

  const filteredPhotos = activeCollection
    ? gallery?.photos?.filter(p => p.collectionId === activeCollection) || []
    : gallery?.photos || []

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="p-4 md:p-6 lg:p-8">
          <div className="ui-card p-6">
            <div className="h-3 w-20 animate-pulse rounded-full bg-[var(--color-bg-soft)]" />
            <div className="mt-4 h-7 w-64 animate-pulse rounded-lg bg-[var(--color-bg-soft)]" />
            <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded-lg bg-[var(--color-bg-soft)]" />
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
                    href={`/portal/g/${gallery.id}/${gallery.slug}`}
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
                  disabled={uploading}
                  className="gallery-btn gallery-btn-primary"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Uploading...' : 'Upload'}
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
                <span className="text-xs text-[var(--color-text-muted)]">
                  {gallery.status} · {gallery.photos?.length || 0} photos
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
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  multiple
                  className="hidden"
                  onChange={(event) => void handleUpload(event.target.files)}
                />

                {/* SELECTION TOOLBAR */}
                {selectedPhotos.size > 0 && (
                  <div className="sticky top-0 z-10 bg-[var(--color-bg)] border border-[var(--color-border-subtle)] rounded-lg p-4 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium">
                      {selectedPhotos.size} photo{selectedPhotos.size !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-2">
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
                        className="gallery-btn gallery-btn-secondary gap-2 text-red-600 hover:text-red-700"
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
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 w-full max-w-md">
                      <div className="mb-4">
                        <p className="font-medium">
                          Move {selectedPhotos.size} selected photo{selectedPhotos.size !== 1 ? 's' : ''} to:
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
                            className="w-4 h-4 text-[var(--color-accent)] border-[var(--color-border-subtle)]"
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
                              className="w-4 h-4 text-[var(--color-accent)] border-[var(--color-border-subtle)]"
                            />
                            <span className="flex-1">
                              {coll.title}
                            </span>
                            <span className="text-xs text-[var(--color-text-muted)]">
                              {coll.photo_count || 0} photos
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
                          className="px-4 py-2 bg-white dark:bg-zinc-700 border border-[var(--color-border-subtle)] rounded-md hover:bg-[var(--color-bg-soft)] dark:hover:bg-zinc-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            handleMoveToCollection(moveDestination)
                            setShowCollectionPicker(false)
                            setMoveDestination(null)
                          }}
                          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-md hover:bg-[var(--color-accent)/80]"
                        >
                          Move photos
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* PHOTOS GRID */}
                <div className="ui-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Photos</h2>
                    <div className="flex items-center gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="gallery-input text-sm py-2"
                      >
                        <option value="custom">Custom Order</option>
                        <option value="filename_asc">Filename A–Z</option>
                        <option value="filename_desc">Filename Z–A</option>
                        <option value="date_uploaded_new">Uploaded (newest)</option>
                        <option value="date_uploaded_old">Uploaded (oldest)</option>
                      </select>
                      <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-soft)] cursor-pointer transition text-sm font-medium">
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
                      </label>
                    </div>
                  </div>

                  {filteredPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {filteredPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] cursor-pointer"
                          onClick={() => handlePhotoToggle(photo.id)}
                        >
                          {/* CHECKBOX */}
                          <div className="absolute top-2 left-2 z-10 w-5 h-5 rounded border-2 border-white bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            {selectedPhotos.has(photo.id) && (
                              <div className="w-3 h-3 rounded-sm bg-white" />
                            )}
                          </div>

                          {/* HIDDEN INDICATOR */}
                          {photo.isHidden && (
                            <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center">
                              <EyeOff className="w-3 h-3 text-white" />
                            </div>
                          )}

                          {/* IMAGE */}
                          <Image
                            src={photo.thumbnailUrl || photo.displayUrl || photo.originalUrl || '/placeholder.jpg'}
                            alt={photo.filename}
                            fill
                            unoptimized
                            className={`object-cover transition duration-300 ${selectedPhotos.has(photo.id) ? 'brightness-75' : 'group-hover:brightness-90'}`}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/placeholder.jpg'
                            }}
                          />

                          {/* FILENAME OVERLAY */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 pb-2.5 pt-8 opacity-0 group-hover:opacity-100 transition">
                            <p className="truncate text-[10px] font-medium text-white">
                              {photo.filename.split('.').slice(0, -1).join('.')}
                            </p>
                          </div>

                          {/* HOVER ACTIONS */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                void handleToggleHidden(photo.id, photo.isHidden)
                              }}
                              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition"
                              title={photo.isHidden ? 'Show' : 'Hide'}
                            >
                              {photo.isHidden ? (
                                <EyeOff className="w-4 h-4 text-black" />
                              ) : (
                                <Eye className="w-4 h-4 text-black" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="gallery-dropzone"
                    >
                      <div className="gallery-dropzone-icon">
                        <Upload className="w-5 h-5" />
                      </div>
                      <h3 className="gallery-dropzone-title">Drop in your first photos</h3>
                      <p className="gallery-dropzone-text">
                        Choose multiple images at once. We will prepare web-ready versions and keep the originals safe.
                      </p>
                      <span className="inline-flex items-center justify-center gap-2 gallery-btn gallery-btn-secondary mt-5">
                        CHOOSE PHOTOS
                      </span>
                    </button>
                  )}
                </div>

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
                            ? 'bg-[var(--color-accent-light)] border-[var(--color-accent)] text-[var(--color-accent)]'
                            : 'border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-soft)]'
                        }`}
                      >
                        <span className="font-medium">All Photos</span>
                        <span className="text-xs ml-2 opacity-70">
                          {gallery.photos?.length || 0} photos
                        </span>
                      </button>
                      {gallery.collections.map((collection) => (
                        <button
                          key={collection.id}
                          onClick={() => setActiveCollection(collection.id)}
                          className={`w-full text-left p-3 rounded-lg border transition ${
                            activeCollection === collection.id
                              ? 'bg-[var(--color-accent-light)] border-[var(--color-accent)] text-[var(--color-accent)]'
                              : 'border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-soft)]'
                          }`}
                        >
                          <span className="font-medium">{collection.title}</span>
                          <span className="text-xs ml-2 opacity-70">
                            {collection.photo_count || 0} photos
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--color-text-muted)]">No collections yet. Create one to organize your photos.</p>
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

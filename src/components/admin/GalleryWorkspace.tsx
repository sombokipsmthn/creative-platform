'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Heart, Layers, Loader2, Palette, Plus, Settings, Upload, X, Copy, Trash2, Eye, EyeOff, Video } from 'lucide-react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { transformGalleryResponse } from '@/lib/gallery/transform'
import GalleryTopNav from '@/components/ui/GalleryTopNav'
import GalleryDesignTab from '@/components/gallery/GalleryDesignTab'
import GallerySettingsTab from '@/components/gallery/GallerySettingsTab'
import GalleryActivityTab from '@/components/gallery/GalleryActivityTab'
import PhotoUploader from '@/components/admin/PhotoUploader'

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
  mimeType: string
  duration: number | null
  videoCodec: string | null
  audioCodec: string | null
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
  { id: 'photos', label: 'Photos & Videos', icon: <Layers className="" /> },
  { id: 'design', label: 'Design', icon: <Palette className="" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="" /> },
  { id: 'activity', label: 'Activity', icon: <Heart className="" /> },
]

export default function GalleryWorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<string>('photos')
  const [gallery, setGallery] = useState<GalleryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  const filteredPhotos = activeCollection
    ? gallery?.photos?.filter(p => p.collectionId === activeCollection) || []
    : gallery?.photos || []

  if (loading) {
    return (
      <div className="">
        <main className="">
          <div className="ui-card">
            <div className="" />
            <div className="" />
            <div className="" />
          </div>
        </main>
      </div>
    )
  }

  if (error && !gallery) {
    return (
      <div className="">
        <main className="">
          <div className="ui-card">
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
      <div className="">
        <main className="">
          <div className="ui-card">
            <p className="ui-eyebrow">Gallery Tools</p>
            <h1 className="ui-page-title">No gallery data available</h1>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="">
      <main className="">
        <div className="os-shell">
          {/* HEADER */}
          <header className="">
            <div className="">
              <div>
                <p className="ui-eyebrow">Gallery Tools</p>
                <h1 className="ui-page-title">{gallery.title}</h1>
                <p className="ui-body">
                  {gallery.category || 'Client gallery'}{gallery.slug ? ` · /${gallery.slug}` : ''}
                </p>
              </div>

              <div className="">
                {gallery.slug && (
                  <a
                    href={`/portal/g/${gallery.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="gallery-btn gallery-btn-secondary"
                  >
                    <Upload className="" />
                    Preview
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={false}
                  className="gallery-btn gallery-btn-primary"
                >
                  <Upload className="" />
                  Upload Photos
                </button>
                <button
                  type="button"
                  onClick={() => void handlePublish()}
                  disabled={publishing}
                  className="gallery-btn gallery-btn-secondary"
                >
                  {publishing && <Loader2 className="" />}
                  {gallery.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <span className="">
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
            <div className="">
              <div className="">
                <p className="">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className=""
              >
                <X className="" />
              </button>
            </div>
          )}

          {/* TAB CONTENT */}
          <div className="">
            {/* PHOTOS TAB */}
            {activeTab === 'photos' && (
              <section className="os-reveal">
                <PhotoUploader
                  galleryId={id}
                  onUploadComplete={() => {
                    refreshGallery()
                  }}
                />

                {/* SELECTION TOOLBAR */}
                {selectedPhotos.size > 0 && (
                  <div className="">
                    <span className="">
                      {selectedPhotos.size} item{selectedPhotos.size !== 1 ? 's' : ''} selected
                    </span>
                    <div className="">
                      <button
                        onClick={() => {
                          setShowCollectionPicker(true)
                          setMoveDestination(null)
                        }}
                        className="gallery-btn gallery-btn-secondary"
                      >
                        <Copy className="" />
                        Move
                      </button>
                      <button
                        onClick={() => void handleDeletePhotos()}
                        className="gallery-btn gallery-btn-secondary"
                      >
                        <Trash2 className="" />
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
                  <div className="">
                    <div className="">
                      <div className="">
                        <p className="">
                          Move {selectedPhotos.size} selected item{selectedPhotos.size !== 1 ? 's' : ''} to:
                        </p>
                      </div>
                      <div className="">
                        <label className="">
                          <input
                            type="radio"
                            name="move-destination"
                            value="null"
                            checked={moveDestination === null}
                            onChange={() => setMoveDestination(null)}
                            className=""
                          />
                          <span>All Photos (no collection)</span>
                        </label>
                        {gallery.collections?.map((coll) => (
                          <label key={coll.id} className="">
                            <input
                              type="radio"
                              name="move-destination"
                              value={coll.id}
                              checked={moveDestination === coll.id}
                              onChange={() => setMoveDestination(coll.id)}
                              className=""
                            />
                            <span className="">
                              {coll.title}
                            </span>
                            <span className="">
                              {coll.photo_count || 0} items
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="">
                        <button
                          onClick={() => {
                            setShowCollectionPicker(false)
                            setMoveDestination(null)
                          }}
                          className=""
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            handleMoveToCollection(moveDestination)
                            setShowCollectionPicker(false)
                            setMoveDestination(null)
                          }}
                          className=""
                        >
                          Move items
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* PHOTOS GRID */}
                <div className="ui-card">
                  <div className="">
                    <h2 className="">Photos & Videos</h2>
                    <div className="">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="gallery-input"
                      >
                        <option value="custom">Custom Order</option>
                        <option value="filename_asc">Filename A–Z</option>
                        <option value="filename_desc">Filename Z–A</option>
                        <option value="date_uploaded_new">Uploaded (newest)</option>
                        <option value="date_uploaded_old">Uploaded (oldest)</option>
                      </select>
                      <label className="">
                        <input
                          type="checkbox"
                          checked={selectedPhotos.size === (gallery?.photos?.length || 0) && (gallery?.photos?.length || 0) > 0}
                          ref={(el) => {
                            if (el) {
                              el.indeterminate = selectedPhotos.size > 0 && selectedPhotos.size < (gallery?.photos?.length || 0)
                            }
                          }}
                          onChange={() => handleSelectAll()}
                          className=""
                        />
                        <span>Select All</span>
                      </label>
                    </div>
                  </div>

                  {filteredPhotos.length > 0 ? (
                    <div className="">
                      {filteredPhotos.map((photo) => {
                        const mediaType = getMediaType(photo)

                        return (
                          <div
                            key={photo.id}
                            className=""
                            onClick={() => handlePhotoToggle(photo.id)}
                          >
                            {/* CHECKBOX */}
                            <div className="">
                              {selectedPhotos.has(photo.id) && (
                                <div className="" />
                              )}
                            </div>

                            {/* HIDDEN INDICATOR */}
                            {photo.isHidden && (
                              <div className="">
                                <EyeOff className="" />
                              </div>
                            )}

                            {/* MEDIA DISPLAY */}
                            {mediaType === 'video' ? (
                              <div className="">
                                <video
                                  src={photo.thumbnailUrl || photo.displayUrl || photo.originalUrl}
                                  className=""
                                  preload="metadata"
                                />
                                {/* Video Icon Overlay */}
                                <div className="">
                                  <Video className="" />
                                </div>
                                {/* Duration Badge */}
                                {photo.duration && (
                                  <div className="">
                                    {formatDuration(photo.duration)}
                                  </div>
                                )}
                              </div>
                            ) : (
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
                            )}

                            {/* FILENAME OVERLAY */}
                            <div className="to-transparent">
                              <p className="">
                                {photo.filename.split('.').slice(0, -1).join('.')}
                              </p>
                            </div>

                            {/* HOVER ACTIONS */}
                            <div className="">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  void handleToggleHidden(photo.id, photo.isHidden)
                                }}
                                className=""
                                title={photo.isHidden ? 'Show' : 'Hide'}
                              >
                                {photo.isHidden ? (
                                  <EyeOff className="" />
                                ) : (
                                  <Eye className="" />
                                )}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="">
                      <p className="">
                        No photos in this gallery yet. Use the upload area above to add photos.
                      </p>
                    </div>
                  )}
                </div>

                {/* COLLECTIONS */}
                <div className="ui-card">
                  <div className="">
                    <h2 className="">Collections</h2>
                    <button
                      type="button"
                      onClick={() => document.getElementById('new-collection-input')?.focus()}
                      className="gallery-btn gallery-btn-secondary"
                    >
                      <Plus className="" />
                      New
                    </button>
                  </div>

                  <div className="">
                    <input
                      id="new-collection-input"
                      value={collectionTitle}
                      onChange={(event) => setCollectionTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') void handleCreateCollection()
                      }}
                      placeholder="e.g. Ceremony, Portraits"
                      className="gallery-input"
                    />
                    <button
                      type="button"
                      onClick={() => void handleCreateCollection()}
                      disabled={creatingCollection || !collectionTitle.trim()}
                      className="gallery-btn gallery-btn-secondary"
                    >
                      {creatingCollection ? <Loader2 className="" /> : <Plus className="" />}
                    </button>
                  </div>

                  {gallery.collections && gallery.collections.length > 0 ? (
                    <div className="">
                      <button
                        onClick={() => setActiveCollection(null)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          activeCollection === null
                            ? 'bg-[var(--color-accent-light)] border-[var(--color-accent)] text-[var(--color-accent)]'
                            : 'border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-soft)]'
                        }`}
                      >
                        <span className="">All Photos & Videos</span>
                        <span className="">
                          {gallery.photos?.length || 0} items
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
                          <span className="">{collection.title}</span>
                          <span className="">
                            {collection.photo_count || 0} items
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="">No collections yet. Create one to organize your photos and videos.</p>
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

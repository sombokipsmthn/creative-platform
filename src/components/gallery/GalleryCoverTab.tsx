'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, Check } from 'lucide-react'
import Image from 'next/image'

interface GalleryPhoto {
  id: string
  thumbnailUrl: string
  displayUrl: string
  filename: string
}

interface GalleryCoverTabProps {
  galleryId: string
  gallery: Record<string, unknown>
  onRefresh: () => Promise<void>
}

export default function GalleryCoverTab({ galleryId, gallery, onRefresh }: GalleryCoverTabProps) {
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null)
  const [focalPoint, setFocalPoint] = useState({ x: 0.5, y: 0.5 })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const photos = (gallery.photos as GalleryPhoto[] | undefined) || []

  useEffect(() => {
    const fetchCover = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/galleries/${galleryId}`)
        if (response.ok) {
          const data = await response.json() as { gallery?: Record<string, unknown> }
          const g = data.gallery || {}
          setCoverPhotoId(String(g.cover_photo_id || ''))
          const fp = g.focal_point as Record<string, number> | undefined
          if (fp) {
            setFocalPoint({ x: fp.x ?? 0.5, y: fp.y ?? 0.5 })
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cover')
      } finally {
        setLoading(false)
      }
    }
    fetchCover()
  }, [galleryId])

  const handleSetCover = async (photoId: string) => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverPhotoId: photoId }),
      })
      if (!response.ok) throw new Error('Failed to set cover')
      setCoverPhotoId(photoId)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
      await onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set cover')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveFocalPoint = async () => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focal_point: focalPoint }),
      })
      if (!response.ok) throw new Error('Failed to save focal point')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
      await onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save focal point')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="ui-card p-6">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  const currentCover = photos.find(p => p.id === coverPhotoId)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">Saved successfully</p>
        </div>
      )}

      {/* CURRENT COVER */}
      {currentCover && (
        <div className="ui-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Current Cover</h2>
          <div className="relative aspect-video rounded-lg overflow-hidden bg-[var(--color-bg-soft)] border border-[var(--color-border-subtle)]">
            <Image
              src={currentCover.displayUrl || currentCover.thumbnailUrl}
              alt="Cover"
              fill
              unoptimized
              className="object-cover"
            />
            {/* FOCAL POINT INDICATOR */}
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
      )}

      {/* FOCAL POINT EDITOR */}
      {currentCover && (
        <div className="ui-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Focal Point</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Click on the image to set the focal point. This determines how the cover crops on different devices.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">X Position</label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={focalPoint.x * 100}
                onChange={(e) => setFocalPoint({ ...focalPoint, x: Number(e.target.value) / 100 })}
                className="w-full"
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {Math.round(focalPoint.x * 100)}%
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Y Position</label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={focalPoint.y * 100}
                onChange={(e) => setFocalPoint({ ...focalPoint, y: Number(e.target.value) / 100 })}
                className="w-full"
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {Math.round(focalPoint.y * 100)}%
              </p>
            </div>
          </div>

          <button
            onClick={() => void handleSaveFocalPoint()}
            disabled={saving}
            className="gallery-btn gallery-btn-primary"
          >
            {saving ? (
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

      {/* CHOOSE COVER */}
      <div className="ui-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Choose Cover Photo</h2>
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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
                />
                {coverPhotoId === photo.id && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">
            No photos uploaded yet. Upload photos to choose a cover.
          </p>
        )}
      </div>
    </div>
  )
}

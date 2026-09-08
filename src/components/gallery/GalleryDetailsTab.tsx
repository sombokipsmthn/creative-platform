'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'

interface GalleryDetailsTabProps {
  galleryId: string
  onRefresh: () => Promise<void>
}

export default function GalleryDetailsTab({ galleryId, onRefresh }: GalleryDetailsTabProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/galleries/${galleryId}`)
        if (response.ok) {
          const data = await response.json() as { gallery?: Record<string, unknown> }
          const gallery = data.gallery || {}
          setTitle(String(gallery.title || ''))
          setDescription(String(gallery.description || ''))
          setCategory(String(gallery.category || ''))
          setSlug(String(gallery.slug || ''))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load gallery')
      } finally {
        setLoading(false)
      }
    }
    fetchGallery()
  }, [galleryId])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, slug }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(body?.error || 'Failed to save')
      }
      setSuccess(true)
      await onRefresh()
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save gallery details')
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="ui-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Gallery Details</h2>

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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="gallery-input"
              placeholder="Gallery title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="gallery-input min-h-24"
              placeholder="Gallery description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="gallery-input"
              placeholder="e.g. Wedding, Portrait Session"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              className="gallery-input"
              placeholder="gallery-slug"
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Used in the gallery URL
            </p>
          </div>
        </div>

        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="gallery-btn gallery-btn-primary"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  )
}

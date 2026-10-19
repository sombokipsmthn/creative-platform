'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'

interface GallerySettingsTabProps {
  galleryId: string
  gallery: Record<string, unknown>
  onRefresh: () => Promise<void>
}

export default function GallerySettingsTab({ galleryId, gallery, onRefresh }: GallerySettingsTabProps) {
  // General settings (from Details)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [slug, setSlug] = useState('')

  // Permissions
  const [allowDownloads, setAllowDownloads] = useState(true)
  const [allowFavorites, setAllowFavorites] = useState(true)
  const [allowSelections, setAllowSelections] = useState(true)

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/galleries/${galleryId}`)
        if (response.ok) {
          const data = await response.json() as { gallery?: Record<string, unknown> }
          const g = data.gallery || {}
          setTitle(String(g.title || ''))
          setDescription(String(g.description || ''))
          setCategory(String(g.category || ''))
          setSlug(String(g.slug || ''))
          setAllowDownloads(Boolean(g.allow_downloads ?? true))
          setAllowFavorites(Boolean(g.allow_favorites ?? true))
          setAllowSelections(Boolean(g.allow_selections ?? true))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [galleryId])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          slug,
          allowDownloads,
          allowFavorites,
          allowSelections,
        }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(body?.error || 'Failed to save')
      }
      setSuccess(true)
      await onRefresh()
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="ui-card">
        <div className="">
          <Loader2 className="" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      {error && (
        <div className="">
          <AlertCircle className="" />
          <p className="">{error}</p>
        </div>
      )}

      {success && (
        <div className="">
          <p className="">Saved successfully</p>
        </div>
      )}

      {/* GENERAL SECTION */}
      <div className="ui-card">
        <h2 className="">General</h2>

        <div>
          <label className="block">Gallery Name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="gallery-input"
            placeholder="Gallery title"
          />
        </div>

        <div>
          <label className="block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="gallery-input"
            placeholder="Gallery description"
          />
        </div>

        <div className="">
          <div>
            <label className="block">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="gallery-input"
              placeholder="e.g. Wedding, Portrait"
            />
          </div>

          <div>
            <label className="block">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              className="gallery-input"
              placeholder="gallery-slug"
            />
            <p className="">Used in the gallery URL</p>
          </div>
        </div>
      </div>

      {/* CLIENT PERMISSIONS SECTION */}
      <div className="ui-card">
        <h2 className="">Client Permissions</h2>

        <div className="">
          <label className="">
            <input
              type="checkbox"
              checked={allowDownloads}
              onChange={(e) => setAllowDownloads(e.target.checked)}
              className=""
            />
            <div>
              <p className="">Allow Downloads</p>
              <p className="">
                Clients can download photos from the gallery
              </p>
            </div>
          </label>

          <label className="">
            <input
              type="checkbox"
              checked={allowFavorites}
              onChange={(e) => setAllowFavorites(e.target.checked)}
              className=""
            />
            <div>
              <p className="">Allow Favorites</p>
              <p className="">
                Clients can mark photos as favorites
              </p>
            </div>
          </label>

          <label className="">
            <input
              type="checkbox"
              checked={allowSelections}
              onChange={(e) => setAllowSelections(e.target.checked)}
              className=""
            />
            <div>
              <p className="">Allow Selections</p>
              <p className="">
                Clients can select/cart multiple photos
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={() => void handleSave()}
        disabled={saving}
        className="gallery-btn gallery-btn-primary"
      >
        {saving ? (
          <>
            <Loader2 className="" />
            Saving...
          </>
        ) : (
          'Save Settings'
        )}
      </button>
    </div>
  )
}

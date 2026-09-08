'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'

interface GallerySettingsTabProps {
  galleryId: string
  onRefresh: () => Promise<void>
}

export default function GallerySettingsTab({ galleryId, onRefresh }: GallerySettingsTabProps) {
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
      <div className="ui-card p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Client Permissions</h2>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-sm text-green-700 font-medium">Saved successfully</p>
            </div>
          )}

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowDownloads}
                onChange={(e) => setAllowDownloads(e.target.checked)}
                className="w-5 h-5 rounded border-[var(--color-border-subtle)] accent-[var(--color-accent)] mt-0.5"
              />
              <div>
                <p className="font-medium">Allow Downloads</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Clients can download photos from the gallery
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowFavorites}
                onChange={(e) => setAllowFavorites(e.target.checked)}
                className="w-5 h-5 rounded border-[var(--color-border-subtle)] accent-[var(--color-accent)] mt-0.5"
              />
              <div>
                <p className="font-medium">Allow Favorites</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Clients can mark photos as favorites
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowSelections}
                onChange={(e) => setAllowSelections(e.target.checked)}
                className="w-5 h-5 rounded border-[var(--color-border-subtle)] accent-[var(--color-accent)] mt-0.5"
              />
              <div>
                <p className="font-medium">Allow Selections</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Clients can select/cart multiple photos
                </p>
              </div>
            </label>
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
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  )
}

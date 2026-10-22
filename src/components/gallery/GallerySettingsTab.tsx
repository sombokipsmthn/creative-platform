'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
  const [portfolioPublishMode, setPortfolioPublishMode] = useState<'none' | 'all' | 'selected'>('none')
  const [collections, setCollections] = useState<Array<{ id: string; title: string; portfolioSelection?: string; clientVisibility?: string }>>([])

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
          setPortfolioPublishMode((g.portfolioPublishMode as 'none' | 'all' | 'selected') || 'none')
          setCollections((data as { collections?: typeof collections }).collections || [])
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
          portfolioPublishMode,
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
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      {/* GENERAL SECTION */}
      <Card><CardHeader><CardTitle>General</CardTitle></CardHeader><CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Gallery Name</label>
          <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Gallery title" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-24" placeholder="Gallery description" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Wedding, Portrait" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <Input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="gallery-slug" />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Used in the gallery URL</p>
          </div>
        </div>
      </CardContent></Card>

      <Card><CardHeader><CardTitle>Creator portfolio</CardTitle></CardHeader><CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Gallery access, client permissions, and portfolio publication are independent.</p>
        <select value={portfolioPublishMode} onChange={(e) => setPortfolioPublishMode(e.target.value as typeof portfolioPublishMode)} className="ui-select w-full rounded-md border px-3 py-2">
          <option value="none">Unpublished</option>
          <option value="selected">Selected sets and individual media</option>
          <option value="all">Publish entire gallery</option>
        </select>
        {collections.length > 0 && <div className="space-y-2">{collections.map((collection) => <div key={collection.id} className="grid gap-2 rounded-md border p-3 sm:grid-cols-3 sm:items-center"><span className="text-sm font-medium">{collection.title}</span><select value={collection.portfolioSelection || 'inherit'} onChange={async (e) => { const value = e.target.value; setCollections((current) => current.map((item) => item.id === collection.id ? { ...item, portfolioSelection: value } : item)); await fetch(`/api/galleries/${galleryId}/collections`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ collectionId: collection.id, portfolioSelection: value }) }) }} className="ui-select rounded-md border px-2 py-1 text-sm"><option value="inherit">Follow gallery</option><option value="include">Publish set</option><option value="exclude">Exclude set</option></select><select value={collection.clientVisibility || 'all'} onChange={async (e) => { const value = e.target.value; setCollections((current) => current.map((item) => item.id === collection.id ? { ...item, clientVisibility: value } : item)); await fetch(`/api/galleries/${galleryId}/collections`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ collectionId: collection.id, clientVisibility: value }) }) }} className="ui-select rounded-md border px-2 py-1 text-sm"><option value="all">All visitors</option><option value="authorized">Authorized clients</option><option value="guest">Guests only</option><option value="none">Hidden from clients</option></select></div>)}</div>}
      </CardContent></Card>

      {/* CLIENT PERMISSIONS SECTION */}
      <Card><CardHeader><CardTitle>Client Permissions</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="space-y-3">
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
      </CardContent></Card>

      {/* SAVE BUTTON */}
      <Button onClick={() => void handleSave()} disabled={saving} variant="primary">
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Settings'
        )}
      </Button>
    </div>
  )
}

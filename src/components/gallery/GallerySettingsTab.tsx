'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, Trash2 } from 'lucide-react'

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
  const [watermark, setWatermark] = useState({ enabled: true, text: 'KIPSMTHN', position: 'bottom-right', opacity: 55, fontSize: 42 })
  const [presets, setPresets] = useState<Array<{ id: string; name: string; enabled: boolean; text: string; position: string; opacity: number; fontSize: number }>>([])
  const [presetName, setPresetName] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const [galleryResponse, presetsResponse] = await Promise.all([
          fetch(`/api/galleries/${galleryId}`),
          fetch('/api/watermark-presets', { cache: 'no-store' }),
        ])
        if (galleryResponse.ok) {
          const data = await galleryResponse.json() as { gallery?: Record<string, unknown>; watermark?: Record<string, unknown> }
          const g = data.gallery || {}
          setTitle(String(g.title || ''))
          setDescription(String(g.description || ''))
          setCategory(String(g.category || ''))
          setSlug(String(g.slug || ''))
          setAllowDownloads(Boolean(g.allow_downloads ?? true))
          setAllowFavorites(Boolean(g.allow_favorites ?? true))
          setAllowSelections(Boolean(g.allow_selections ?? true))
          const w = data.watermark || {}
          setWatermark({ enabled: w.enabled !== false, text: String(w.text || 'KIPSMTHN'), position: String(w.position || 'bottom-right'), opacity: Number(w.opacity ?? 55), fontSize: Number(w.font_size ?? 42) })
        }
        if (presetsResponse.ok) {
          const data = await presetsResponse.json() as { presets?: typeof presets }
          setPresets(data.presets || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    void fetchSettings()
  }, [galleryId])

  const saveWatermark = async (next: typeof watermark) => {
    const response = await fetch(`/api/galleries/${galleryId}/watermark`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: next.enabled, text: next.text, position: next.position, opacity: next.opacity, fontSize: next.fontSize }) })
    if (!response.ok) throw new Error('Failed to save watermark settings')
    setWatermark(next)
    await onRefresh()
  }

  const savePreset = async () => {
    if (!presetName.trim()) return
    setError(null)
    try {
      const response = await fetch('/api/watermark-presets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: presetName, ...watermark }) })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Failed to save preset')
      setPresets(current => [...current, body.preset].sort((a, b) => a.name.localeCompare(b.name)))
      setPresetName('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to save preset') }
  }

  const deletePreset = async (id: string) => {
    const response = await fetch('/api/watermark-presets', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (!response.ok) { const body = await response.json().catch(() => null); setError(body?.error || 'Failed to delete preset'); return }
    setPresets(current => current.filter(preset => preset.id !== id))
  }

  const applyPreset = async (preset: typeof presets[number]) => {
    try { await saveWatermark({ enabled: preset.enabled, text: preset.text, position: preset.position, opacity: preset.opacity, fontSize: preset.fontSize }) }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to apply preset') }
  }
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, slug, allowDownloads, allowFavorites, allowSelections }),
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

      {/* WATERMARK PRESETS */}
      <div className="ui-card">
        <h2 className="">Watermark presets</h2>
        <p className="ui-meta">Workspace presets are private to this creator and can be applied to this gallery.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block"><span className="ui-label">Watermark text</span><input className="gallery-input" value={watermark.text} onChange={e => setWatermark(current => ({ ...current, text: e.target.value }))} /></label>
          <label className="block"><span className="ui-label">Position</span><select className="gallery-input" value={watermark.position} onChange={e => setWatermark(current => ({ ...current, position: e.target.value }))}><option value="top-left">Top left</option><option value="top-right">Top right</option><option value="bottom-left">Bottom left</option><option value="bottom-right">Bottom right</option><option value="center">Center</option></select></label>
          <label className="block"><span className="ui-label">Opacity</span><input className="gallery-input" type="number" min="0" max="100" value={watermark.opacity} onChange={e => setWatermark(current => ({ ...current, opacity: Number(e.target.value) }))} /></label>
          <label className="block"><span className="ui-label">Font size</span><input className="gallery-input" type="number" min="12" max="160" value={watermark.fontSize} onChange={e => setWatermark(current => ({ ...current, fontSize: Number(e.target.value) }))} /></label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2"><button type="button" className="gallery-btn gallery-btn-primary" onClick={() => void saveWatermark(watermark)}>Save watermark</button><input className="gallery-input max-w-xs" placeholder="Preset name" value={presetName} onChange={e => setPresetName(e.target.value)} /><button type="button" className="gallery-btn gallery-btn-secondary" onClick={() => void savePreset()} disabled={!presetName.trim()}>Save preset</button></div>
        {presets.length > 0 && <div className="mt-4 grid gap-2">{presets.map(preset => <div key={preset.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"><span>{preset.name}</span><div className="flex gap-2"><button type="button" className="gallery-btn gallery-btn-secondary" onClick={() => void applyPreset(preset)}>Apply</button><button type="button" className="gallery-btn gallery-btn-secondary" aria-label={`Delete ${preset.name}`} onClick={() => void deletePreset(preset.id)}><Trash2 className="h-4 w-4" /></button></div></div>)}</div>}
      </div>


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

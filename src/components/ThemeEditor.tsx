'use client'

import { useState, useEffect } from 'react'

interface Theme {
  id: string
  galleryId: string
  name: string
  type: 'preset' | 'custom'
  layout: 'masonry' | 'grid' | 'slideshow' | 'list'
  accentColor: string
  backgroundColor: string
  textColor: string
  borderRadius: number
  showTitle: boolean
  showDescription: boolean
  showCollections: boolean
  masonryColumns: number
  aspectRatio: string
}

const PRESET_THEMES: Theme[] = [
  {
    id: 'preset-minimal',
    galleryId: '',
    name: 'Minimal',
    type: 'preset',
    layout: 'masonry',
    accentColor: '#000000',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderRadius: 0,
    showTitle: true,
    showDescription: false,
    showCollections: true,
    masonryColumns: 4,
    aspectRatio: 'auto',
  },
  {
    id: 'preset-bold',
    galleryId: '',
    name: 'Bold',
    type: 'preset',
    layout: 'grid',
    accentColor: '#7c3aed',
    backgroundColor: '#0f172a',
    textColor: '#ffffff',
    borderRadius: 12,
    showTitle: true,
    showDescription: true,
    showCollections: true,
    masonryColumns: 3,
    aspectRatio: '1:1',
  },
  {
    id: 'preset-light',
    galleryId: '',
    name: 'Light',
    type: 'preset',
    layout: 'masonry',
    accentColor: '#06b6d4',
    backgroundColor: '#f8fafc',
    textColor: '#1e293b',
    borderRadius: 8,
    showTitle: true,
    showDescription: true,
    showCollections: true,
    masonryColumns: 3,
    aspectRatio: 'auto',
  },
  {
    id: 'preset-dark',
    galleryId: '',
    name: 'Dark',
    type: 'preset',
    layout: 'masonry',
    accentColor: '#fbbf24',
    backgroundColor: '#1f2937',
    textColor: '#f3f4f6',
    borderRadius: 16,
    showTitle: true,
    showDescription: false,
    showCollections: true,
    masonryColumns: 4,
    aspectRatio: 'auto',
  },
]

interface ThemeEditorProps {
  galleryId: string
  onThemeChange?: (theme: Theme) => void
}

export default function ThemeEditor({ galleryId, onThemeChange }: ThemeEditorProps) {
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [theme, setTheme] = useState<Theme | null>(null)
  const [showPresets, setShowPresets] = useState(false)

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await fetch(`/api/galleries/${galleryId}/theme`)
        if (response.ok) {
          const data = await response.json()
          setTheme(data.theme)
          setSelectedTheme(data.theme)
        }
      } catch (error) {
        console.error('Failed to load theme:', error)
      }
    }
    fetchTheme()
  }, [galleryId])

  const applyPreset = async (preset: Theme) => {
    const updated = {
      ...preset,
      galleryId,
    }

    try {
      const response = await fetch(`/api/galleries/${galleryId}/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })

      if (response.ok) {
        const data = await response.json()
        setTheme(data.theme)
        setSelectedTheme(data.theme)
        onThemeChange?.(data.theme)
        setShowPresets(false)
      }
    } catch (error) {
      console.error('Failed to apply theme:', error)
    }
  }

  const updateThemeProperty = async (
    key: keyof Theme,
    value: any
  ) => {
    if (!theme) return

    const updated = {
      ...theme,
      [key]: value,
    }

    try {
      const response = await fetch(`/api/galleries/${galleryId}/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })

      if (response.ok) {
        const data = await response.json()
        setTheme(data.theme)
        setSelectedTheme(data.theme)
        onThemeChange?.(data.theme)
      }
    } catch (error) {
      console.error('Failed to update theme:', error)
    }
  }

  if (!theme) {
    return (
      <div className="p-6 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl">
        <p className="text-sm text-slate-500 dark:text-zinc-500">Loading theme...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* PRESET THEMES */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Gallery Theme</h3>
        
        <div className="space-y-4">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-left hover:bg-slate-50 dark:hover:bg-zinc-900 transition"
          >
            <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedTheme?.name || 'Select theme'}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">Choose a preset or customize</p>
          </button>

          {showPresets && (
            <div className="grid grid-cols-2 gap-2">
              {PRESET_THEMES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  style={{
                    backgroundColor: preset.backgroundColor,
                    borderColor: preset.accentColor,
                  }}
                  className="p-4 rounded-lg border-2 text-sm font-medium text-center transition hover:opacity-80"
                >
                  <span style={{ color: preset.textColor }}>{preset.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LAYOUT OPTIONS */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Layout</h3>
        <select
          value={theme.layout}
          onChange={(e) => updateThemeProperty('layout', e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm outline-none focus:border-purple-500"
        >
          <option value="masonry">Masonry (Pinterest style)</option>
          <option value="grid">Grid (equal sizes)</option>
          <option value="slideshow">Slideshow</option>
          <option value="list">List</option>
        </select>
      </div>

      {/* COLOR CUSTOMIZATION */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white">Colors</h3>
        
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">Accent Color</label>
          <input
            type="color"
            value={theme.accentColor}
            onChange={(e) => updateThemeProperty('accentColor', e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-200 dark:border-zinc-800 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">Background</label>
          <input
            type="color"
            value={theme.backgroundColor}
            onChange={(e) => updateThemeProperty('backgroundColor', e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-200 dark:border-zinc-800 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">Text Color</label>
          <input
            type="color"
            value={theme.textColor}
            onChange={(e) => updateThemeProperty('textColor', e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-200 dark:border-zinc-800 cursor-pointer"
          />
        </div>
      </div>

      {/* MASONRY SETTINGS */}
      {theme.layout === 'masonry' && (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Masonry Columns</h3>
          <input
            type="range"
            min="1"
            max="6"
            value={theme.masonryColumns}
            onChange={(e) => updateThemeProperty('masonryColumns', parseInt(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-2">{theme.masonryColumns} columns</p>
        </div>
      )}

      {/* VISIBILITY SETTINGS */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Visibility</h3>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={theme.showTitle}
            onChange={(e) => updateThemeProperty('showTitle', e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-purple-600"
          />
          <span className="text-sm text-slate-700 dark:text-zinc-300">Show Gallery Title</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={theme.showDescription}
            onChange={(e) => updateThemeProperty('showDescription', e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-purple-600"
          />
          <span className="text-sm text-slate-700 dark:text-zinc-300">Show Description</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={theme.showCollections}
            onChange={(e) => updateThemeProperty('showCollections', e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-purple-600"
          />
          <span className="text-sm text-slate-700 dark:text-zinc-300">Show Collections</span>
        </label>
      </div>
    </div>
  )
}

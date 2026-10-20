'use client'

import { useState, useEffect } from 'react'
import { GALLERY_THEMES, type GalleryThemePreset, type GalleryThemeId } from '@/lib/gallery/themes'
import { ChevronRight } from 'lucide-react'

interface ThemeEditorProps {
  galleryId: string
  onThemeChange?: (preset: Partial<GalleryThemePreset>) => void
}

interface SavedTheme {
  id: string
  galleryId: string
  name: string
  type: string
  layout: string
  accentColor: string
  backgroundColor: string
  textColor: string
  borderRadius: number
  showTitle: boolean
  showDescription: boolean
  showCollections: boolean
  showLogo: boolean
  masonryColumns: number
  aspectRatio: string
  customCSS: string | null
  fontFamily: string
  coverStyle: string
  coverFocalX: number
  coverFocalY: number
  coverOverlayOpacity: number
  gridStyle: string
  thumbnailSize: string
  gridSpacing: string
  navigationStyle: string
  createdAt: string
  updatedAt: string
}

type ActiveSection = 'themes' | 'cover' | 'typography' | 'colors' | 'grid' | 'general'

export default function ThemeEditor({ galleryId, onThemeChange }: ThemeEditorProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>('themes')
  const [savedTheme, setSavedTheme] = useState<SavedTheme | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const response = await fetch(`/api/galleries/${galleryId}/theme`)
        if (response.ok) {
          const data = await response.json()
          setSavedTheme(data.theme)
        }
      } catch (error) {
        console.error('Failed to load theme:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTheme()
  }, [galleryId])

  const updateTheme = async (updates: Partial<SavedTheme>) => {
    if (!savedTheme) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/galleries/${galleryId}/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        setSavedTheme(data.theme)
        onThemeChange?.(data.theme)
      }
    } catch (error) {
      console.error('Failed to update theme:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const applyThemePreset = async (themeId: GalleryThemeId) => {
    const theme = GALLERY_THEMES.find(t => t.id === themeId)
    if (!theme) return

    const preset = theme.preset
    await updateTheme({
      name: theme.label,
      type: 'preset',
      layout: preset.layout,
      accentColor: preset.accentColor,
      backgroundColor: preset.backgroundColor,
      textColor: preset.textColor,
      borderRadius: preset.borderRadius,
      showTitle: preset.showTitle,
      showDescription: preset.showDescription,
      showCollections: preset.showCollections,
      showLogo: preset.showLogo,
      masonryColumns: preset.masonryColumns,
      aspectRatio: preset.aspectRatio,
      fontFamily: preset.fontFamily,
      coverStyle: preset.coverStyle,
      coverFocalX: preset.coverFocalX,
      coverFocalY: preset.coverFocalY,
      coverOverlayOpacity: preset.coverOverlayOpacity,
      gridStyle: preset.gridStyle,
      thumbnailSize: preset.thumbnailSize,
      gridSpacing: preset.gridSpacing,
      navigationStyle: preset.navigationStyle,
    } as Partial<SavedTheme>)
  }

  if (loading || !savedTheme) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-500">Loading theme editor...</p>
      </div>
    )
  }

  const currentThemeId = GALLERY_THEMES.find(
    t => t.label === savedTheme.name && savedTheme.type === 'preset'
  )?.id

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-zinc-800">
        {[
          { id: 'themes' as const, label: 'Themes', icon: '🎨' },
          { id: 'cover' as const, label: 'Cover', icon: '🖼️' },
          { id: 'typography' as const, label: 'Typography', icon: '✍️' },
          { id: 'colors' as const, label: 'Colors', icon: '🎭' },
          { id: 'grid' as const, label: 'Grid', icon: '⊞' },
          { id: 'general' as const, label: 'General', icon: '⚙️' },
        ].map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeSection === section.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      {/* THEMES SECTION */}
      {activeSection === 'themes' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">
              Select a Gallery Theme
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
              Choose from five professionally designed themes. Each provides a unique visual presentation for your gallery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {GALLERY_THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => applyThemePreset(theme.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  currentThemeId === theme.id
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {theme.label}
                  </h4>
                  {currentThemeId === theme.id && (
                    <span className="text-purple-600 text-xs font-semibold">
                      ✓ Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  {theme.description}
                </p>
                <div className="mt-3 flex gap-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: theme.preset.accentColor }}
                  />
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: theme.preset.backgroundColor }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* COVER SECTION */}
      {activeSection === 'cover' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white">
            Cover Settings
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
              Cover Style
            </label>
            <select
              value={savedTheme.coverStyle}
              onChange={(e) =>
                updateTheme({ coverStyle: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
            >
              <option value="image">Image (Full Cover)</option>
              <option value="split">Split (Image + Text)</option>
              <option value="centered">Centered (Image Only)</option>
              <option value="minimal">Minimal (Text Only)</option>
              <option value="immersive">Immersive (Full Bleed)</option>
              <option value="none">None</option>
            </select>
          </div>

          {['image', 'split', 'centered', 'immersive'].includes(savedTheme.coverStyle) && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
                    Focal Point X: {savedTheme.coverFocalX}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={savedTheme.coverFocalX}
                    onChange={(e) =>
                      updateTheme({ coverFocalX: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
                    Focal Point Y: {savedTheme.coverFocalY}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={savedTheme.coverFocalY}
                    onChange={(e) =>
                      updateTheme({ coverFocalY: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
                  Overlay Opacity: {savedTheme.coverOverlayOpacity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={savedTheme.coverOverlayOpacity}
                  onChange={(e) =>
                    updateTheme({ coverOverlayOpacity: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </>
          )}

          <div className="space-y-3 border-t border-slate-200 dark:border-zinc-800 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={savedTheme.showTitle}
                onChange={(e) => updateTheme({ showTitle: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-700 dark:text-zinc-300">Show Gallery Title</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={savedTheme.showDescription}
                onChange={(e) => updateTheme({ showDescription: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-700 dark:text-zinc-300">Show Description</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={savedTheme.showLogo}
                onChange={(e) => updateTheme({ showLogo: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-700 dark:text-zinc-300">Show Logo</span>
            </label>
          </div>
        </div>
      )}

      {/* TYPOGRAPHY SECTION */}
      {activeSection === 'typography' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white">
            Typography
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
              Font Family
            </label>
            <select
              value={savedTheme.fontFamily}
              onChange={(e) => updateTheme({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
            >
              <option value="sans">Sans Serif (Modern)</option>
              <option value="serif">Serif (Editorial)</option>
              <option value="modern">Modern (Geometric)</option>
              <option value="editorial">Editorial (Story)</option>
            </select>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Font family changes how your gallery title, descriptions, and labels appear across the client gallery.
            </p>
          </div>
        </div>
      )}

      {/* COLORS SECTION */}
      {activeSection === 'colors' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white">
            Color Scheme
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={savedTheme.accentColor}
                onChange={(e) => updateTheme({ accentColor: e.target.value })}
                className="w-12 h-10 rounded-lg border border-slate-200 dark:border-zinc-800 cursor-pointer"
              />
              <input
                type="text"
                value={savedTheme.accentColor}
                onChange={(e) => updateTheme({ accentColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={savedTheme.backgroundColor}
                onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                className="w-12 h-10 rounded-lg border border-slate-200 dark:border-zinc-800 cursor-pointer"
              />
              <input
                type="text"
                value={savedTheme.backgroundColor}
                onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={savedTheme.textColor}
                onChange={(e) => updateTheme({ textColor: e.target.value })}
                className="w-12 h-10 rounded-lg border border-slate-200 dark:border-zinc-800 cursor-pointer"
              />
              <input
                type="text"
                value={savedTheme.textColor}
                onChange={(e) => updateTheme({ textColor: e.target.value })}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
              Border Radius: {savedTheme.borderRadius}px
            </label>
            <input
              type="range"
              min="0"
              max="24"
              value={savedTheme.borderRadius}
              onChange={(e) => updateTheme({ borderRadius: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* GRID SECTION */}
      {activeSection === 'grid' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white">
            Grid & Layout
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
              Grid Style
            </label>
            <select
              value={savedTheme.gridStyle}
              onChange={(e) => updateTheme({ gridStyle: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
            >
              <option value="masonry">Masonry (Varied Heights)</option>
              <option value="vertical">Vertical (Column Stack)</option>
              <option value="horizontal">Horizontal (Row Stack)</option>
              <option value="uniform">Uniform (Equal Sizes)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
              Thumbnail Size
            </label>
            <select
              value={savedTheme.thumbnailSize}
              onChange={(e) => updateTheme({ thumbnailSize: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
            >
              <option value="small">Small (Compact View)</option>
              <option value="regular">Regular (Balanced)</option>
              <option value="large">Large (Spacious)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
              Grid Spacing
            </label>
            <select
              value={savedTheme.gridSpacing}
              onChange={(e) => updateTheme({ gridSpacing: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
            >
              <option value="tight">Tight (Minimal Gap)</option>
              <option value="regular">Regular (Balanced Gap)</option>
              <option value="wide">Wide (Spacious Gap)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
              Aspect Ratio
            </label>
            <select
              value={savedTheme.aspectRatio}
              onChange={(e) => updateTheme({ aspectRatio: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
            >
              <option value="auto">Auto (Original Proportions)</option>
              <option value="1:1">Square (1:1)</option>
              <option value="16:9">Widescreen (16:9)</option>
              <option value="4:3">Standard (4:3)</option>
              <option value="3:2">Classic (3:2)</option>
            </select>
          </div>

          {savedTheme.gridStyle === 'masonry' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
                Masonry Columns: {savedTheme.masonryColumns}
              </label>
              <input
                type="range"
                min="1"
                max="6"
                value={savedTheme.masonryColumns}
                onChange={(e) => updateTheme({ masonryColumns: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* GENERAL SECTION */}
      {activeSection === 'general' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white">
            General Settings
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-2">
              Navigation Style
            </label>
            <select
              value={savedTheme.navigationStyle}
              onChange={(e) => updateTheme({ navigationStyle: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
            >
              <option value="icons-and-text">Icons with Text</option>
              <option value="icons-only">Icons Only</option>
            </select>
          </div>

          <div className="space-y-3 border-t border-slate-200 dark:border-zinc-800 pt-4">
            <h4 className="text-xs font-medium text-slate-900 dark:text-white">
              Visibility Options
            </h4>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={savedTheme.showCollections}
                onChange={(e) => updateTheme({ showCollections: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-slate-700 dark:text-zinc-300">Show Collections</span>
            </label>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Current theme: <span className="font-semibold">{savedTheme.name}</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
              Type: {savedTheme.type}
            </p>
          </div>
        </div>
      )}

      {/* Save Status */}
      <div className="fixed bottom-4 right-4 text-xs text-slate-500 dark:text-zinc-500">
        {isSaving ? '💾 Saving...' : '✓ Saved'}
      </div>
    </div>
  )
}

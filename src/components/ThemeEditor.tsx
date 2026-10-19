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
      <div className="">
        <p className="">Loading theme editor...</p>
      </div>
    )
  }

  const currentThemeId = GALLERY_THEMES.find(
    t => t.label === savedTheme.name && savedTheme.type === 'preset'
  )?.id

  return (
    <div className="">
      {/* Section Navigation */}
      <div className="">
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
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium  transition ${
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
        <div className="">
          <div>
            <h3 className="">
              Select a Gallery Theme
            </h3>
            <p className="">
              Choose from five professionally designed themes. Each provides a unique visual presentation for your gallery.
            </p>
          </div>

          <div className="">
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
                <div className="">
                  <h4 className="">
                    {theme.label}
                  </h4>
                  {currentThemeId === theme.id && (
                    <span className="">
                      ✓ Active
                    </span>
                  )}
                </div>
                <p className="">
                  {theme.description}
                </p>
                <div className="">
                  <div
                    className=""

                  />
                  <div
                    className=""

                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* COVER SECTION */}
      {activeSection === 'cover' && (
        <div className="">
          <h3 className="">
            Cover Settings
          </h3>

          <div>
            <label className="block">
              Cover Style
            </label>
            <select
              value={savedTheme.coverStyle}
              onChange={(e) =>
                updateTheme({ coverStyle: e.target.value })
              }
              className=""
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
              <div className="">
                <div>
                  <label className="block">
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
                    className=""
                  />
                </div>
                <div>
                  <label className="block">
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
                    className=""
                  />
                </div>
              </div>

              <div>
                <label className="block">
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
                  className=""
                />
              </div>
            </>
          )}

          <div className="">
            <label className="">
              <input
                type="checkbox"
                checked={savedTheme.showTitle}
                onChange={(e) => updateTheme({ showTitle: e.target.checked })}
                className=""
              />
              <span className="">Show Gallery Title</span>
            </label>

            <label className="">
              <input
                type="checkbox"
                checked={savedTheme.showDescription}
                onChange={(e) => updateTheme({ showDescription: e.target.checked })}
                className=""
              />
              <span className="">Show Description</span>
            </label>

            <label className="">
              <input
                type="checkbox"
                checked={savedTheme.showLogo}
                onChange={(e) => updateTheme({ showLogo: e.target.checked })}
                className=""
              />
              <span className="">Show Logo</span>
            </label>
          </div>
        </div>
      )}

      {/* TYPOGRAPHY SECTION */}
      {activeSection === 'typography' && (
        <div className="">
          <h3 className="">
            Typography
          </h3>

          <div>
            <label className="block">
              Font Family
            </label>
            <select
              value={savedTheme.fontFamily}
              onChange={(e) => updateTheme({ fontFamily: e.target.value })}
              className=""
            >
              <option value="sans">Sans Serif (Modern)</option>
              <option value="serif">Serif (Editorial)</option>
              <option value="modern">Modern (Geometric)</option>
              <option value="editorial">Editorial (Story)</option>
            </select>
          </div>

          <div className="">
            <p className="">
              Font family changes how your gallery title, descriptions, and labels appear across the client gallery.
            </p>
          </div>
        </div>
      )}

      {/* COLORS SECTION */}
      {activeSection === 'colors' && (
        <div className="">
          <h3 className="">
            Color Scheme
          </h3>

          <div>
            <label className="block">
              Accent Color
            </label>
            <div className="">
              <input
                type="color"
                value={savedTheme.accentColor}
                onChange={(e) => updateTheme({ accentColor: e.target.value })}
                className=""
              />
              <input
                type="text"
                value={savedTheme.accentColor}
                onChange={(e) => updateTheme({ accentColor: e.target.value })}
                className=""
              />
            </div>
          </div>

          <div>
            <label className="block">
              Background Color
            </label>
            <div className="">
              <input
                type="color"
                value={savedTheme.backgroundColor}
                onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                className=""
              />
              <input
                type="text"
                value={savedTheme.backgroundColor}
                onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                className=""
              />
            </div>
          </div>

          <div>
            <label className="block">
              Text Color
            </label>
            <div className="">
              <input
                type="color"
                value={savedTheme.textColor}
                onChange={(e) => updateTheme({ textColor: e.target.value })}
                className=""
              />
              <input
                type="text"
                value={savedTheme.textColor}
                onChange={(e) => updateTheme({ textColor: e.target.value })}
                className=""
              />
            </div>
          </div>

          <div>
            <label className="block">
              Border Radius: {savedTheme.borderRadius}px
            </label>
            <input
              type="range"
              min="0"
              max="24"
              value={savedTheme.borderRadius}
              onChange={(e) => updateTheme({ borderRadius: parseInt(e.target.value) })}
              className=""
            />
          </div>
        </div>
      )}

      {/* GRID SECTION */}
      {activeSection === 'grid' && (
        <div className="">
          <h3 className="">
            Grid & Layout
          </h3>

          <div>
            <label className="block">
              Grid Style
            </label>
            <select
              value={savedTheme.gridStyle}
              onChange={(e) => updateTheme({ gridStyle: e.target.value })}
              className=""
            >
              <option value="masonry">Masonry (Varied Heights)</option>
              <option value="vertical">Vertical (Column Stack)</option>
              <option value="horizontal">Horizontal (Row Stack)</option>
              <option value="uniform">Uniform (Equal Sizes)</option>
            </select>
          </div>

          <div>
            <label className="block">
              Thumbnail Size
            </label>
            <select
              value={savedTheme.thumbnailSize}
              onChange={(e) => updateTheme({ thumbnailSize: e.target.value })}
              className=""
            >
              <option value="small">Small (Compact View)</option>
              <option value="regular">Regular (Balanced)</option>
              <option value="large">Large (Spacious)</option>
            </select>
          </div>

          <div>
            <label className="block">
              Grid Spacing
            </label>
            <select
              value={savedTheme.gridSpacing}
              onChange={(e) => updateTheme({ gridSpacing: e.target.value })}
              className=""
            >
              <option value="tight">Tight (Minimal Gap)</option>
              <option value="regular">Regular (Balanced Gap)</option>
              <option value="wide">Wide (Spacious Gap)</option>
            </select>
          </div>

          <div>
            <label className="block">
              Aspect Ratio
            </label>
            <select
              value={savedTheme.aspectRatio}
              onChange={(e) => updateTheme({ aspectRatio: e.target.value })}
              className=""
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
              <label className="block">
                Masonry Columns: {savedTheme.masonryColumns}
              </label>
              <input
                type="range"
                min="1"
                max="6"
                value={savedTheme.masonryColumns}
                onChange={(e) => updateTheme({ masonryColumns: parseInt(e.target.value) })}
                className=""
              />
            </div>
          )}
        </div>
      )}

      {/* GENERAL SECTION */}
      {activeSection === 'general' && (
        <div className="">
          <h3 className="">
            General Settings
          </h3>

          <div>
            <label className="block">
              Navigation Style
            </label>
            <select
              value={savedTheme.navigationStyle}
              onChange={(e) => updateTheme({ navigationStyle: e.target.value })}
              className=""
            >
              <option value="icons-and-text">Icons with Text</option>
              <option value="icons-only">Icons Only</option>
            </select>
          </div>

          <div className="">
            <h4 className="">
              Visibility Options
            </h4>

            <label className="">
              <input
                type="checkbox"
                checked={savedTheme.showCollections}
                onChange={(e) => updateTheme({ showCollections: e.target.checked })}
                className=""
              />
              <span className="">Show Collections</span>
            </label>
          </div>

          <div className="">
            <p className="">
              Current theme: <span className="">{savedTheme.name}</span>
            </p>
            <p className="">
              Type: {savedTheme.type}
            </p>
          </div>
        </div>
      )}

      {/* Save Status */}
      <div className="">
        {isSaving ? '💾 Saving...' : '✓ Saved'}
      </div>
    </div>
  )
}

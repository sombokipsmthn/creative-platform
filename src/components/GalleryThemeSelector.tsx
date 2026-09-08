'use client'

import { GALLERY_THEMES, type GalleryThemeId } from '@/lib/gallery/themes'

export default function GalleryThemeSelector({
  selectedTheme,
  onThemeChange,
}: {
  selectedTheme?: string
  onThemeChange: (themeId: GalleryThemeId) => void
}) {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <div className="border-b border-slate-100 dark:border-zinc-900 pb-4 mb-6">
        <p className="text-[10px] font-sans uppercase tracking-widest text-purple-600 dark:text-purple-400 font-semibold">
          Gallery Theme
        </p>
        <h2 className="text-xl font-light text-slate-900 dark:text-white mt-1">
          Client Presentation Style
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GALLERY_THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`flex flex-col items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
              selectedTheme === theme.id
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20'
                : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {theme.label}
              </h3>
              {selectedTheme === theme.id && (
                <span className="text-xs font-semibold text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
                  Active
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-400">
              {theme.description}
            </p>

            {/* Color Preview */}
            <div className="w-full flex gap-2 mt-2">
              <div
                className="flex-1 h-8 rounded"
                style={{ backgroundColor: theme.preset.backgroundColor }}
                title="Background"
              />
              <div
                className="flex-1 h-8 rounded"
                style={{ backgroundColor: theme.preset.accentColor }}
                title="Accent"
              />
              <div
                className="flex-1 h-8 rounded border border-slate-300"
                style={{ backgroundColor: theme.preset.textColor }}
                title="Text"
              />
            </div>

            {/* Category Tag */}
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-500 mt-2">
              {theme.category}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

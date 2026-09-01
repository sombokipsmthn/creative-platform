'use client'

import { useState } from 'react'

interface ThemeOption {
  id: string
  name: string
  description: string
  previewImage: string
}

const themes: ThemeOption[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean professional photography delivery',
    previewImage: '/themes/minimal-preview.jpg',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Magazine/editorial-style presentation',
    previewImage: '/themes/editorial-preview.jpg',
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Immersive film/video presentation',
    previewImage: '/themes/cinematic-preview.jpg',
  },
  {
    id: 'mosaic',
    name: 'Mosaic',
    description: 'High-volume visual browsing',
    previewImage: '/themes/mosaic-preview.jpg',
  },
  {
    id: 'story',
    name: 'Story',
    description: 'Turn the gallery into a visual narrative',
    previewImage: '/themes/story-preview.jpg',
  },
]

export default function GalleryThemeSelector({ selectedTheme, onThemeChange }: { selectedTheme: string; onThemeChange: (theme: string) => void }) {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <div className="border-b border-slate-100 dark:border-zinc-900 pb-4 mb-6">
        <p className="text-[10px] font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-semibold">
          Gallery Theme
        </p>
        <h2 className="text-xl font-light text-slate-900 dark:text-white mt-1">
          Client Presentation Style
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${selectedTheme === theme.id ? 'border-purple-600 bg-purple-50 dark:bg-zinc-900/50' : 'border-transparent hover:border-slate-200 dark:hover:border-zinc-800'}`}
          >
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-800">
              <img
                src={theme.previewImage}
                alt={`${theme.name} theme preview`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/themes/placeholder.jpg'
                }}
              />
            </div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">{theme.name}</h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 text-center">{theme.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// src/app/portal/g/[secretToken]/page.tsx
'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { GalleryViewer, type GalleryPhoto, type GalleryCollection } from '@/components/gallery/viewers/wrapper'
import type { GalleryThemeId } from '@/lib/gallery/themes'
import ThemeToggle from '@/components/ThemeToggle'

interface GalleryPageProps {
  params: Promise<{
    secretToken: string
  }>
}

interface SavedTheme {
  id: string
  gallery_id: string
  name: string
  type: string
  layout: string
  accent_color: string
  background_color: string
  text_color: string
  border_radius: number
  show_title: boolean
  show_description: boolean
  show_collections: boolean
  show_logo: boolean
  masonry_columns: number
  aspect_ratio: string
  font_family: string
  cover_style: string
  cover_focal_x: number
  cover_focal_y: number
  cover_overlay_opacity: number
  grid_style: string
  thumbnail_size: string
  grid_spacing: string
  navigation_style: string
}

interface RawPhoto {
  id: string
  filename: string
  display_url: string
  original_url: string
  thumbnail_url: string
  sort_order: number
  is_hidden: boolean
  is_favorite: boolean
  is_selected: boolean
  collection_id?: string | null
  width?: number
  height?: number
  collection_title?: string
}

interface RawCollection {
  id: string
  title: string
  description?: string | null
  sort_order: number
}

export default function ClientGalleryPage({ params }: GalleryPageProps) {
  const resolvedParams = use(params)
  const token = resolvedParams.secretToken

  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [pin, setPin] = useState('')

  const [galleryId, setGalleryId] = useState<string>('')
  const [title, setTitle] = useState<string>('Gallery')
  const [description, setDescription] = useState<string | undefined>()
  const [allowDownloads, setAllowDownloads] = useState(true)
  const [allowFavorites, setAllowFavorites] = useState(true)
  const [allowSelections, setAllowSelections] = useState(true)
  const [allowComments, setAllowComments] = useState(false)
  const [requiredPin, setRequiredPin] = useState<string | null>(null)

  const [themeId, setThemeId] = useState<GalleryThemeId>('minimal')
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [collections, setCollections] = useState<GalleryCollection[]>([])

  // Load gallery data
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/public/galleries/${token}`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          setLoading(false)
          return
        }

        const data = await response.json()
        const gal = data.gallery

        setGalleryId(gal.id)
        setTitle(gal.title || 'Gallery')
        setDescription(gal.description)
        setAllowDownloads(gal.allow_downloads !== false)
        setAllowFavorites(gal.allow_favorites !== false)
        setAllowSelections(gal.allow_selections !== false)
        setRequiredPin(gal.access_pin || null)

        // Determine theme ID from saved theme
        const savedTheme = data.theme as SavedTheme | null
        if (savedTheme && savedTheme.name) {
          // Map saved theme name back to theme ID
          const themeMap: Record<string, GalleryThemeId> = {
            'Minimal': 'minimal',
            'Editorial': 'editorial',
            'Cinematic': 'cinematic',
            'Mosaic': 'mosaic',
            'Story': 'story',
          }
          const id = themeMap[savedTheme.name] || 'minimal'
          setThemeId(id)
        }

        // Transform photos
        if (data.photos && Array.isArray(data.photos)) {
          const transformedPhotos: GalleryPhoto[] = (data.photos as RawPhoto[]).map(p => ({
            id: p.id,
            filename: p.filename,
            displayUrl: p.display_url,
            thumbnailUrl: p.thumbnail_url,
            width: p.width,
            height: p.height,
            sortOrder: p.sort_order,
            isHidden: p.is_hidden,
            isFavorite: p.is_favorite,
            isSelected: p.is_selected,
            downloadCount: 0,
          }))
          setPhotos(transformedPhotos)
        }

        // Transform collections
        if (data.collections && Array.isArray(data.collections)) {
          const transformedCollections: GalleryCollection[] = (data.collections as RawCollection[]).map(c => ({
            id: c.id,
            title: c.title,
            description: c.description || undefined,
            photos: [],
          }))
          setCollections(transformedCollections)
        }

        // Auto-verify if no PIN is required
        if (!gal.access_pin) {
          setVerified(true)
        }
      } catch (error) {
        console.error('Failed to load gallery:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGallery()
  }, [token])

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!requiredPin || pin.trim() === requiredPin.trim()) {
      setVerified(true)
      setPinError(false)
    } else {
      setPinError(true)
    }
  }

  const handlePhotoFavorite = (photoId: string, isFavorite: boolean) => {
    // Persist to API
    fetch(`/api/public/galleries/${token}/photos`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId, isFavorite }),
    }).catch(err => console.error('Failed to update favorite:', err))
  }

  const handlePhotoSelect = (photoId: string) => {
    // Toggle selection state
    setPhotos(prev =>
      prev.map(p =>
        p.id === photoId
          ? { ...p, isSelected: !p.isSelected }
          : p
      )
    )
    // Persist to API
    const photo = photos.find(p => p.id === photoId)
    if (photo) {
      fetch(`/api/public/galleries/${token}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, isSelected: !photo.isSelected }),
      }).catch(err => console.error('Failed to update selection:', err))
    }
  }

  const handlePhotoDownload = (photoId: string) => {
    // Handle download
    const photo = photos.find(p => p.id === photoId)
    if (photo) {
      window.open(photo.displayUrl, '_blank')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b]">
        <p className="text-xs font-sans uppercase tracking-widest text-slate-500">
          Loading Gallery...
        </p>
      </div>
    )
  }

  // PIN verification state
  if (!verified) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b] px-6">
        <form
          onSubmit={handleVerifyPin}
          className="max-w-md w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-2xl font-light text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="text-xs font-sans uppercase tracking-widest text-purple-500 mt-2">
              Private Client Gallery
            </p>
          </div>

          <p className="text-xs text-slate-500 font-sans">
            Enter the PIN provided by your photographer to access this private gallery.
          </p>

          <input
            value={pin}
            onChange={(e) => {
              setPin(e.target.value)
              setPinError(false)
            }}
            maxLength={6}
            placeholder="PIN"
            type="password"
            autoFocus
            className="w-full text-center text-3xl tracking-[0.5em] rounded-2xl bg-slate-100 dark:bg-zinc-900 p-4 font-sans outline-none border border-slate-200 dark:border-zinc-800 focus:border-purple-600"
          />

          {pinError && (
            <p className="text-xs font-sans text-red-500">
              Incorrect PIN. Please try again.
            </p>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-purple-600 text-white text-xs font-sans uppercase tracking-widest hover:bg-purple-700 transition font-bold"
          >
            Unlock Gallery
          </button>
        </form>
      </main>
    )
  }

  // Render gallery with theme
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/" className="font-bold tracking-widest text-sm uppercase">
            KIPSMTHN<span className="text-purple-500">.</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Gallery Viewer */}
      <GalleryViewer
        id={galleryId}
        title={title}
        description={description}
        themeId={themeId}
        photos={photos}
        collections={collections}
        allowDownloads={allowDownloads}
        allowFavorites={allowFavorites}
        allowSelections={allowSelections}
        allowComments={allowComments}
        isClient={true}
        onPhotoFavorite={handlePhotoFavorite}
        onPhotoSelect={handlePhotoSelect}
        onPhotoDownload={handlePhotoDownload}
      />
    </div>
  )
}

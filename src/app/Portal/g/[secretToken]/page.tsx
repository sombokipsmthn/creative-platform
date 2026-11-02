// src/app/portal/g/[secretToken]/page.tsx
'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Lock } from "@phosphor-icons/react"
import { GalleryViewer, type GalleryPhoto, type GalleryCollection, type GalleryViewerProps } from '@/components/gallery/viewers/wrapper'
import { isValidThemeId, type GalleryThemePreset } from '@/lib/gallery/themes'
import type { GalleryThemeId } from '@/lib/gallery/themes'
import ThemeToggle from '@/components/ThemeToggle'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDesignSystem } from '@/components/ui/DesignSystemProvider';

interface GalleryPageProps {
  params: Promise<{
    secretToken: string
  }>
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
  fontFamily: string
  coverStyle: string
  coverComposition: string
  coverFocalX: number
  coverFocalY: number
  coverOverlayOpacity: number
  gridStyle: string
  thumbnailSize: string
  gridSpacing: string
  navigationStyle: string
  imageLayout: string
  imageOrientation: string
  imageSizing: string
  galleryWidth: string
  coverImageId: string | null
  studioName: string | null
  logoUrl: string | null
  logoLightUrl: string | null
  logoDarkUrl: string | null
  logoTransparentUrl: string | null
  logoSize: string | null
  brandColor: string | null
  coverBrandingVisible: boolean
  navBrandingVisible: boolean
}

interface RawPhoto {
  id: string
  filename: string
  display_url: string
  original_url: string
  thumbnail_url: string
  mime_type?: string | null
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

  const { theme } = useDesignSystem()

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
  const [requiresPin, setRequiresPin] = useState(false)

  const [themeId, setThemeId] = useState<GalleryThemeId>('minimal')
  const [themePreset, setThemePreset] = useState<GalleryViewerProps['themePreset']>(undefined)

  // Apply design system theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [theme])
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
        setRequiresPin(Boolean(data.requiresPin))

        // Determine theme ID from saved theme
        const savedTheme = data.theme as (SavedTheme & { branding?: typeof import("@/db/schema").creatorBranding.$inferSelect }) | null
        if (savedTheme) {
          const branding = savedTheme.branding
          setThemePreset({
            layout: savedTheme.layout as GalleryThemePreset['layout'],
            aspectRatio: savedTheme.aspectRatio as GalleryThemePreset['aspectRatio'],
            masonryColumns: Number(savedTheme.masonryColumns ?? 4),
            showTitle: Boolean(savedTheme.showTitle),
            showDescription: Boolean(savedTheme.showDescription),
            showCollections: Boolean(savedTheme.showCollections),
            showLogo: Boolean(savedTheme.showLogo),
            accentColor: savedTheme.accentColor,
            backgroundColor: savedTheme.backgroundColor,
            textColor: savedTheme.textColor,
            borderRadius: Number(savedTheme.borderRadius ?? 0),
            fontFamily: savedTheme.fontFamily as GalleryThemePreset['fontFamily'],
            coverStyle: savedTheme.coverStyle as GalleryThemePreset['coverStyle'],
            coverComposition: savedTheme.coverComposition as GalleryThemePreset['coverComposition'],
            coverFocalX: Number(savedTheme.coverFocalX ?? 50),
            coverFocalY: Number(savedTheme.coverFocalY ?? 50),
            coverOverlayOpacity: Number(savedTheme.coverOverlayOpacity ?? 25),
            gridStyle: savedTheme.gridStyle as GalleryThemePreset['gridStyle'],
            thumbnailSize: savedTheme.thumbnailSize as GalleryThemePreset['thumbnailSize'],
            gridSpacing: savedTheme.gridSpacing as GalleryThemePreset['gridSpacing'],
            navigationStyle: savedTheme.navigationStyle as GalleryThemePreset['navigationStyle'],
            imageLayout: savedTheme.imageLayout as GalleryThemePreset['imageLayout'],
            imageOrientation: savedTheme.imageOrientation as GalleryThemePreset['imageOrientation'],
            imageSizing: savedTheme.imageSizing as GalleryThemePreset['imageSizing'],
            galleryWidth: savedTheme.galleryWidth as GalleryThemePreset['galleryWidth'],
            coverImageId: savedTheme.coverImageId ?? null,
            studioName: branding?.studioName ?? savedTheme.studioName ?? undefined,
            logoUrl: branding?.logoLightUrl ?? savedTheme.logoUrl ?? undefined,
            logoLightUrl: branding?.logoLightUrl ?? savedTheme.logoLightUrl ?? undefined,
            logoDarkUrl: branding?.logoDarkUrl ?? savedTheme.logoDarkUrl ?? undefined,
            logoTransparentUrl: branding?.logoTransparentUrl ?? savedTheme.logoTransparentUrl ?? undefined,
            logoSize: branding?.logoSize ?? savedTheme.logoSize ?? undefined,
            brandColor: branding?.brandColor ?? savedTheme.brandColor ?? undefined,
            coverBrandingVisible: branding?.coverBrandingVisible ?? savedTheme.coverBrandingVisible ?? true,
            navBrandingVisible: branding?.navBrandingVisible ?? savedTheme.navBrandingVisible ?? true,
          })
          // Resolve theme ID robustly:
          // 1. Check if `type` stores a valid preset id (preset themes set type = preset id)
          // 2. Check if the lowercased name is a valid theme id
          // 3. Fall back to a label→id map for backward compat
          // 4. Default to 'minimal'
          const themeMap: Record<string, GalleryThemeId> = {
            'Minimal': 'minimal',
            'Editorial': 'editorial',
            'Cinematic': 'cinematic',
            'Mosaic': 'mosaic',
            'Story': 'story',
          }
          const resolvedId: GalleryThemeId =
            (isValidThemeId(savedTheme.type) && savedTheme.type) ||
            (isValidThemeId(savedTheme.name?.toLowerCase()) && (savedTheme.name.toLowerCase() as GalleryThemeId)) ||
            themeMap[savedTheme.name] ||
            'minimal'
          setThemeId(resolvedId)
        }

        // Transform photos
        if (data.photos && Array.isArray(data.photos)) {
          const transformedPhotos: GalleryPhoto[] = (data.photos as Array<RawPhoto & Record<string, unknown>>).map(p => ({
            id: p.id,
            filename: p.filename,
            displayUrl: String(p.displayUrl ?? p.display_url ?? ''),
            thumbnailUrl: String(p.thumbnailUrl ?? p.thumbnail_url ?? ''),
            mimeType: (p.mimeType ?? p.mime_type ?? null) as string | null,
            width: Number(p.width) || undefined,
            height: Number(p.height) || undefined,
            sortOrder: Number(p.sortOrder ?? p.sort_order ?? 0),
            isHidden: Boolean(p.isHidden ?? p.is_hidden),
            isFavorite: Boolean(p.isFavorite ?? p.is_favorite),
            isSelected: Boolean(p.isSelected ?? p.is_selected),
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
        if (!data.requiresPin) {
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

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin.trim()) {
      setPinError(true)
      return
    }

    try {
      const response = await fetch(`/api/public/galleries/${token}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      })

      if (!response.ok) {
        setPinError(true)
        return
      }

      setPinError(false)
      setVerified(true)
      window.location.reload()
    } catch (error) {
      console.error('Failed to verify gallery PIN:', error)
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
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary dark:text-primary mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-2xl font-light text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="text-xs font-sans uppercase tracking-widest text-primary mt-2">
              Private Client Gallery
            </p>
          </div>

          <p className="text-xs text-slate-500 font-sans">
            Enter the PIN provided by your photographer to access this private gallery.
          </p>

          <Input value={pin} onChange={(e) => { setPin(e.target.value); setPinError(false) }} maxLength={6} placeholder="PIN" type="password" autoFocus className="w-full text-center text-3xl tracking-[0.5em]" />

          {pinError && (
            <p className="text-xs font-sans text-red-500">
              Incorrect PIN. Please try again.
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full py-4 text-xs uppercase tracking-widest">Unlock Gallery</Button>
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
            KIPSMTHN<span className="text-primary">.</span>
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
        themePreset={themePreset}
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

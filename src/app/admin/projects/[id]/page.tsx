'use client'

import { useEffect, useState } from 'react'
import { Heart, ImageIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import ProjectSidebar from '@/components/ProjectSidebar'
import { transformGalleryResponse } from '@/lib/gallery/transform'
import ThemeEditor from '@/components/ThemeEditor'

interface GalleryCollection {
  id: string
  galleryId: string
  title: string
  description: string | null
  sortOrder: number
  photo_count?: number
  createdAt: string
}

interface GalleryPhoto {
  id: string
  galleryId: string
  collectionId: string | null
  filename: string
  originalUrl: string
  displayUrl: string
  thumbnailUrl: string
  sortOrder: number
  isHidden: boolean
  isFavorite: boolean
  isSelected: boolean
  createdAt: string
  updatedAt: string
}

interface GalleryData {
  id: string
  title: string
  description?: string | null
  category?: string | null
  slug: string
  status: string
  allowDownloads?: boolean
  allowFavorites?: boolean
  allowSelections?: boolean
  photos: GalleryPhoto[]
  collections: GalleryCollection[]
  [key: string]: any
}

const panelClass = 'os-card p-5 md:p-6'
const inputClass = 'mt-2 w-full rounded-[0.7rem] border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_12%,transparent)]'

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<string>('photos')
  const [gallery, setGallery] = useState<GalleryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/galleries/${id}`)
        if (!response.ok) throw new Error('Failed to load gallery')
        const rawData = await response.json()
        const transformed = transformGalleryResponse(rawData)
        setGallery({
          ...(transformed.gallery || {}),
          photos: Array.isArray(transformed.photos) ? transformed.photos : [],
          collections: Array.isArray(transformed.collections) ? transformed.collections : [],
          approval: transformed.approval || null,
          presets: Array.isArray(transformed.presets) ? transformed.presets : [],
          watermark: transformed.watermark || null,
        } as unknown as GalleryData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load gallery')
      } finally {
        setLoading(false)
      }
    }

    fetchGallery()
  }, [id])

  const handleTabChange = (tab: string) => setActiveTab(tab)

  if (loading) {
    return (
      <div className="os-page flex min-h-screen flex-col text-[var(--text-primary)] md:flex-row">
        <ProjectSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="os-shell">
            <div className={panelClass}>
              <div className="h-3 w-20 animate-pulse rounded-full bg-[var(--bg-soft)]" />
              <div className="mt-4 h-7 w-64 animate-pulse rounded-lg bg-[var(--bg-soft)]" />
              <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded-lg bg-[var(--bg-soft)]" />
              <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="aspect-square animate-pulse rounded-[0.8rem] bg-[var(--bg-soft)]" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="os-page flex min-h-screen flex-col text-[var(--text-primary)] md:flex-row">
        <ProjectSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="os-shell">
            <div className="os-card border-[color-mix(in_srgb,var(--danger)_35%,var(--border-subtle))] bg-[color-mix(in_srgb,var(--danger)_5%,var(--bg-card))] p-5 md:p-6">
              <p className="os-eyebrow text-[var(--danger)]">Project Tools</p>
              <h1 className="os-title">Unable to load gallery</h1>
              <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!gallery) {
    return (
      <div className="os-page flex min-h-screen flex-col text-[var(--text-primary)] md:flex-row">
        <ProjectSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="os-shell">
            <div className={panelClass}>
              <p className="os-eyebrow">Project Tools</p>
              <h1 className="os-title">No gallery data available</h1>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="os-page flex min-h-screen flex-col text-[var(--text-primary)] md:h-screen md:flex-row">
      <ProjectSidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="min-w-0 flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="os-shell">
          <header className="mb-6 flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="os-eyebrow">Project Tools</p>
              <h1 className="os-title truncate">{gallery.title}</h1>
              <p className="os-subtitle">
                {gallery.category || 'Client gallery'}{gallery.slug ? ` · /${gallery.slug}` : ''}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="os-pill">
                <span className="os-pill-dot text-[var(--success)]" />
                {gallery.status || 'draft'}
              </span>
              <span className="os-pill">{gallery.photos?.length || 0} photos</span>
            </div>
          </header>

          {activeTab === 'photos' && (
            <section className="os-reveal space-y-5">
              <div className={panelClass}>
                <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="os-eyebrow">Content</p>
                    <h2 className="os-title text-[1.35rem] md:text-[1.5rem]">Photos & Collections</h2>
                    <p className="os-subtitle">Organize the images that clients will see in their gallery.</p>
                  </div>
                  <span className="os-pill">{gallery.collections?.length || 0} collections</span>
                </div>

                {(gallery.photos?.length || 0) > 0 ? (
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {gallery.photos?.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative aspect-square overflow-hidden rounded-[0.8rem] border border-[var(--border-subtle)] bg-[var(--bg-soft)] shadow-[var(--shadow-card)]"
                      >
                        <img
                          src={photo.thumbnailUrl || photo.displayUrl || photo.originalUrl}
                          alt={photo.filename}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder.jpg'
                          }}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 pb-2.5 pt-8">
                          <p className="truncate text-[10px] font-medium text-white">
                            {photo.filename.split('.').slice(0, -1).join('.')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-[0.8rem] border border-dashed border-[var(--border-strong)] bg-[var(--bg-soft)] px-6 py-12 text-center">
                    <span className="os-icon-box">
                      <ImageIcon className="h-4 w-4" />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">No photos yet</h3>
                    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[var(--text-muted)]">
                      Add images to start building this client gallery.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'details' && (
            <section className="os-reveal mx-auto max-w-3xl">
              <div className={panelClass}>
                <p className="os-eyebrow">Metadata</p>
                <h2 className="os-title">Gallery Details</h2>
                <p className="os-subtitle">Edit the basic information clients associate with this gallery.</p>

                <div className="mt-7 space-y-5">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    Title
                    <input type="text" value={gallery.title || ''} readOnly className={inputClass} />
                  </label>

                  <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    Description
                    <textarea
                      defaultValue={gallery.description || ''}
                      placeholder="Gallery description..."
                      rows={4}
                      className={`${inputClass} resize-none`}
                    />
                  </label>

                  <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    Category
                    <select defaultValue={gallery.category || ''} className={inputClass}>
                      <option value="">Select category...</option>
                      <option value="portrait">Portrait</option>
                      <option value="wedding">Wedding</option>
                      <option value="commercial">Commercial</option>
                      <option value="product">Product</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'themes' && (
            <section className="os-reveal mx-auto max-w-4xl space-y-5">
              <div>
                <p className="os-eyebrow">Client Experience</p>
                <h2 className="os-title">Theme & Design</h2>
                <p className="os-subtitle">Customize how your gallery looks to clients.</p>
              </div>
              <ThemeEditor galleryId={id} />
            </section>
          )}

          {activeTab === 'cover' && (
            <section className="os-reveal mx-auto max-w-4xl">
              <div className={panelClass}>
                <p className="os-eyebrow">Presentation</p>
                <h2 className="os-title">Gallery Cover</h2>
                <p className="os-subtitle">Choose the image that introduces this gallery to clients.</p>

                {(gallery.photos?.length || 0) > 0 ? (
                  <div className="mt-6 overflow-hidden rounded-[0.9rem] border border-[var(--border-subtle)] bg-[var(--bg-soft)] shadow-[var(--shadow-card)]">
                    <div className="relative aspect-[16/9]">
                      <img
                        src={gallery.photos?.[0]?.displayUrl || gallery.photos?.[0]?.originalUrl}
                        alt="Gallery Cover"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder.jpg'
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-[0.8rem] border border-dashed border-[var(--border-strong)] bg-[var(--bg-soft)] px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                    Add a photo to use it as the gallery cover.
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="os-reveal mx-auto max-w-3xl">
              <div className={panelClass}>
                <p className="os-eyebrow">Access & Security</p>
                <h2 className="os-title">Privacy, Downloads & Proofing</h2>
                <p className="os-subtitle">Control what clients can do inside this gallery.</p>

                <div className="mt-7 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Client Capabilities</h3>
                    <div className="mt-3 divide-y divide-[var(--border-subtle)] rounded-[0.8rem] border border-[var(--border-subtle)] bg-[var(--bg-soft)]">
                      <label className="flex min-h-12 cursor-pointer items-center gap-3 px-4 text-sm text-[var(--text-secondary)]">
                        <input type="checkbox" defaultChecked={gallery.allowDownloads !== false} className="h-4 w-4 accent-[var(--accent)]" />
                        Allow Downloads
                      </label>
                      <label className="flex min-h-12 cursor-pointer items-center gap-3 px-4 text-sm text-[var(--text-secondary)]">
                        <input type="checkbox" defaultChecked={gallery.allowFavorites !== false} className="h-4 w-4 accent-[var(--accent)]" />
                        Allow Favorites
                      </label>
                      <label className="flex min-h-12 cursor-pointer items-center gap-3 px-4 text-sm text-[var(--text-secondary)]">
                        <input type="checkbox" defaultChecked={gallery.allowSelections !== false} className="h-4 w-4 accent-[var(--accent)]" />
                        Allow Selections
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-[var(--border-subtle)] pt-6">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Gallery Status</h3>
                    <select defaultValue={gallery.status || 'draft'} className={inputClass}>
                      <option value="draft">Draft (Private)</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'activity' && (
            <section className="os-reveal mx-auto max-w-4xl">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="os-card os-card-interactive p-5">
                  <div className="flex items-center gap-2 text-[var(--danger)]">
                    <span className="os-icon-box text-[var(--danger)]">
                      <Heart className="h-4 w-4 fill-current" />
                    </span>
                    <p className="os-metric-label">Client Favorites</p>
                  </div>
                  <p className="os-metric-value">{(gallery.photos || []).filter((p) => p.isFavorite).length}</p>
                  <p className="os-metric-detail">Images currently marked as favorites by the client.</p>
                </div>

                <div className="os-card os-card-interactive p-5">
                  <p className="os-metric-label">Photos</p>
                  <p className="os-metric-value">{gallery.photos?.length || 0}</p>
                  <p className="os-metric-detail">Total images currently associated with this gallery.</p>
                </div>

                <div className="os-card os-card-interactive p-5">
                  <p className="os-metric-label">Collections</p>
                  <p className="os-metric-value">{gallery.collections?.length || 0}</p>
                  <p className="os-metric-detail">Sets available for organizing the client delivery.</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

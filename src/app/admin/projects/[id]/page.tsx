'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { useParams } from 'next/navigation'
import ProjectSidebar from '@/components/ProjectSidebar'
import { transformGalleryResponse } from '@/lib/gallery/transform'
import ThemeEditor from '@/components/ThemeEditor'

/* ========================================================= 
   TYPES
   ========================================================= */

interface GalleryCollection {
  id: string;
  galleryId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  photo_count?: number;
  createdAt: string;
}

interface GalleryPhoto {
  id: string;
  galleryId: string;
  collectionId: string | null;
  filename: string;
  originalUrl: string;
  displayUrl: string;
  thumbnailUrl: string;
  sortOrder: number;
  isHidden: boolean;
  isFavorite: boolean;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GalleryData {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  slug: string;
  status: string;
  allowDownloads?: boolean;
  allowFavorites?: boolean;
  allowSelections?: boolean;
  photos: GalleryPhoto[];
  collections: GalleryCollection[];
  [key: string]: any;
}

/* ========================================================= 
   PAGE
   ========================================================= */

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>('photos')
  const [gallery, setGallery] = useState<GalleryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/galleries/${id}`)
        if (!response.ok) {
          throw new Error('Failed to load gallery')
        }
        const rawData = await response.json()
        const transformed = transformGalleryResponse(rawData)
        setGallery(transformed.gallery as any)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load gallery')
      } finally {
        setLoading(false)
      }
    }
    fetchGallery()
  }, [id])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100">
        <ProjectSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm mx-auto max-w-4xl">
            <p className="text-sm text-slate-500 dark:text-zinc-500">Loading gallery...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100">
        <ProjectSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm mx-auto max-w-4xl">
            <p className="text-sm text-red-500 dark:text-red-300">Error: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!gallery) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100">
        <ProjectSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm mx-auto max-w-4xl">
            <p className="text-sm text-slate-500 dark:text-zinc-500">No gallery data available.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100">
      <ProjectSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-light text-slate-900 dark:text-white">Photos & Collections</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                {gallery.photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    <img
                      src={photo.thumbnailUrl || photo.displayUrl || photo.originalUrl}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder.jpg'
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-xs">
                      {photo.filename.split('.').slice(0, -1).join('.')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
              <div className="border-b border-slate-100 dark:border-zinc-900 pb-4 mb-6">
                <h2 className="text-2xl font-light text-slate-900 dark:text-white">Gallery Details</h2>
                <p className="text-sm text-slate-500 dark:text-zinc-500 mt-2">Edit gallery title, description, and metadata</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={gallery.title || ''}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Description</label>
                  <textarea
                    defaultValue={gallery.description || ''}
                    placeholder="Gallery description..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm outline-none focus:border-purple-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Category</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm outline-none focus:border-purple-500">
                    <option value="">Select category...</option>
                    <option value="portrait">Portrait</option>
                    <option value="wedding">Wedding</option>
                    <option value="commercial">Commercial</option>
                    <option value="product">Product</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'themes' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h2 className="text-2xl font-light text-slate-900 dark:text-white mb-2">Theme & Design</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-500">Customize how your gallery looks to clients</p>
            </div>
            <ThemeEditor galleryId={id} />
          </div>
        )}
        
        {activeTab === 'cover' && (
          <div className="space-y-6">
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl font-light text-slate-900 dark:text-white">Gallery Cover</h3>
                {gallery.photos.length > 0 && (
                  <div className="relative aspect-video mt-4 rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    <img
                      src={gallery.photos[0].displayUrl || gallery.photos[0].originalUrl}
                      alt="Gallery Cover"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder.jpg'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
              <div className="border-b border-slate-100 dark:border-zinc-900 pb-4 mb-6">
                <p className="text-[10px] font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-semibold">
                  Access & Security
                </p>
                <h2 className="text-2xl font-light text-slate-900 dark:text-white mt-1">
                  Privacy, Downloads & Proofing Limits
                </h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">Client Capabilities</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={gallery.allowDownloads !== false}
                        className="w-4 h-4 rounded border-slate-300 text-purple-600 cursor-pointer"
                      />
                      <span className="text-sm text-slate-700 dark:text-zinc-300">Allow Downloads</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={gallery.allowFavorites !== false}
                        className="w-4 h-4 rounded border-slate-300 text-purple-600 cursor-pointer"
                      />
                      <span className="text-sm text-slate-700 dark:text-zinc-300">Allow Favorites</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={gallery.allowSelections !== false}
                        className="w-4 h-4 rounded border-slate-300 text-purple-600 cursor-pointer"
                      />
                      <span className="text-sm text-slate-700 dark:text-zinc-300">Allow Selections</span>
                    </label>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 dark:border-zinc-900">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Gallery Status</h3>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm outline-none focus:border-purple-500">
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-1 shadow-sm">
                  <p className="text-xs font-mono uppercase text-red-500 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    Client Favorites
                  </p>
                  <p className="text-3xl font-light text-slate-900 dark:text-white">
                    {gallery.photos.filter((p) => p.isFavorite).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

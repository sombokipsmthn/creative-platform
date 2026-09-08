'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
  id: string
  event_type: string
  client_name?: string
  metadata?: Record<string, unknown>
  photo_filename?: string
  collection_title?: string
  created_at: string
}

interface GalleryActivityTabProps {
  galleryId: string
}

export default function GalleryActivityTab({ galleryId }: GalleryActivityTabProps) {
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadActivity = async () => {
      try {
        if (!isMounted) return
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/galleries/${galleryId}/activity`)
        if (!isMounted) return
        if (response.ok) {
          const data = await response.json() as { activity?: ActivityItem[] }
          if (isMounted) setActivity(data.activity || [])
        } else {
          if (isMounted) throw new Error('Failed to load activity')
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to load activity')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadActivity()
    const interval = setInterval(loadActivity, 30000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [galleryId])

  const getEventLabel = (eventType: string): string => {
    const labels: Record<string, string> = {
      'gallery_viewed': 'Viewed gallery',
      'collection_opened': 'Opened collection',
      'photo_viewed': 'Viewed photo',
      'favorite_added': 'Favorited',
      'favorite_removed': 'Unfavorited',
      'selection_added': 'Selected',
      'selection_removed': 'Deselected',
      'comment_added': 'Added comment',
      'download_started': 'Started download',
      'download_completed': 'Downloaded',
      'gallery_shared': 'Shared gallery',
    }
    return labels[eventType] || eventType
  }

  if (loading && activity.length === 0) {
    return (
      <div className="ui-card p-6">
        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading activity...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="ui-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Client Activity</h2>
          <button
            disabled={loading}
            className="gallery-btn gallery-btn-secondary gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {activity.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[var(--color-text-muted)]">No activity yet</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Activity will appear here when clients access your gallery
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activity.map((item) => (
              <div
                key={item.id}
                className="p-4 border border-[var(--color-border-subtle)] rounded-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium">
                      {getEventLabel(item.event_type)}
                    </p>
                    <div className="mt-1 space-y-1">
                      {item.client_name && (
                        <p className="text-sm text-[var(--color-text-muted)]">
                          Client: <span className="font-medium">{item.client_name}</span>
                        </p>
                      )}
                      {item.photo_filename && (
                        <p className="text-sm text-[var(--color-text-muted)]">
                          Photo: <span className="font-medium">{item.photo_filename}</span>
                        </p>
                      )}
                      {item.collection_title && (
                        <p className="text-sm text-[var(--color-text-muted)]">
                          Collection: <span className="font-medium">{item.collection_title}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

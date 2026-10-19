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
      <div className="ui-card">
        <div className="">
          <Loader2 className="" />
          <span>Loading activity...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      <div className="ui-card">
        <div className="">
          <h2 className="">Client Activity</h2>
          <button
            disabled={loading}
            className="gallery-btn gallery-btn-secondary"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="">
            <AlertCircle className="" />
            <p className="">{error}</p>
          </div>
        )}

        {activity.length === 0 ? (
          <div className="">
            <p className="">No activity yet</p>
            <p className="">
              Activity will appear here when clients access your gallery
            </p>
          </div>
        ) : (
          <div className="">
            {activity.map((item) => (
              <div
                key={item.id}
                className=""
              >
                <div className="">
                  <div className="">
                    <p className="">
                      {getEventLabel(item.event_type)}
                    </p>
                    <div className="">
                      {item.client_name && (
                        <p className="">
                          Client: <span className="">{item.client_name}</span>
                        </p>
                      )}
                      {item.photo_filename && (
                        <p className="">
                          Photo: <span className="">{item.photo_filename}</span>
                        </p>
                      )}
                      {item.collection_title && (
                        <p className="">
                          Collection: <span className="">{item.collection_title}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="">
                    <p className="">
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

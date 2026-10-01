'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Loader2, RefreshCw, Trash2, Upload, X } from 'lucide-react'
import { upload } from '@vercel/blob/client'

import { Button } from '@/components/ui/Button'

interface UploadItem {
  id: string
  file: File
  previewUrl: string
  status: 'queued' | 'uploading' | 'uploaded' | 'failed'
  progress: number
  error: string | null
}

interface PhotoUploaderProps {
  galleryId: string
  onUploadComplete: () => void | Promise<void>
}

const MAX_FILE_SIZE = 100 * 1024 * 1024

const ACCEPTED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
  'video/x-flv',
  'video/x-ms-wmv',
])

function createUploadId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return Math.random().toString(36).slice(2, 11)
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Upload failed. Please try again.'
}

export default function PhotoUploader({
  galleryId,
  onUploadComplete,
}: PhotoUploaderProps) {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)
  const [validationError, setValidationError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  /*
   * Keep refs alongside React state so the asynchronous upload queue
   * always sees the latest items instead of a stale render snapshot.
   */
  const uploadItemsRef = useRef<UploadItem[]>([])
  const isUploadingRef = useRef(false)
  const processedSinceLastCompleteRef = useRef(false)

  const updateUploadItems = useCallback(
    (updater: (items: UploadItem[]) => UploadItem[]) => {
      setUploadItems((current) => {
        const next = updater(current)
        uploadItemsRef.current = next
        return next
      })
    },
    [],
  )

  const processUploadQueue = useCallback(async () => {
    if (isUploadingRef.current) {
      return
    }

    isUploadingRef.current = true
    setIsUploading(true)
    processedSinceLastCompleteRef.current = false

    try {
      while (true) {
        /*
         * Always read from the ref so files added after the component
         * rendered are included in the queue.
         */
        const nextItem = uploadItemsRef.current.find(
          (item) => item.status === 'queued',
        )

        if (!nextItem) {
          break
        }

        processedSinceLastCompleteRef.current = true

        updateUploadItems((items) =>
          items.map((item) =>
            item.id === nextItem.id
              ? {
                  ...item,
                  status: 'uploading',
                  progress: 0,
                  error: null,
                }
              : item,
          ),
        )

        try {
          await upload(
            `galleries/${galleryId}/${nextItem.file.name}`,
            nextItem.file,
            {
              access: 'public',
              handleUploadUrl: '/api/galleries/upload',
              clientPayload: JSON.stringify({
                galleryId,
              }),

              /*
               * Vercel Blob provides real upload progress.
               */
              onUploadProgress: (event) => {
                const percentage = Math.max(
                  0,
                  Math.min(100, Math.round(event.percentage)),
                )

                updateUploadItems((items) =>
                  items.map((item) =>
                    item.id === nextItem.id
                      ? {
                          ...item,
                          progress: percentage,
                        }
                      : item,
                  ),
                )
              },
            },
          )

          updateUploadItems((items) =>
            items.map((item) =>
              item.id === nextItem.id
                ? {
                    ...item,
                    status: 'uploaded',
                    progress: 100,
                    error: null,
                  }
                : item,
            ),
          )
        } catch (error) {
          updateUploadItems((items) =>
            items.map((item) =>
              item.id === nextItem.id
                ? {
                    ...item,
                    status: 'failed',
                    progress: 0,
                    error: getErrorMessage(error),
                  }
                : item,
            ),
          )
        }
      }
    } finally {
      const items = uploadItemsRef.current

      const finishedCount = items.filter(
        (item) =>
          item.status === 'uploaded' ||
          item.status === 'failed',
      ).length

      const queuedCount = items.filter(
        (item) => item.status === 'queued',
      ).length

      const totalCount = items.length

      setOverallProgress(
        totalCount > 0
          ? (finishedCount / totalCount) * 100
          : 0,
      )

      isUploadingRef.current = false
      setIsUploading(false)

      /*
       * Refresh the gallery only after the complete queue has finished.
       */
      if (
        processedSinceLastCompleteRef.current &&
        queuedCount === 0
      ) {
        await onUploadComplete()
      }
    }
  }, [
    galleryId,
    onUploadComplete,
    updateUploadItems,
  ])

  /*
   * Start the queue only after React has actually received the new files.
   *
   * This fixes the original race where addFiles() called
   * processUploadQueue() before setUploadItems() had updated state.
   */
  useEffect(() => {
    uploadItemsRef.current = uploadItems

    const hasQueuedItems = uploadItems.some(
      (item) => item.status === 'queued',
    )

    if (
      hasQueuedItems &&
      !isUploadingRef.current
    ) {
      void processUploadQueue()
    }
  }, [
    uploadItems,
    processUploadQueue,
  ])

  /*
   * Clean up browser preview URLs.
   */
  useEffect(() => {
    return () => {
      uploadItemsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl)
      })
    }
  }, [])

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const candidates = Array.from(files)

      if (candidates.length === 0) {
        return
      }

      setValidationError(null)

      const accepted: UploadItem[] = []
      const rejected: string[] = []

      for (const file of candidates) {
        if (!ACCEPTED_TYPES.has(file.type)) {
          rejected.push(
            `${file.name}: unsupported file type`,
          )
          continue
        }

        if (file.size > MAX_FILE_SIZE) {
          rejected.push(
            `${file.name}: exceeds the 100MB limit`,
          )
          continue
        }

        accepted.push({
          id: createUploadId(),
          file,
          previewUrl: URL.createObjectURL(file),
          status: 'queued',
          progress: 0,
          error: null,
        })
      }

      if (rejected.length > 0) {
        setValidationError(
          rejected.join(' · '),
        )
      }

      if (accepted.length > 0) {
        const next = [
          ...uploadItemsRef.current,
          ...accepted,
        ]

        uploadItemsRef.current = next
        setUploadItems(next)
      }
    },
    [],
  )

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files) {
      addFiles(event.target.files)
    }

    /*
     * Reset the input so selecting the same file again
     * still triggers onChange.
     */
    event.target.value = ''
  }

  const removeItem = (id: string) => {
    const item = uploadItemsRef.current.find(
      (candidate) => candidate.id === id,
    )

    if (item) {
      URL.revokeObjectURL(item.previewUrl)
    }

    const next = uploadItemsRef.current.filter(
      (candidate) => candidate.id !== id,
    )

    uploadItemsRef.current = next
    setUploadItems(next)
  }

  const retryItem = (id: string) => {
    updateUploadItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'queued',
              progress: 0,
              error: null,
            }
          : item,
      ),
    )
  }

  const retryFailed = () => {
    updateUploadItems((items) =>
      items.map((item) =>
        item.status === 'failed'
          ? {
              ...item,
              status: 'queued',
              progress: 0,
              error: null,
            }
          : item,
      ),
    )
  }

  const clearFinished = () => {
    const finished = uploadItemsRef.current.filter(
      (item) =>
        item.status === 'uploaded' ||
        item.status === 'failed',
    )

    finished.forEach((item) => {
      URL.revokeObjectURL(item.previewUrl)
    })

    const next = uploadItemsRef.current.filter(
      (item) =>
        item.status !== 'uploaded' &&
        item.status !== 'failed',
    )

    uploadItemsRef.current = next
    setUploadItems(next)
    setOverallProgress(0)
  }

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault()
  }

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault()

    if (
      !isUploading &&
      event.dataTransfer.files.length > 0
    ) {
      addFiles(event.dataTransfer.files)
    }
  }

  const uploadedCount = uploadItems.filter(
    (item) => item.status === 'uploaded',
  ).length

  const failedCount = uploadItems.filter(
    (item) => item.status === 'failed',
  ).length

  const queuedCount = uploadItems.filter(
    (item) => item.status === 'queued',
  ).length

  return (
    <div className="space-y-6">
      {validationError && (
        <div className="ui-alert ui-alert-error flex items-start gap-3">
          <X className="mt-0.5 h-4 w-4 shrink-0" />

          <p className="text-sm">
            {validationError}
          </p>

          <button
            type="button"
            onClick={() =>
              setValidationError(null)
            }
            className="ml-auto shrink-0"
            aria-label="Dismiss upload error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative rounded-lg border-2 border-dashed border-[var(--color-border-subtle)] p-8 text-center transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-soft)]"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm,video/x-flv,video/x-ms-wmv"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {uploadItems.length === 0 ? (
          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="flex w-full flex-col items-center justify-center"
          >
            <Upload className="mb-4 h-10 w-10 text-[var(--color-accent)]" />

            <h3 className="mb-2 text-lg font-semibold">
              Drag & drop photos or videos here
            </h3>

            <p className="text-sm text-[var(--color-text-muted)]">
              or browse files
            </p>

            <span className="mt-4 text-xs text-[var(--color-text-muted)]">
              JPEG, PNG, WebP, HEIC, HEIF, MP4, MOV,
              AVI, MKV, WEBM, FLV, WMV · max 100MB each
            </span>
          </button>
        ) : (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">
                  {uploadItems.length} file
                  {uploadItems.length !== 1
                    ? 's'
                    : ''}{' '}
                  selected
                </p>

                <p className="text-xs text-[var(--color-text-muted)]">
                  {uploadedCount} uploaded
                  {failedCount > 0
                    ? ` · ${failedCount} failed`
                    : ''}
                  {queuedCount > 0
                    ? ` · ${queuedCount} queued`
                    : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  disabled={isUploading}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  aria-label="Add more files"
                >
                  <Upload className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  disabled={
                    isUploading ||
                    failedCount === 0
                  }
                  onClick={retryFailed}
                  aria-label="Retry failed uploads"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  disabled={
                    isUploading ||
                    (uploadedCount === 0 &&
                      failedCount === 0)
                  }
                  onClick={clearFinished}
                  aria-label="Clear completed uploads"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {uploadItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border-subtle)]">
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {item.file.name}
                      </p>

                      <p className="text-xs text-[var(--color-text-muted)]">
                        {(
                          item.file.size /
                          1024 /
                          1024
                        ).toFixed(2)}{' '}
                        MB
                      </p>

                      {item.error && (
                        <p className="mt-1 text-xs text-[var(--color-danger)]">
                          {item.error}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      {item.status === 'queued' && (
                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.id)
                          }
                          className="text-xs text-[var(--color-danger)] hover:underline"
                        >
                          Remove
                        </button>
                      )}

                      {item.status === 'uploading' && (
                        <span className="flex items-center gap-2 text-xs">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading…
                        </span>
                      )}

                      {item.status === 'uploaded' && (
                        <span className="flex items-center gap-2 text-xs text-[var(--color-success)]">
                          <Check className="h-4 w-4" />
                          Uploaded
                        </span>
                      )}

                      {item.status === 'failed' && (
                        <button
                          type="button"
                          onClick={() =>
                            retryItem(item.id)
                          }
                          className="flex items-center gap-2 text-xs text-[var(--color-accent)] hover:underline"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Retry
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-border-subtle)]">
                    <div
                      className="h-full bg-[var(--color-accent)] transition-[width] duration-200"
                      style={{
                        width: `${item.progress}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">
                    Uploading…
                  </span>

                  <span>
                    {overallProgress.toFixed(0)}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border-subtle)]">
                  <div
                    className="h-full bg-[var(--color-accent)] transition-[width] duration-200"
                    style={{
                      width: `${overallProgress}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {uploadItems.length > 0 &&
        uploadedCount === uploadItems.length &&
        !isUploading && (
          <div className="ui-card p-4 text-center">
            <Check className="mx-auto mb-3 h-8 w-8 text-[var(--color-success)]" />

            <p className="font-medium">
              All files uploaded successfully.
            </p>

            <p className="text-sm text-[var(--color-text-muted)]">
              Your media is now available in the
              gallery.
            </p>
          </div>
        )}
    </div>
  )
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, X, Check, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { upload } from '@vercel/blob/client';

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'queued' | 'uploading' | 'uploaded' | 'failed';
  progress: number;
  error: string | null;
}

interface PhotoUploaderProps {
  galleryId: string;
  onUploadComplete: () => void;
}

export default function PhotoUploader({
  galleryId,
  onUploadComplete,
}: PhotoUploaderProps) {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addFiles = (files: FileList | File[] | null) => {
    if (!files?.length) return;

    const newItems: UploadItem[] = Array.from(files).map((file) => ({
      id: generateId(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'queued',
      progress: 0,
      error: null,
    }));

    setUploadItems((prev) => [...prev, ...newItems]);

    if (!isUploading) {
      processUploadQueue(newItems);
    }
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    addFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeItem = (id: string) => {
    setUploadItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const retryItem = (id: string) => {
    setUploadItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'queued', progress: 0, error: null }
          : item
      )
    );
    if (!isUploading) {
      processUploadQueue(uploadItems.filter((i) => i.id === id));
    }
  };

  const clearCompleted = () => {
    setUploadItems((prev) => {
      const completed = prev.filter(
        (item) =>
          item.status === 'uploaded' || item.status === 'failed'
      );
      completed.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return prev.filter(
        (item) => item.status === 'queued' || item.status === 'uploading'
      );
    });
  };

  const processUploadQueue = async (queue: UploadItem[]) => {
    const items = queue.length > 0 ? queue : [];

    if (items.length === 0) {
      setIsUploading(false);
      onUploadComplete();
      return;
    }

    setIsUploading(true);

    // Process one file at a time to avoid overwhelming the server
    for (const item of items) {
      setUploadItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: 'uploading', progress: 0 }
            : i
        )
      );

      try {
        // Upload to Vercel Blob
        await upload(
          `galleries/${galleryId}/${item.file.name}`,
          item.file,
          {
            access: 'public',
            handleUploadUrl: '/api/galleries/upload',
            clientPayload: JSON.stringify({ galleryId }),
          }
        );

        // Simulate progress updates since the upload API does not expose
        // real-time byte progress.
        let progress = 0;
        const interval = setInterval(() => {
          progress = Math.min(progress + 10, 90);
          setUploadItems((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, progress } : i
            )
          );
        }, 100);

        await new Promise((resolve) => setTimeout(resolve, 500));
        clearInterval(interval);

        setUploadItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'uploaded', progress: 100, error: null }
              : i
          )
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Unknown error occurred';

        setUploadItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'failed', progress: 0, error: errorMessage }
              : i
          )
        );
      }
    }

    // Continue uploading while the user works on the rest of the page
    setIsUploading(false);
    onUploadComplete();
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      uploadItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [uploadItems]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length) {
      addFiles(files);
    }
  };

  const uploadedCount = uploadItems.filter(
    (i) => i.status === 'uploaded'
  ).length;
  const failedCount = uploadItems.filter(
    (i) => i.status === 'failed'
  ).length;

  return (
    <div className="space-y-4">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm,video/x-flv,video/x-ms-wmv"
        className="hidden"
        onChange={handleFileInputChange}
        aria-label="Select photos to upload"
      />

      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Upload photos: drag and drop or press Enter to browse files"
        className={`relative flex min-h-[9rem] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]'
            : 'border-[var(--color-border-subtle)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-soft)]'
        }`}
      >
        <Upload
          className={`mb-3 h-8 w-8 ${
            isDragging ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
          }`}
        />
        <p className="text-sm font-medium">
          {isDragging
            ? 'Drop photos to upload'
            : 'Drag & drop photos here'}
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          or{' '}
          <span className="font-medium text-[var(--color-accent)]">
            browse files
          </span>{' '}
          &mdash; JPEG, PNG, WebP, HEIC, HEIF, MP4 (max 100MB each)
        </p>
      </div>

      {/* Upload Queue */}
      {uploadItems.length > 0 && (
        <div className="space-y-3">
          {/* Summary Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              Uploading
              {isUploading && ' ·'}
              {' '}
              {uploadedCount} of {uploadItems.length} photos
              {failedCount > 0 && (
                <span className="ml-2 text-[var(--color-danger)]">
                  {failedCount} failed
                </span>
              )}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="h-3.5 w-3.5" />
                Add more
              </Button>
              {(failedCount > 0 || uploadedCount > 0) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={clearCompleted}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* File List */}
          <ul className="divide-y divide-[var(--color-border-subtle)] rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg)]">
            {uploadItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 p-3"
              >
                {/* Thumbnail */}
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-bg-soft)]">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* File Info */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-sm font-medium">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
                    {item.error && (
                      <span className="ml-2 text-[var(--color-danger)]">
                        {item.error}
                      </span>
                    )}
                  </p>
                </div>

                {/* Status */}
                <div className="flex w-28 flex-shrink-0 items-center justify-end gap-1.5 text-xs">
                  {item.status === 'queued' && (
                    <>
                      <span className="text-[var(--color-text-muted)]">
                        Waiting
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.file.name}`}
                        className="rounded-full p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-danger)]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}

                  {item.status === 'uploading' && (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-accent)]" />
                      <span>{item.progress}%</span>
                    </>
                  )}

                  {item.status === 'uploaded' && (
                    <>
                      <Check className="h-4 w-4 text-[var(--color-success)]" />
                      <span className="text-[var(--color-success)]">
                        Uploaded
                      </span>
                    </>
                  )}

                  {item.status === 'failed' && (
                    <>
                      <X className="h-4 w-4 text-[var(--color-danger)]" />
                      <button
                        type="button"
                        onClick={() => retryItem(item.id)}
                        className="inline-flex items-center gap-1 font-medium text-[var(--color-accent)] hover:underline"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Completion Message */}
          {!isUploading &&
            uploadItems.length > 0 &&
            failedCount === 0 && (
              <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] p-4 text-center">
                <Check className="mx-auto mb-2 h-6 w-6 text-[var(--color-success)]" />
                <p className="text-sm font-medium">
                  {uploadedCount} photo{uploadedCount !== 1 ? 's' : ''}{' '}
                  uploaded
                </p>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  Your photos are now available in the gallery. You can keep
                  working or upload more.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

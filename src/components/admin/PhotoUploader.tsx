'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, X, Check, Loader2, Trash2, RefreshCw, Copy } from 'lucide-react';
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

export default function PhotoUploader({ galleryId, onUploadComplete }: PhotoUploaderProps) {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTimerRef = useRef<NodeJS.Timeout | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const newItems: UploadItem[] = Array.from(files).map(file => ({
      id: generateId(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'queued',
      progress: 0,
      error: null,
    }));
    setUploadItems(prev => [...prev, ...newItems]);
    // Start upload process if not already uploading
    if (!isUploading) {
      processUploadQueue();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeItem = (id: string) => {
    setUploadItems(prev => prev.filter(item => item.id !== id));
  };

  const retryItem = (id: string) => {
    setUploadItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: 'queued', progress: 0, error: null }
          : item
      )
    );
    if (!isUploading) {
      processUploadQueue();
    }
  };

  const clearCompleted = () => {
    setUploadItems(prev => prev.filter(item => item.status === 'queued' || item.status === 'failed'));
  };

  const processUploadQueue = async () => {
    setIsUploading(true);
    const queue = uploadItems.filter(item => item.status === 'queued');
    if (queue.length === 0) {
      setIsUploading(false);
      onUploadComplete();
      return;
    }

    // Process one file at a time to avoid overwhelming the server
    for (const item of queue) {
      // Update status to uploading
      setUploadItems(prev =>
        prev.map(i => (i.id === item.id ? { ...i, status: 'uploading', progress: 0 } : i))
      );

      try {
        // Upload to Vercel Blob
        const result = await upload(
          `galleries/${galleryId}/${item.file.name}`,
          item.file,
          {
            access: 'public',
            handleUploadUrl: '/api/galleries/upload',
            clientPayload: JSON.stringify({ galleryId }),
          }
        );

        // Simulate progress updates since we don't have real-time progress from the upload function
        // We'll update progress in intervals to show activity
        let progress = 0;
        const interval = setInterval(() => {
          progress = Math.min(progress + 10, 90);
          setUploadItems(prev =>
            prev.map(i =>
              i.id === item.id ? { ...i, progress } : i
            )
          );
        }, 100);

        // Wait for upload to complete
        await new Promise(resolve => setTimeout(resolve, 500)); // Give time for the upload to initiate

        // Clear the progress interval
        clearInterval(interval);

        // Mark as uploaded
        setUploadItems(prev =>
          prev.map(i =>
            i.id === item.id
              ? { ...i, status: 'uploaded', progress: 100, error: null }
              : i
          )
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setUploadItems(prev =>
          prev.map(i =>
            i.id === item.id
              ? { ...i, status: 'failed', progress: 0, error: errorMessage }
              : i
          )
        );
      }
    }

    // After processing all queued items, update overall progress and check if done
    const completed = uploadItems.filter(
      item => item.status === 'uploaded' || item.status === 'failed'
    ).length;
    setOverallProgress((completed / uploadItems.length) * 100);

    if (completed === uploadItems.length) {
      setIsUploading(false);
      // Refresh the gallery to show new photos
      onUploadComplete();
      // Clear completed items after a delay
      setTimeout(() => {
        clearCompleted();
      }, 3000);
    } else {
      // Continue processing next batch
      processUploadQueue();
    }
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      uploadItems.forEach(item => URL.revokeObjectURL(item.previewUrl));
      if (uploadTimerRef.current) {
        clearTimeout(uploadTimerRef.current);
      }
    };
  }, [uploadItems]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) {
      addFiles(files);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed border-[var(--color-border-subtle)] rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-soft)]`}
      >
        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm,video/x-flv,video/x-ms-wmv"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Drag & Drop Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {uploadItems.length === 0 && (
            <>
              <Upload className="w-10 h-10 mb-4 text-[var(--color-accent)]" />
              <h3 className="mb-2 text-lg font-semibold">Drag & drop photos here</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                or browse files
              </p>
              <div className="mt-4 flex items-center space-x-3">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <span className="text-xs text-[var(--color-text-muted)]">
                  JPEG, PNG, WebP, HEIC, HEIF, MP4, MOV, AVI, MKV, WEBM, FLV, WMV
                </span>
              </div>
            </>
          )}
          {uploadItems.length > 0 && (
            <>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <span className="px-3 py-1 bg-[var(--color-bg-soft)] rounded-full text-xs font-medium">
                    {uploadItems.length} file{uploadItems.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="space-y-2">
                  {uploadItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-[var(--color-bg-soft)] rounded-lg"
                    >
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-lg border border-[var(--color-border-subtle)]">
                        {item.previewUrl && (
                          <img
                            src={item.previewUrl}
                            alt={item.file.name}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                      {/* File Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="truncate font-medium">{item.file.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {((item.file.size / 1024 / 1024).toFixed(2))} MB
                        </p>
                      </div>
                      {/* Status & Controls */}
                      <div className="flex items-center gap-3">
                        {item.status === 'queued' && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-xs text-[var(--color-danger)] hover:underline"
                          >
                            Remove
                          </button>
                        )}
                        {item.status === 'uploading' && (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs">Uploading...</span>
                          </>
                        )}
                        {item.status === 'uploaded' && (
                          <>
                            <Check className="w-4 h-4 text-[var(--color-success)]" />
                            <span className="text-xs">Uploaded</span>
                          </>
                        )}
                        {item.status === 'failed' && (
                          <>
                            <X className="w-4 h-4 text-[var(--color-danger)]" />
                            <button
                              onClick={() => retryItem(item.id)}
                              className="ml-2 text-xs text-[var(--color-accent)] hover:underline"
                            >
                              Retry
                            </button>
                          </>
                        )}
                      </div>
                    >
                      <div className="w-0 flex-1 flex items-center">
                        <div className="w-2 h-2 rounded-full">
                          {item.status === 'queued' && (
                            <div className="bg-[var(--color-border-subtle)]" />
                          )}
                          {item.status === 'uploading' && (
                            <div className="bg-[var(--color-accent)] animate-pulse" />
                          )}
                          {item.status === 'uploaded' && (
                            <div className="bg-[var(--color-success)]" />
                          )}
                          {item.status === 'failed' && (
                            <div className="bg-[var(--color-danger)]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="bg-[var(--color-border-subtle)] h-0.5">
                            <div
                              className={`h-full bg-[var(--color-accent)] transition-all duration-300`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  )}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {uploadItems.filter(i => i.status === 'uploaded').length} of {uploadItems.length} uploaded
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      disabled={isUploading || uploadItems.filter(i => i.status === 'queued').length === 0}
                      onClick={clearCompleted}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      disabled={isUploading || uploadItems.filter(i => i.status === 'failed').length === 0}
                      onClick={() => {
                        uploadItems
                          .filter(i => i.status === 'failed')
                          .forEach(item => retryItem(item.id));
                      }}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {isUploading && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">
                        Uploading...
                      </span>
                      <div className="flex-1">
                        <div className="bg-[var(--color-border-subtle)] h-2 rounded">
                          <div
                            className={`h-full bg-[var(--color-accent)] transition-all duration-300`}
                            style={{ width: `${overallProgress}%` }}
                          />
                        </div>
                      </span>
                      <span className="text-xs">{overallProgress.toFixed(0)}%</span>
                    </div>
                  </div>
                )}
              </>
            )}
          )}
        </div>
      </div>

      {/* Upload Complete Message */}
      {uploadItems.length > 0 &&
        uploadItems.every(item => item.status === 'uploaded') && (
          <div className="ui-card p-4 text-center bg-[var(--color-bg-soft)]">
            <Check className="w-8 h-8 mb-3 text-[var(--color-success)]" />
            <p className="font-medium">All photos uploaded successfully!</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Your photos are now available in the gallery.
            </p>
          </div>
        )}
    </div>
  );
}

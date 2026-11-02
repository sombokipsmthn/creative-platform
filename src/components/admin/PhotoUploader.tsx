'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, X, Check, CircleNotch as Loader2, Trash as Trash2, ArrowsClockwise as RefreshCw } from "@phosphor-icons/react";
import { Button } from '@/components/ui/button';


async function createOptimizedPreview(file: File): Promise<File | null> {
  if (!file.type.startsWith("image/") || file.type === "image/heic" || file.type === "image/heif") return null;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) { bitmap.close(); return null; }
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.84));
    if (!blob) return null;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + "-preview.jpg", { type: "image/jpeg", lastModified: file.lastModified });
  } catch { return null; }
}

function uploadFormData(url: string, form: FormData, onProgress: (loaded: number, total: number) => void) {
  return new Promise<Record<string, any>>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", url);
    request.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(event.loaded, event.total); };
    request.onload = () => {
      let response: Record<string, any> = {};
      try { response = JSON.parse(request.responseText); } catch { /* handled below */ }
      if (request.status >= 200 && request.status < 300) resolve(response);
      else reject(new Error(response.error || "Upload failed."));
    };
    request.onerror = () => reject(new Error("Network error while uploading."));
    request.send(form);
  });
}

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'queued' | 'uploading' | 'uploaded' | 'failed';
  progress: number;
  error: string | null;
  photoId?: string;
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
  const previewUrlsRef = useRef(new Set<string>());

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addFiles = (files: FileList | File[] | null) => {
    if (!files?.length) return;

    const newItems: UploadItem[] = Array.from(files).map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.add(previewUrl);
      return {
      id: generateId(),
      file,
      previewUrl,
      status: 'queued',
      progress: 0,
      error: null,
    };
    });

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
        previewUrlsRef.current.delete(target.previewUrl);
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
      completed.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
        previewUrlsRef.current.delete(item.previewUrl);
      });
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
        const optimizedPreview = item.photoId ? null : await createOptimizedPreview(item.file);
        let photoId = item.photoId || "";
        if (optimizedPreview) {
          const previewForm = new FormData();
          previewForm.append("galleryId", galleryId);
          previewForm.append("file", optimizedPreview);
          const previewResponse = await uploadFormData("/api/galleries/upload", previewForm, (loaded, total) => {
            setUploadItems((prev) => prev.map((i) => i.id === item.id ? { ...i, progress: Math.round((loaded / total) * 70) } : i));
          });
          photoId = typeof previewResponse.photo?.id === "string" ? previewResponse.photo.id : "";
          if (!photoId) throw new Error("Preview uploaded, but the media record was not returned.");
          setUploadItems((prev) => prev.map((i) => i.id === item.id ? { ...i, photoId, progress: 70 } : i));
          onUploadComplete();
        }
        if (photoId) {
          const originalForm = new FormData();
          originalForm.append("galleryId", galleryId);
          originalForm.append("photoId", photoId);
          originalForm.append("file", item.file);
          await uploadFormData("/api/galleries/upload/original", originalForm, (loaded, total) => {
            setUploadItems((prev) => prev.map((i) => i.id === item.id ? { ...i, progress: 70 + Math.round((loaded / total) * 30) } : i));
          });
        } else {
          const form = new FormData();
          form.append("galleryId", galleryId);
          form.append("file", item.file);
          await uploadFormData("/api/galleries/upload", form, (loaded, total) => {
            setUploadItems((prev) => prev.map((i) => i.id === item.id ? { ...i, progress: Math.round((loaded / total) * 100) } : i));
          });
        }

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

  // Keep previews alive while the queue updates; release them when each item clears or this uploader unmounts.
  useEffect(() => () => {
    previewUrlsRef.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    previewUrlsRef.current.clear();
  }, []);

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
        aria-label="Select gallery photos and videos to upload"
      />

      {/* Drop Zone - Compact */}
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
        aria-label="Upload gallery media: drag and drop or press Enter to browse files"
        className={`relative flex min-h-[6rem] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
          isDragging
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]'
            : 'border-[var(--color-border-subtle)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-soft)]'
        }`}
      >
        <Upload
          className={`mb-2 h-6 w-6 ${
            isDragging ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
          }`}
        />
        <p className="text-sm font-medium">
          {isDragging
            ? 'Drop photos to upload'
            : 'Drag & drop photos here'}
        </p>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          or{' '}
          <span className="font-medium text-[var(--color-accent)]">
            browse files
          </span>{' '}
          &mdash; JPEG, PNG, WebP, HEIC, HEIF, MP4, MOV, AVI, MKV, WebM, FLV, WMV (max 100MB each)
        </p>
      </div>

      {/* Upload Queue */}
      {uploadItems.length > 0 && (
        <div className="space-y-3">
          {/* Summary Row */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-medium text-[var(--color-text-muted)]" role="status" aria-live="polite">
              {isUploading ? 'Uploading' : failedCount > 0 ? 'Upload finished with errors' : 'Uploads complete'}
              {' · '}
              {uploadedCount} of {uploadItems.length} files
              {failedCount > 0 && (
                <span className="ml-2 text-[var(--color-danger)]">
                  {failedCount} failed
                </span>
              )}
            </span>

            <div className="flex flex-wrap items-center gap-2">
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
                className="flex min-w-0 items-center gap-3 p-3"
              >
                {/* Thumbnail */}
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-bg-soft)]">
                  {item.file.type.startsWith('video/') ? (
                    <video src={item.previewUrl} aria-label={`Preview of ${item.file.name}`} className="h-full w-full object-cover" />
                  ) : (
                    <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
                  )}
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
                <div className="flex shrink-0 items-center justify-end gap-1.5 text-xs sm:w-28">
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
                      <span aria-label={`Uploading ${item.file.name}: ${item.progress}%`}>{item.progress}%</span>
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

// src/app/admin/projects/[id]/page.tsx
'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Folder,
  FolderPlus,
  Heart,
  Image as ImageIcon,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Sliders,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

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
  collection_id?: string | null;
  filename: string;
  originalUrl?: string;
  original_url?: string;
  displayUrl?: string;
  display_url?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  sortOrder?: number;
  sort_order?: number;
  isHidden?: boolean;
  is_hidden?: boolean;
  isFavorite?: boolean;
  is_favorite?: boolean;
  isSelected?: boolean;
  is_selected?: boolean;
  collection_title?: string;
}

interface GalleryData {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  slug: string;
  accessPin: string | null;
  access_pin: string | null;
  status: 'draft' | 'published';
  coverPhotoId: string | null;
  cover_photo_id: string | null;
  cover_url?: string | null;
  allowDownloads: boolean;
  allow_downloads: boolean;
  allowFavorites: boolean;
  allow_favorites: boolean;
  allowSelections: boolean;
  allow_selections: boolean;
  clientId: string | null;
  client_id: string | null;
  client_name?: string | null;
  client_email?: string | null;
  projectId: string | null;
  project_id: string | null;
  project_name?: string | null;
  publishedAt?: string | null;
  published_at?: string | null;
  createdAt?: string;
  created_at?: string;
  theme?: string | null;
}

interface ClientOption {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
}

type GalleryTheme = 'reference-pending';

type TabType =
  | 'photos'
  | 'details'
  | 'cover'
  | 'settings'
  | 'activity';

const CATEGORY_OPTIONS = [
  'Ecosystem Storytelling',
  'Brand Films & Media',
  'Commercial Photography',
  'Corporate Portraiture',
  'Event Coverage',
  'Documentary & Fieldwork',
  'Motion Graphics',
];

const SAMPLE_PHOTO_PRESETS = [
  {
    title: 'Executive Keynote',
    url: 'https://images.unsplash.com/photo-1511578314323-379afb476865?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Founder Field Interview',
    url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Production Facility Workshop',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Creative Team Portrait',
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Clean Tech Showcase',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Innovation Lab Panel',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function GalleryEditManagerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const galleryId = resolvedParams.id;

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('photos');

  // Loading & Saving States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Gallery Core State
  const [gallery, setGallery] = useState<GalleryData | null>(null);
  const [collections, setCollections] = useState<GalleryCollection[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [availableClients, setAvailableClients] = useState<ClientOption[]>([]);

  // Selected Collection Filter for Photo Grid
  const [activeCollectionId, setActiveCollectionId] = useState<string>('all');

  // Selection & Bulk Operations
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);

  // Form Fields (Live Editable)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Ecosystem Storytelling');
  const [slug, setSlug] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [accessPin, setAccessPin] = useState('4821');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [allowFavorites, setAllowFavorites] = useState(true);
  const [allowSelections, setAllowSelections] = useState(true);
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null);
  const [galleryTheme] = useState<GalleryTheme>('reference-pending');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadCompleted, setUploadCompleted] = useState(0);
  const [uploadFailed, setUploadFailed] = useState<string[]>([]);

  // Collection Modal States
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [editingCollection, setEditingCollection] = useState<GalleryCollection | null>(null);
  const [editCollectionTitle, setEditCollectionTitle] = useState('');

  // Direct Photo Add State
  const [isAddPhotoUrlOpen, setIsAddPhotoUrlOpen] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoTitleInput, setPhotoTitleInput] = useState('');

  // Dirty State Tracker
  const [isDirty, setIsDirty] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  /* =========================================================
     LOAD DATA
     ========================================================= */

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const [galRes, clientRes] = await Promise.all([
          fetch(`/api/galleries/${galleryId}`, { cache: 'no-store' }),
          fetch('/api/clients', { cache: 'no-store' }),
        ]);

        if (galRes.ok && !ignore) {
          const data = await galRes.json();
          const gal: GalleryData = data.gallery;

          setGallery(gal);
          setCollections(data.collections || []);
          setPhotos(data.photos || []);

          setTitle(gal.title || '');
          setDescription(gal.description || '');
          setCategory(gal.category || 'Ecosystem Storytelling');
          setSlug(gal.slug || '');
          setClientId(gal.clientId || gal.client_id || '');
          setAccessPin(gal.accessPin || gal.access_pin || '4821');
          setStatus(gal.status === 'published' ? 'published' : 'draft');
          setAllowDownloads(gal.allowDownloads ?? gal.allow_downloads ?? true);
          setAllowFavorites(gal.allowFavorites ?? gal.allow_favorites ?? true);
          setAllowSelections(gal.allowSelections ?? gal.allow_selections ?? true);
          setCoverPhotoId(gal.coverPhotoId || gal.cover_photo_id || null);

          setIsDirty(false);
        }

        if (clientRes.ok && !ignore) {
          const cData = await clientRes.json();
          const clientList = Array.isArray(cData) ? cData : cData.clients || [];
          setAvailableClients(clientList);
        }
      } catch (err) {
        if (!ignore) {
          setErrorMessage(
            err instanceof Error ? err.message : 'Failed to load gallery.'
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      ignore = true;
    };
  }, [galleryId]);

  /* =========================================================
     SAVE GALLERY DETAILS & SETTINGS
     ========================================================= */

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      setErrorMessage(null);

      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          category,
          slug: slug.trim() || undefined,
          clientId: clientId || null,
          accessPin: accessPin.trim() || null,
          status,
          coverPhotoId,
          allowDownloads,
          allowFavorites,
          allowSelections,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save changes.');
      }

      const updated = await response.json();
      setGallery(updated.gallery);
      setIsDirty(false);
      setSaveSuccess(true);
      showToast('✓ Changes saved successfully without leaving!');

      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('handleSaveChanges error:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to save changes.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =========================================================
     COLLECTIONS MANAGEMENT
     ========================================================= */

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionTitle.trim()) return;

    try {
      const res = await fetch(`/api/galleries/${galleryId}/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCollectionTitle.trim(),
          description: newCollectionDesc.trim() || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create collection.');
      }

      const data = await res.json();
      setCollections((prev) => [...prev, data.collection]);
      setNewCollectionTitle('');
      setNewCollectionDesc('');
      setIsAddCollectionOpen(false);
      showToast(`✓ Collection "${data.collection.title}" created.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creating collection');
    }
  };

  const handleUpdateCollection = async (collectionId: string) => {
    if (!editCollectionTitle.trim()) return;

    try {
      const res = await fetch(`/api/galleries/${galleryId}/collections`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId,
          title: editCollectionTitle.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update collection.');
      }

      const data = await res.json();
      setCollections((prev) =>
        prev.map((c) => (c.id === collectionId ? { ...c, title: data.collection.title } : c))
      );
      setEditingCollection(null);
      showToast('✓ Collection renamed.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating collection');
    }
  };

  const handleDeleteCollection = async (collectionId: string, collTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to delete collection "${collTitle}"? Photos will remain in your gallery.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/galleries/${galleryId}/collections`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete collection.');
      }

      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
      setPhotos((prev) =>
        prev.map((p) =>
          (p.collectionId === collectionId || p.collection_id === collectionId)
            ? { ...p, collectionId: null, collection_id: null, collection_title: undefined }
            : p
        )
      );

      if (activeCollectionId === collectionId) {
        setActiveCollectionId('all');
      }

      showToast(`✓ Collection "${collTitle}" deleted.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting collection');
    }
  };

  /* =========================================================
     PHOTOS MANAGEMENT
     ========================================================= */

  const handleAddSamplePreset = async (preset: { title: string; url: string }) => {
    try {
      const targetCol =
        activeCollectionId !== 'all' ? activeCollectionId : null;

      const res = await fetch(`/api/galleries/${galleryId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: preset.url,
          filename: `${preset.title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          collectionId: targetCol,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add sample photo.');
      }

      const data = await res.json();
      setPhotos((prev) => [...prev, ...(data.photos || [])]);
      showToast(`✓ Photo "${preset.title}" added.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error adding photo');
    }
  };

  const handleAddCustomUrlPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrlInput.trim()) return;

    try {
      const targetCol =
        activeCollectionId !== 'all' ? activeCollectionId : null;

      const res = await fetch(`/api/galleries/${galleryId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: photoUrlInput.trim(),
          filename: photoTitleInput.trim() || 'uploaded-photo.jpg',
          collectionId: targetCol,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add photo URL.');
      }

      const data = await res.json();
      setPhotos((prev) => [...prev, ...(data.photos || [])]);
      setPhotoUrlInput('');
      setPhotoTitleInput('');
      setIsAddPhotoUrlOpen(false);
      showToast('✓ Photo added to gallery.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error adding photo URL');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';

    if (files.length === 0) return;

    const targetCol = activeCollectionId !== 'all' ? activeCollectionId : null;

    setUploadTotal(files.length);
    setUploadCompleted(0);
    setUploadProgress(0);
    setUploadFailed([]);
    showToast(`Uploading ${files.length} photo(s)...`);

    const failedFiles: string[] = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];

      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') resolve(reader.result);
            else reject(new Error('Unable to read file.'));
          };
          reader.onerror = () => reject(new Error('Unable to read file.'));
          reader.readAsDataURL(file);
        });

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `/api/galleries/${galleryId}/photos`);
          xhr.setRequestHeader('Content-Type', 'application/json');

          xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            const currentFileProgress = event.loaded / event.total;
            const aggregate = ((i + currentFileProgress) / files.length) * 100;
            setUploadProgress(Math.min(100, Math.round(aggregate)));
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                setPhotos((prev) => [...prev, ...(data.photos || [])]);
                resolve();
              } catch {
                reject(new Error('Gallery returned an invalid upload response.'));
              }
            } else {
              let message = `Failed to upload ${file.name}.`;
              try {
                const data = JSON.parse(xhr.responseText);
                message = data.error || message;
              } catch { }
              reject(new Error(message));
            }
          };

          xhr.onerror = () => reject(new Error(`Network error uploading ${file.name}.`));
          xhr.send(
            JSON.stringify({
              url: dataUrl,
              filename: file.name,
              collectionId: targetCol,
            })
          );
        });

        setUploadCompleted((count) => count + 1);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (err) {
        console.error('File upload error:', err);
        failedFiles.push(file.name);
        setUploadFailed([...failedFiles]);
        setUploadCompleted((count) => count + 1);
      }
    }

    setUploadProgress(100);
    showToast(
      failedFiles.length > 0
        ? `Upload finished with ${failedFiles.length} failed file(s).`
        : '✓ Upload complete.'
    );

    window.setTimeout(() => {
      setUploadTotal(0);
      setUploadProgress(0);
      setUploadCompleted(0);
      setUploadFailed([]);
    }, 3500);
  };

  const handleSetCoverPhoto = async (photoId: string) => {
    setCoverPhotoId(photoId);
    setIsDirty(true);

    try {
      await fetch(`/api/galleries/${galleryId}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId,
          isCover: true,
        }),
      });

      showToast('✓ Set as Cover Image.');
    } catch (err) {
      console.error('Failed to set cover photo:', err);
    }
  };

  const handleToggleHidePhoto = async (photo: GalleryPhoto) => {
    const isHidden = !(photo.isHidden ?? photo.is_hidden ?? false);

    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photo.id
          ? { ...p, isHidden, is_hidden: isHidden }
          : p
      )
    );

    try {
      await fetch(`/api/galleries/${galleryId}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId: photo.id,
          isHidden,
        }),
      });
      showToast(isHidden ? 'Photo hidden from client.' : 'Photo visible to client.');
    } catch (err) {
      console.error('Failed to toggle photo visibility:', err);
    }
  };

  const handleMovePhotoToCollection = async (
    photoId: string,
    targetCollectionId: string | null
  ) => {
    const collTitle =
      collections.find((c) => c.id === targetCollectionId)?.title ||
      'All Photos';

    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId
          ? {
            ...p,
            collectionId: targetCollectionId,
            collection_id: targetCollectionId,
            collection_title: collTitle,
          }
          : p
      )
    );

    try {
      await fetch(`/api/galleries/${galleryId}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId,
          collectionId: targetCollectionId,
        }),
      });
      showToast(`✓ Moved to ${collTitle}.`);
    } catch (err) {
      console.error('Failed to move photo:', err);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo from the gallery?')) return;

    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setSelectedPhotoIds((prev) => prev.filter((id) => id !== photoId));

    try {
      await fetch(`/api/galleries/${galleryId}/photos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoIds: [photoId] }),
      });
      showToast('✓ Photo deleted.');
    } catch (err) {
      console.error('Failed to delete photo:', err);
    }
  };

  /* =========================================================
     BULK ACTIONS
     ========================================================= */

  const toggleSelectPhoto = (photoId: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleSelectAllInView = () => {
    const visibleIds = visiblePhotos.map((p) => p.id);
    if (selectedPhotoIds.length === visibleIds.length) {
      setSelectedPhotoIds([]);
    } else {
      setSelectedPhotoIds(visibleIds);
    }
  };

  const handleBulkMove = async (targetCollectionId: string | null) => {
    if (selectedPhotoIds.length === 0) return;

    const collTitle =
      collections.find((c) => c.id === targetCollectionId)?.title ||
      'All Photos';

    setPhotos((prev) =>
      prev.map((p) =>
        selectedPhotoIds.includes(p.id)
          ? {
            ...p,
            collectionId: targetCollectionId,
            collection_id: targetCollectionId,
            collection_title: collTitle,
          }
          : p
      )
    );

    for (const photoId of selectedPhotoIds) {
      await fetch(`/api/galleries/${galleryId}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId,
          collectionId: targetCollectionId,
        }),
      });
    }

    showToast(`✓ Moved ${selectedPhotoIds.length} photo(s) to ${collTitle}.`);
    setSelectedPhotoIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedPhotoIds.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedPhotoIds.length} selected photos?`
      )
    ) {
      return;
    }

    const idsToDelete = [...selectedPhotoIds];
    setPhotos((prev) => prev.filter((p) => !idsToDelete.includes(p.id)));
    setSelectedPhotoIds([]);

    try {
      await fetch(`/api/galleries/${galleryId}/photos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoIds: idsToDelete }),
      });
      showToast(`✓ ${idsToDelete.length} photos deleted.`);
    } catch (err) {
      console.error('Bulk delete error:', err);
    }
  };

  /* =========================================================
     DERIVED DATA
     ========================================================= */

  const visiblePhotos = activeCollectionId === 'all'
    ? photos
    : photos.filter(
      (p) =>
        p.collectionId === activeCollectionId ||
        p.collection_id === activeCollectionId
    );

  const activeCoverPhoto = coverPhotoId
    ? photos.find((p) => p.id === coverPhotoId) || photos[0] || null
    : photos[0] || null;

  const selectedClient = availableClients.find((c) => c.id === clientId) || null;

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/portal/g/${slug || gallery?.slug || galleryId}`
    : '';

  const copyShareLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      showToast('✓ Client share link copied to clipboard!');
    }
  };

  /* =========================================================
     RENDER
     ========================================================= */

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
            Loading Gallery Manager...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans pb-24" data-gallery-theme={galleryTheme}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-purple-600 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-mono flex items-center gap-3 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* STICKY STUDIO HEADER BAR */}
      <header className="sticky top-16 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left Breadcrumb & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/projects"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              title="Back to All Galleries"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-medium text-slate-900 dark:text-white truncate">
                  {title || 'Untitled Gallery'}
                </h1>

                <span
                  className={`px-2.5 py-0.5 text-[10px] font-mono uppercase rounded-full tracking-wider border ${status === 'published'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    }`}
                >
                  {status}
                </span>

                {isDirty && (
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" title="Unsaved changes" />
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-500 font-mono truncate">
                {selectedClient?.name ? `Client: ${selectedClient.name}` : category} • {photos.length} photos
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 self-end md:self-center">
            {/* Share Link */}
            <button
              onClick={copyShareLink}
              className="px-3 py-2 btn-secondary text-xs font-mono uppercase tracking-wider rounded-lg flex items-center gap-1.5"
              title="Copy Client Share Link"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Client View / Portal Link */}
            <Link
              href={`/portal/g/${slug || gallery?.slug || galleryId}`}
              target="_blank"
              className="px-3.5 py-2 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-mono uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition"
            >
              <span>Client View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* Save Changes Button */}
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className={`px-5 py-2 text-xs font-mono uppercase tracking-widest rounded-lg flex items-center gap-2 transition shadow-sm ${saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : isDirty
                    ? 'btn-primary shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                    : 'btn-primary opacity-90'
                }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SUBHEADER: 5 PIXIESET / PIC-TIME STYLE TABS */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-1 md:gap-2 overflow-x-auto border-t border-slate-100 dark:border-zinc-900 pt-1 pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg flex items-center gap-2 whitespace-nowrap transition ${activeTab === 'photos'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Photos & Collections ({photos.length})
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg flex items-center gap-2 whitespace-nowrap transition ${activeTab === 'details'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Gallery Details
          </button>

          <button
            onClick={() => setActiveTab('cover')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg flex items-center gap-2 whitespace-nowrap transition ${activeTab === 'cover'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
          >
            <Star className="w-3.5 h-3.5" />
            Cover Image
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg flex items-center gap-2 whitespace-nowrap transition ${activeTab === 'settings'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings & Access
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg flex items-center gap-2 whitespace-nowrap transition ${activeTab === 'activity'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Client Activity
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        {errorMessage && (
          <div className="mb-6 p-4 border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 rounded-xl flex items-center justify-between">
            <p className="text-xs font-mono text-red-700 dark:text-red-400">{errorMessage}</p>
            <button onClick={() => setErrorMessage(null)} className="text-red-500">
              ✕
            </button>
          </div>
        )}

        {/* =========================================================
            TAB 1: PHOTOS & COLLECTIONS WORKSPACE
            ========================================================= */}
        {activeTab === 'photos' && (
          <div className="space-y-8">
            {/* COLLECTIONS BAR */}
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 dark:text-zinc-500 uppercase flex items-center gap-1.5 mr-1">
                    <Layers className="w-3.5 h-3.5" />
                    Sets:
                  </span>

                  {/* All Photos Pill */}
                  <button
                    onClick={() => setActiveCollectionId('all')}
                    className={`px-3.5 py-1.5 text-xs font-mono rounded-xl transition ${activeCollectionId === 'all'
                        ? 'bg-purple-600 text-white font-bold shadow-sm'
                        : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                      }`}
                  >
                    All Photos ({photos.length})
                  </button>

                  {/* Custom Collection Pills */}
                  {collections.map((col) => {
                    const count = photos.filter(
                      (p) => p.collectionId === col.id || p.collection_id === col.id
                    ).length;

                    return (
                      <div key={col.id} className="flex items-center group">
                        <button
                          onClick={() => setActiveCollectionId(col.id)}
                          className={`px-3.5 py-1.5 text-xs font-mono rounded-xl transition flex items-center gap-1.5 ${activeCollectionId === col.id
                              ? 'bg-purple-600 text-white font-bold shadow-sm'
                              : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                            }`}
                        >
                          <Folder className="w-3 h-3" />
                          <span>{col.title}</span>
                          <span className="opacity-70 text-[10px]">({count})</span>
                        </button>

                        {/* Quick Collection Manage Controls */}
                        {activeCollectionId === col.id && (
                          <div className="flex items-center ml-1 gap-1">
                            <button
                              onClick={() => {
                                setEditingCollection(col);
                                setEditCollectionTitle(col.title);
                              }}
                              className="p-1 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded"
                              title="Rename Collection"
                            >
                              <Sliders className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteCollection(col.id, col.title)}
                              className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                              title="Delete Collection"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* + New Collection Button */}
                <button
                  onClick={() => setIsAddCollectionOpen(true)}
                  className="px-3 py-1.5 border border-dashed border-purple-500/50 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-mono rounded-xl flex items-center gap-1.5 transition"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ New Collection</span>
                </button>
              </div>
            </div>

            {/* UPLOAD & BULK TOOLBAR */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                {/* Upload File Button */}
                <label className="cursor-pointer px-4 py-2.5 btn-primary text-xs font-mono uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span>Upload Photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Direct URL / Sample Presets */}
                <button
                  onClick={() => setIsAddPhotoUrlOpen(true)}
                  className="px-3.5 py-2.5 btn-secondary text-xs font-mono uppercase tracking-wider rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add URL / Preset</span>
                </button>
              </div>

              {/* Bulk Actions (When items selected) */}
              <div className="flex items-center gap-2">
                {visiblePhotos.length > 0 && (
                  <button
                    onClick={handleSelectAllInView}
                    className="px-3 py-2 text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    {selectedPhotoIds.length === visiblePhotos.length
                      ? 'Deselect All'
                      : `Select All (${visiblePhotos.length})`}
                  </button>
                )}

                {selectedPhotoIds.length > 0 && (
                  <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/40 border border-purple-500/30 rounded-xl px-3 py-1.5">
                    <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">
                      {selectedPhotoIds.length} selected
                    </span>

                    {/* Move Selected to Collection Dropdown */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkMove(e.target.value === 'all' ? null : e.target.value);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                      className="bg-white dark:bg-zinc-900 border border-purple-500/40 text-xs font-mono px-2 py-1 rounded-lg outline-none"
                    >
                      <option value="" disabled>
                        Move to Set...
                      </option>
                      <option value="all">Unassigned / All</option>
                      {collections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>

                    {/* Delete Selected */}
                    <button
                      onClick={handleBulkDelete}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"
                      title="Delete selected photos"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {uploadTotal > 0 && (
              <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 shadow-sm" aria-live="polite">
                <div className="flex items-center justify-between gap-4 text-xs font-mono">
                  <span className="text-slate-600 dark:text-zinc-300">
                    {uploadProgress >= 100 ? 'Upload complete' : `Uploading ${uploadCompleted} of ${uploadTotal}`}
                  </span>
                  <span className="text-slate-400 dark:text-zinc-500">{uploadProgress}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                  <div className="h-full bg-purple-600 transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                </div>
                {uploadFailed.length > 0 && (
                  <p className="mt-2 text-[10px] font-mono text-red-500">
                    Failed: {uploadFailed.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* PHOTO GRID */}
            {visiblePhotos.length === 0 ? (
              <div className="border-2 border-dashed border-slate-300 dark:border-zinc-800 rounded-3xl p-16 text-center bg-white/50 dark:bg-zinc-950/50 space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-light text-slate-900 dark:text-white">
                    {activeCollectionId === 'all'
                      ? 'No photos in this gallery yet'
                      : 'No photos in this collection'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-sm mx-auto mt-1 font-mono">
                    Upload images from your device or select one of our curated sample presets to get started.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <label className="cursor-pointer px-5 py-3 btn-primary text-xs font-mono uppercase tracking-wider rounded-xl inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload Your Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => {
                      SAMPLE_PHOTO_PRESETS.slice(0, 3).forEach((p) => handleAddSamplePreset(p));
                    }}
                    className="px-5 py-3 btn-secondary text-xs font-mono uppercase tracking-wider rounded-xl inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Load 3 Sample Photos</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {visiblePhotos.map((photo) => {
                  const isCover = (coverPhotoId || gallery?.cover_photo_id) === photo.id;
                  const isHidden = photo.isHidden ?? photo.is_hidden ?? false;
                  const isSelected = selectedPhotoIds.includes(photo.id);
                  const displayImgUrl =
                    photo.displayUrl || photo.display_url || photo.originalUrl || photo.original_url || '';

                  return (
                    <div
                      key={photo.id}
                      className={`group relative overflow-hidden border bg-white dark:bg-zinc-900/60 transition-all shadow-sm flex flex-col justify-between ${isSelected
                          ? 'border-purple-600 ring-2 ring-purple-600/30'
                          : 'border-slate-200 dark:border-zinc-800/80 hover:border-purple-500/50'
                        }`}
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-zinc-950 overflow-hidden">
                        {displayImgUrl ? (
                          <Image
                            src={displayImgUrl}
                            alt={photo.filename || 'Gallery photo'}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isHidden ? 'opacity-40 grayscale' : ''
                              }`}
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}

                        {/* Top Left Selection Checkbox */}
                        <button
                          onClick={() => toggleSelectPhoto(photo.id)}
                          className={`absolute top-2.5 left-2.5 w-6 h-6 rounded-md flex items-center justify-center transition backdrop-blur-md ${isSelected
                              ? 'bg-purple-600 text-white'
                              : 'bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 hover:bg-purple-600'
                            }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>

                        {/* Top Right Badges */}
                        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                          {isCover && (
                            <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-mono font-bold uppercase rounded-full shadow-md flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              Cover
                            </span>
                          )}

                          {isHidden && (
                            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[9px] font-mono uppercase rounded-full border border-white/20">
                              Hidden
                            </span>
                          )}

                          {(photo.isFavorite || photo.is_favorite) && (
                            <span className="px-2 py-0.5 bg-red-500/80 text-white text-[9px] font-mono rounded-full flex items-center gap-1">
                              <Heart className="w-2.5 h-2.5 fill-current" /> Client
                            </span>
                          )}
                        </div>

                        {/* Hover Overlay Action Bar */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Set as Cover */}
                          <button
                            onClick={() => handleSetCoverPhoto(photo.id)}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-amber-500 text-white transition text-[10px] font-mono flex items-center gap-1"
                            title="Set as Cover Photo"
                          >
                            <Star className={`w-3 h-3 ${isCover ? 'fill-current' : ''}`} />
                          </button>

                          {/* Hide / Unhide */}
                          <button
                            onClick={() => handleToggleHidePhoto(photo)}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white transition"
                            title={isHidden ? 'Show photo to client' : 'Hide photo from client'}
                          >
                            {isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </button>

                          {/* Delete Photo */}
                          <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-red-600 text-white transition"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Photo Card Footer */}
                      <div className="p-3 bg-white dark:bg-zinc-900 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-zinc-800/80">
                        <span className="text-[11px] font-mono text-slate-700 dark:text-zinc-300 truncate">
                          {photo.filename}
                        </span>

                        {/* Move to Set Dropdown */}
                        <select
                          value={photo.collectionId || photo.collection_id || ''}
                          onChange={(e) =>
                            handleMovePhotoToCollection(photo.id, e.target.value || null)
                          }
                          className="text-[10px] font-mono bg-slate-100 dark:bg-zinc-800 rounded px-1.5 py-0.5 outline-none text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 max-w-[90px]"
                        >
                          <option value="">No Set</option>
                          {collections.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 2: GALLERY DETAILS
            ========================================================= */}
        {activeTab === 'details' && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 space-y-8 shadow-sm">
            <div className="border-b border-slate-100 dark:border-zinc-900 pb-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-semibold">
                Studio Metadata
              </p>
              <h2 className="text-2xl font-light text-slate-900 dark:text-white mt-1">
                Gallery Details & Client Assignment
              </h2>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  Gallery Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Safaricom Spark Accelerator Demo Day 2026"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm font-mono rounded-xl focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* Category & Client Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                    Service Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono rounded-xl focus:border-purple-600 focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Client Dropdown (Live from CRM) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-mono text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                      Assigned Client
                    </label>
                    <Link
                      href="/admin/clients"
                      className="text-[10px] font-mono text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      + Manage Clients
                    </Link>
                  </div>
                  <select
                    value={clientId}
                    onChange={(e) => {
                      setClientId(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono rounded-xl focus:border-purple-600 focus:outline-none"
                  >
                    <option value="">-- No Client Assigned (Public/Direct) --</option>
                    {availableClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Slug / URL */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  Custom Share Slug / URL
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-3 bg-slate-100 dark:bg-zinc-800/80 border border-r-0 border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-500 rounded-l-xl">
                    /portal/g/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]+/g, '-'));
                      setIsDirty(true);
                    }}
                    placeholder="demo-day-2026"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono rounded-r-xl focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Full Link: <span className="text-purple-600 dark:text-purple-400">{publicUrl}</span>
                </p>
              </div>

              {/* Description / Welcome Message */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  Gallery Description / Welcome Note
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Welcome! Review the high-resolution images from the demo day shoot. Use the heart icon to select proofs."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono rounded-xl focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-900 flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="px-6 py-3 btn-primary text-xs font-mono uppercase tracking-widest rounded-xl flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Gallery Details</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: COVER IMAGE
            ========================================================= */}
        {activeTab === 'cover' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Visual Cover Banner Preview */}
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm space-y-4 p-6">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-semibold">
                  Client Header Preview
                </p>
                <h3 className="text-xl font-light text-slate-900 dark:text-white mt-1">
                  How clients see your gallery cover
                </h3>
              </div>

              {/* Banner Mock */}
              <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10 flex items-end p-6 md:p-10">
                {activeCoverPhoto ? (
                  <Image
                    src={
                      activeCoverPhoto.displayUrl ||
                      activeCoverPhoto.display_url ||
                      activeCoverPhoto.originalUrl ||
                      activeCoverPhoto.original_url ||
                      ''
                    }
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 font-mono text-xs">
                    No cover image selected
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="relative z-10 space-y-2 text-white">
                  <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-mono uppercase rounded-full">
                    {category}
                  </span>
                  <h2 className="text-2xl md:text-4xl font-light">{title || 'Your Gallery Title'}</h2>
                  <p className="text-xs font-mono text-zinc-300">
                    {selectedClient?.name || 'Private Client Portfolio'} •{' '}
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Select from Gallery Photos */}
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                    Select Cover Photo
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Click on any photo below to set it as the primary cover image.
                  </p>
                </div>
              </div>

              {photos.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-center">
                  <p className="text-xs font-mono text-slate-500">
                    No photos uploaded yet. Upload photos in the Photos tab to choose a cover.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {photos.map((photo) => {
                    const isCover = (coverPhotoId || gallery?.cover_photo_id) === photo.id;
                    const imgUrl =
                      photo.displayUrl || photo.display_url || photo.originalUrl || photo.original_url || '';

                    return (
                      <button
                        key={photo.id}
                        onClick={() => handleSetCoverPhoto(photo.id)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition ${isCover
                            ? 'border-amber-500 ring-4 ring-amber-500/20 scale-95'
                            : 'border-transparent hover:border-purple-500'
                          }`}
                      >
                        <Image
                          src={imgUrl}
                          alt="Thumbnail"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {isCover && (
                          <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                            <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-mono uppercase font-bold rounded-full flex items-center gap-1 shadow">
                              <Star className="w-2.5 h-2.5 fill-current" /> Cover
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: SETTINGS & ACCESS
            ========================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 space-y-8 shadow-sm">
            <div className="border-b border-slate-100 dark:border-zinc-900 pb-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-semibold">
                Access & Security
              </p>
              <h2 className="text-2xl font-light text-slate-900 dark:text-white mt-1">
                Privacy, Downloads & Proofing Limits
              </h2>
            </div>

            <div className="space-y-6">
              {/* Published Status Toggle */}
              <div className="p-5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Publish Status
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                    {status === 'published'
                      ? 'Gallery is LIVE and accessible to clients via secret link.'
                      : 'Gallery is in DRAFT mode and hidden from public access.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStatus(status === 'published' ? 'draft' : 'published');
                    setIsDirty(true);
                  }}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-widest rounded-xl transition ${status === 'published'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'btn-secondary'
                    }`}
                >
                  {status === 'published' ? '✓ Published' : 'Draft Only'}
                </button>
              </div>

              {/* 4-Digit Access PIN */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-purple-600" />
                  <span>4-Digit Access & Download PIN</span>
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={accessPin}
                    onChange={(e) => {
                      setAccessPin(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="4821"
                    className="w-44 px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center tracking-[0.4em] text-lg font-mono rounded-xl focus:border-purple-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
                      setAccessPin(newPin);
                      setIsDirty(true);
                      showToast(`Generated new PIN: ${newPin}`);
                    }}
                    className="px-4 py-3 btn-secondary text-xs font-mono rounded-xl"
                  >
                    Random PIN
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Clients must enter this PIN to unlock the gallery and download photos.
                </p>
              </div>

              {/* Permission Toggles */}
              <div className="space-y-4 border-t border-slate-100 dark:border-zinc-900 pt-6">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Client Permissions & Proofing
                </p>

                {/* Downloads */}
                <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-200 dark:border-zinc-800 cursor-pointer">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-900 dark:text-white font-mono">
                      Allow Full-Res & ZIP Downloads
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Clients can download individual images or full collections
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowDownloads}
                    onChange={(e) => {
                      setAllowDownloads(e.target.checked);
                      setIsDirty(true);
                    }}
                    className="w-5 h-5 accent-purple-600 rounded"
                  />
                </label>

                {/* Favorites */}
                <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-200 dark:border-zinc-800 cursor-pointer">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-900 dark:text-white font-mono">
                      Allow Client Favorites
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Clients can mark favorite photos with heart icons
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowFavorites}
                    onChange={(e) => {
                      setAllowFavorites(e.target.checked);
                      setIsDirty(true);
                    }}
                    className="w-5 h-5 accent-purple-600 rounded"
                  />
                </label>

                {/* Proofing Selections */}
                <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-200 dark:border-zinc-800 cursor-pointer">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-900 dark:text-white font-mono">
                      Allow Client Proof Selections
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Clients can submit final selects for retouching and delivery
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowSelections}
                    onChange={(e) => {
                      setAllowSelections(e.target.checked);
                      setIsDirty(true);
                    }}
                    className="w-5 h-5 accent-purple-600 rounded"
                  />
                </label>
              </div>

              {/* Save Settings */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-900 flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="px-6 py-3 btn-primary text-xs font-mono uppercase tracking-widest rounded-xl flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Privacy & Permissions</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 5: CLIENT ACTIVITY & PROOFS
            ========================================================= */}
        {activeTab === 'activity' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-1 shadow-sm">
                <p className="text-xs font-mono uppercase text-red-500 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  Client Favorites
                </p>
                <p className="text-3xl font-light text-slate-900 dark:text-white">
                  {photos.filter((p) => p.isFavorite || p.is_favorite).length}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">photos favorited</p>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-1 shadow-sm">
                <p className="text-xs font-mono uppercase text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Selected Selects
                </p>
                <p className="text-3xl font-light text-slate-900 dark:text-white">
                  {photos.filter((p) => p.isSelected || p.is_selected).length}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">proofs approved</p>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-1 shadow-sm">
                <p className="text-xs font-mono uppercase text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Downloads
                </p>
                <p className="text-3xl font-light text-slate-900 dark:text-white">
                  {allowDownloads ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">PIN protection active</p>
              </div>
            </div>

            {/* Proofs List */}
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                Client Selected Photos
              </h3>

              {photos.filter((p) => p.isFavorite || p.is_favorite || p.isSelected || p.is_selected).length === 0 ? (
                <div className="p-8 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-center">
                  <p className="text-xs font-mono text-slate-500">
                    No client selections or favorites received yet. Share the gallery link with your client.
                  </p>
                  <button
                    onClick={copyShareLink}
                    className="mt-4 px-4 py-2 btn-secondary text-xs font-mono rounded-lg"
                  >
                    Copy Share Link
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {photos
                    .filter((p) => p.isFavorite || p.is_favorite || p.isSelected || p.is_selected)
                    .map((photo) => (
                      <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border">
                        <Image
                          src={photo.displayUrl || photo.display_url || photo.originalUrl || photo.original_url || ''}
                          alt={photo.filename}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute bottom-1 right-1 flex gap-1">
                          {(photo.isFavorite || photo.is_favorite) && (
                            <span className="p-1 bg-red-500 text-white rounded-full">
                              <Heart className="w-2.5 h-2.5 fill-current" />
                            </span>
                          )}
                          {(photo.isSelected || photo.is_selected) && (
                            <span className="p-1 bg-purple-600 text-white rounded-full">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================
          MODAL 1: ADD / CREATE COLLECTION
          ========================================================= */}
      {isAddCollectionOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-900 pb-3">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                Create New Collection
              </h3>
              <button
                onClick={() => setIsAddCollectionOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-700 dark:text-zinc-300">
                  Collection / Set Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Highlights, Keynotes, Behind the Scenes"
                  value={newCollectionTitle}
                  onChange={(e) => setNewCollectionTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono rounded-xl focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-700 dark:text-zinc-300">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Executive portraits and stage presentation"
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono rounded-xl focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCollectionOpen(false)}
                  className="flex-1 py-3 btn-secondary text-xs font-mono rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 btn-primary text-xs font-mono uppercase tracking-wider rounded-xl"
                >
                  Create Set
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: EDIT / RENAME COLLECTION
          ========================================================= */}
      {editingCollection && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-900 pb-3">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                Rename Collection
              </h3>
              <button
                onClick={() => setEditingCollection(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-700 dark:text-zinc-300">
                  Collection Title
                </label>
                <input
                  type="text"
                  value={editCollectionTitle}
                  onChange={(e) => setEditCollectionTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono rounded-xl focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCollection(null)}
                  className="flex-1 py-3 btn-secondary text-xs font-mono rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateCollection(editingCollection.id)}
                  className="flex-1 py-3 btn-primary text-xs font-mono uppercase tracking-wider rounded-xl"
                >
                  Save Title
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: ADD PHOTO URL / PRESETS
          ========================================================= */}
      {isAddPhotoUrlOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-900 pb-3">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                Add Photo by URL or Sample Preset
              </h3>
              <button
                onClick={() => setIsAddPhotoUrlOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sample Presets Quick Pick */}
            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                1-Click Sample Presets:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_PHOTO_PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => {
                      handleAddSamplePreset(preset);
                      setIsAddPhotoUrlOpen(false);
                    }}
                    className="p-2 border border-slate-200 dark:border-zinc-800 rounded-xl hover:border-purple-500 text-left flex items-center gap-2 group transition"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
                      <Image src={preset.url} alt={preset.title} fill className="object-cover" unoptimized />
                    </div>
                    <span className="text-[11px] font-mono text-slate-700 dark:text-zinc-300 truncate">
                      {preset.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct URL Form */}
            <form onSubmit={handleAddCustomUrlPhoto} className="space-y-4 border-t border-slate-100 dark:border-zinc-900 pt-4">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Or Direct Image URL:
              </p>

              <div className="space-y-2">
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono rounded-xl focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Photo Title / Label (e.g. Field Shot 01)"
                  value={photoTitleInput}
                  onChange={(e) => setPhotoTitleInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono rounded-xl focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPhotoUrlOpen(false)}
                  className="flex-1 py-3 btn-secondary text-xs font-mono rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 btn-primary text-xs font-mono uppercase tracking-wider rounded-xl"
                >
                  Add Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

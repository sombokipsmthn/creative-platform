'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';

interface GalleryDefaults {
  defaultPhotoSelectionLimit: number;
  defaultExpirationDays: number;
  defaultMasterPin: string;
  defaultAllowDownloads: boolean;
  defaultAllowFavorites: boolean;
  defaultAllowSelections: boolean;
  defaultRequirePin: boolean;
}

const emptyGalleryDefaults: GalleryDefaults = {
  defaultPhotoSelectionLimit: 25,
  defaultExpirationDays: 60,
  defaultMasterPin: '4821',
  defaultAllowDownloads: true,
  defaultAllowFavorites: true,
  defaultAllowSelections: true,
  defaultRequirePin: false,
};

export default function AdminGalleryDefaultsPage() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  const { data: defaultsData, isLoading, isError, error } = useQuery({
    queryKey: ['gallery-defaults'],
    queryFn: async () => {
      if (!user) return null;
      const response = await fetch('/api/gallery-defaults', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load gallery defaults');
      return response.json();
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const [galleryDefaults, setGalleryDefaults] = useState<GalleryDefaults>(emptyGalleryDefaults);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !user || !defaultsData) return;

    const d = defaultsData.defaults;
    setGalleryDefaults({
      defaultPhotoSelectionLimit: d.defaultPhotoSelectionLimit || 25,
      defaultExpirationDays: d.defaultExpirationDays || 60,
      defaultMasterPin: d.defaultMasterPin || '4821',
      defaultAllowDownloads: d.defaultAllowDownloads !== undefined ? d.defaultAllowDownloads : true,
      defaultAllowFavorites: d.defaultAllowFavorites !== undefined ? d.defaultAllowFavorites : true,
      defaultAllowSelections: d.defaultAllowSelections !== undefined ? d.defaultAllowSelections : true,
      defaultRequirePin: d.defaultRequirePin !== undefined ? d.defaultRequirePin : false,
    });
  }, [isLoading, user, defaultsData]);

  const update = (key: keyof GalleryDefaults, value: any) => {
    setGalleryDefaults(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/gallery-defaults', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(galleryDefaults),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to save gallery defaults');
      }

      setMessage('Gallery defaults saved successfully.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Save gallery defaults error:', err);
      setMessage(err instanceof Error ? err.message : 'Failed to save gallery defaults');
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  if (isPending || isLoading) {
    return (
      <main className="min-h-screen flex min-h-[70vh] items-center justify-center">
        <div className="os-pulse flex items-center gap-3">
          <span className="os-icon-box h-9 w-9" />
          <p className="text-sm text-muted-foreground uppercase">Loading gallery defaults</p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-7xl py-8 sm:py-10">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2">
              Try again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen min-h-screen">
      <div className="mx-auto w-full max-w-7xl py-8 sm:py-10">
        <AdminPageHeader
          title="Gallery Defaults"
          description="Pre-fill settings when creating new private client galleries. These are workspace-level defaults; per-gallery overrides remain independent."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          tabs={[
            { label: 'Account & Profile', href: '/admin/settings/profile', active: false },
            { label: 'Workspace Branding', href: '/admin/settings/branding', active: false },
            { label: 'Business Preferences', href: '/admin/settings/business', active: false },
            { label: 'Gallery Defaults', href: '/admin/settings/gallery-defaults', active: true },
          ]}
        />

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* Gallery Default Settings */}
          <section className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Gallery Default Settings</p>
            <h2 className="text-2xl font-semibold tracking-tight">Default settings for new galleries</h2>
            <p className="text-sm text-muted-foreground mt-2">These defaults apply to new galleries. Existing gallery settings are not affected.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium leading-none">Default Photo Selection Limit</label>
                <Input
                  type="number"
                  value={galleryDefaults.defaultPhotoSelectionLimit}
                  onChange={(e) => update('defaultPhotoSelectionLimit', Number(e.target.value))}
                  min={1}
                  max={200}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium leading-none">Default Expiration (Days)</label>
                <Input
                  type="number"
                  value={galleryDefaults.defaultExpirationDays}
                  onChange={(e) => update('defaultExpirationDays', Number(e.target.value))}
                  min={1}
                  max={365}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium leading-none">Default Master PIN</label>
                <Input
                  type="text"
                  value={galleryDefaults.defaultMasterPin}
                  onChange={(e) => update('defaultMasterPin', e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium leading-none">Allow Downloads</label>
                <Input
                  type="checkbox"
                  checked={galleryDefaults.defaultAllowDownloads}
                  onChange={(e) => update('defaultAllowDownloads', e.target.checked)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium leading-none">Allow Favorites</label>
                <Input
                  type="checkbox"
                  checked={galleryDefaults.defaultAllowFavorites}
                  onChange={(e) => update('defaultAllowFavorites', e.target.checked)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium leading-none">Allow Selections/Proofing</label>
                <Input
                  type="checkbox"
                  checked={galleryDefaults.defaultAllowSelections}
                  onChange={(e) => update('defaultAllowSelections', e.target.checked)}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium leading-none">Require PIN for Access</label>
                <Input
                  type="checkbox"
                  checked={galleryDefaults.defaultRequirePin}
                  onChange={(e) => update('defaultRequirePin', e.target.checked)}
                />
              </div>
            </div>
          </section>

          {/* Save Action */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {message ? (
              <p className="text-sm text-muted-foreground">{message}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Changes are saved to your authenticated creator account.
              </p>
            )}

            <Button
              type="submit"
              disabled={isSaving}
              variant="primary"
              className="px-6 py-3 text-xs font-sans uppercase tracking-widest w-full sm:w-auto"
            >
              {isSaving ? 'Saving…' : 'Save Gallery Defaults'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
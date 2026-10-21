'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';

interface ProfileForm {
  name: string;
  handle: string;
  email: string;
  phone: string;
  kraPin: string;
  location: string;
  bio: string;
  website: string;
  businessName: string;
  avatarUrl: string;
}

const emptyProfile: ProfileForm = {
  name: '',
  handle: '',
  email: '',
  phone: '',
  kraPin: '',
  location: '',
  bio: '',
  website: '',
  businessName: '',
  avatarUrl: '',
};

export default function AdminProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [passkeyName, setPasskeyName] = useState("");
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  async function registerPasskey() {
    setPasskeyLoading(true);
    setMessage(null);
    const result = await authClient.passkey.addPasskey({ name: passkeyName.trim() || "My passkey" });
    if (result.error) setMessage("Passkey registration failed. Use a supported device and try again.");
    else {
      setPasskeyName("");
      setMessage("Passkey registered. You can use it to sign in next time.");
    }
    setPasskeyLoading(false);
  }

  useEffect(() => {
    if (isPending || !user) return;

    const sessionUser = user;
    let ignore = false;

    async function loadProfile() {
      setIsLoading(true);
      setMessage(null);

      try {
        const response = await fetch('/api/profile', { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to load profile');
        }

        if (ignore) return;

        setProfile({
          name: data?.user?.name || sessionUser.name || '',
          handle: data?.user?.handle || '',
          email: data?.user?.email || sessionUser.email || '',
          phone: data?.businessProfile?.phone || '',
          kraPin: data?.businessProfile?.kraPin || '',
          location: data?.profile?.location || '',
          bio: data?.profile?.bio || '',
          website: data?.profile?.website || '',
          businessName: data?.businessProfile?.businessName || '',
          avatarUrl: data?.profile?.avatarUrl || sessionUser.image || '',
        });
      } catch (error) {
        console.error('Failed to load creator profile:', error);
        if (!ignore) {
          setMessage(error instanceof Error ? error.message : 'Failed to load profile');
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadProfile();

    return () => {
      ignore = true;
    };
  }, [isPending, user]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            name: profile.name.trim(),
            handle: profile.handle.trim(),
          },
          profile: {
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
            website: profile.website,
            location: profile.location,
          },
          businessProfile: {
            businessName: profile.businessName,
            phone: profile.phone,
            kraPin: profile.kraPin,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to save profile');
      }

      setMessage('Profile saved successfully.');
    } catch (error) {
      console.error('Save profile error:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <main className="min-h-screen flex min-h-[70vh] items-center justify-center">
        <div className="os-pulse flex items-center gap-3">
          <span className="os-icon-box h-9 w-9" />
          <p className="text-sm text-muted-foreground uppercase">
            Loading creator profile
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = profile.name || user.name || 'Creator';
  const avatar = profile.avatarUrl || user.image;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase() || 'C';

  const update = (key: keyof ProfileForm, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  return (
    <main className="min-h-screen min-h-screen">
      <div className="mx-auto w-full max-w-7xl py-8 sm:py-10">
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-xs font-medium uppercase tracking-widest text-muted-foreground hover:underline"
            >
              ← Back to Dashboard
            </Link>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mt-3">Account</p>
            <h1 className="text-3xl font-semibold tracking-tight">Creator Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your identity, public profile, and business details.
            </p>
          </div>

          <span className="ui-badge">
            <span className="ui-badge-dot bg-emerald-500" />
            Authenticated creator
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <section className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={displayName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-slate-400 dark:text-zinc-500">
                    {initials}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Current account</p>
                <h2 className="mt-1 truncate text-2xl font-semibold tracking-tight">
                  {displayName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profile.email || user.email || 'No email available'}
                </p>
                {profile.handle && (
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mt-1">
                    @{profile.handle}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Account security</p>
            <h2 className="text-2xl font-semibold tracking-tight">Passkeys</h2>
            <p className="text-sm text-muted-foreground mt-2">Register this device or a security key for passwordless sign-in.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Input value={passkeyName} onChange={(event) => setPasskeyName(event.target.value)} placeholder="Passkey name (optional)" className="flex-1" disabled={passkeyLoading} />
              <Button type="button" onClick={() => void registerPasskey()} disabled={passkeyLoading || typeof window !== "undefined" && !window.PublicKeyCredential} variant="primary">{passkeyLoading ? "Registering…" : "Register passkey"}</Button>
            </div>
          </section>
          <section className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="border-b border-slate-200 dark:border-zinc-800 px-5 py-4 sm:px-7">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Identity</p>
              <h2 className="text-2xl font-semibold tracking-tight">Creator details</h2>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              <label htmlFor="profile-full-name" className="space-y-1.5">
                <span className="text-sm font-medium leading-none">Full name</span>
                <input
                  id="profile-full-name"
                  type="text"
                  value={profile.name}
                  onChange={(event) => update('name', event.target.value)}
                  required
                  className="ui-input"
                />
              </label>

              <label htmlFor="profile-handle" className="space-y-1.5">
                <span className="text-sm font-medium leading-none">Creator handle</span>
                <input
                  id="profile-handle"
                  type="text"
                  value={profile.handle}
                  onChange={(event) => update('handle', event.target.value)}
                  placeholder="yourhandle"
                  className="ui-input"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium leading-none">Email address</span>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="ui-input cursor-not-allowed opacity-70"
                />
                <span className="text-sm text-muted-foreground">
                  Managed by Better Auth.
                </span>
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium leading-none">Phone number</span>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  placeholder="+254 ..."
                  className="ui-input"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium leading-none">Business name</span>
                <input
                  type="text"
                  value={profile.businessName}
                  onChange={(event) => update('businessName', event.target.value)}
                  placeholder="Studio or business name"
                  className="ui-input"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-sm font-medium leading-none">KRA PIN</span>
                <input
                  type="text"
                  value={profile.kraPin}
                  onChange={(event) => update('kraPin', event.target.value)}
                  placeholder="P000000000X"
                  className="ui-input"
                />
              </label>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-sm font-medium leading-none">Location</span>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(event) => update('location', event.target.value)}
                  placeholder="Nairobi, Kenya"
                  className="ui-input"
                />
              </label>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-sm font-medium leading-none">Profile avatar URL</span>
                <input
                  type="url"
                  value={profile.avatarUrl}
                  onChange={(event) => update('avatarUrl', event.target.value)}
                  placeholder="https://..."
                  className="ui-input"
                />
              </label>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-sm font-medium leading-none">Website</span>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(event) => update('website', event.target.value)}
                  placeholder="https://..."
                  className="ui-input"
                />
              </label>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-sm font-medium leading-none">Public bio</span>
                <textarea
                  rows={5}
                  value={profile.bio}
                  onChange={(event) => update('bio', event.target.value)}
                  placeholder="Tell clients about your creative work..."
                  className="ui-textarea min-h-32 resize-y"
                />
              </label>
            </div>
          </section>

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
              className="px-6 py-3 text-xs font-sans uppercase tracking-widest"
            >
              {isSaving ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

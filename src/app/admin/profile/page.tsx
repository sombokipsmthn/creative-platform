'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

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
  const { isLoaded, user } = useUser();
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const currentUser = user;
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
          name: data?.user?.name || currentUser.fullName || currentUser.firstName || '',
          handle: data?.user?.handle || currentUser.username || '',
          email: data?.user?.email || currentUser.primaryEmailAddress?.emailAddress || '',
          phone: data?.businessProfile?.phone || '',
          kraPin: data?.businessProfile?.kraPin || '',
          location: data?.profile?.location || '',
          bio: data?.profile?.bio || '',
          website: data?.profile?.website || '',
          businessName: data?.businessProfile?.businessName || '',
          avatarUrl: data?.profile?.avatarUrl || currentUser.imageUrl || '',
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
  }, [isLoaded, user]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) return;

    const currentUser = user;
    setIsSaving(true);
    setMessage(null);

    try {
      const nameParts = profile.name.trim().split(/\s+/).filter(Boolean);
      const firstName = nameParts.shift() || '';
      const lastName = nameParts.join(' ');

      // Keep Clerk identity and the local creator record aligned.
      await currentUser.update({
        firstName,
        lastName,
      });

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

  if (!isLoaded || isLoading) {
    return (
      <main className="os-page flex min-h-[70vh] items-center justify-center">
        <div className="os-pulse flex items-center gap-3">
          <span className="os-icon-box h-9 w-9" />
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Loading creator profile
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = profile.name || user.fullName || user.firstName || 'Creator';
  const avatar = profile.avatarUrl || user.imageUrl;
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
    <main className="os-page min-h-screen">
      <div className="os-shell py-8 sm:py-10">
        <div className="mb-8 flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--accent)] hover:underline"
            >
              ← Back to Dashboard
            </Link>
            <p className="os-eyebrow mt-3">Account</p>
            <h1 className="os-title text-2xl sm:text-3xl">Creator Profile</h1>
            <p className="os-subtitle">
              Your profile is connected to the signed-in Clerk account and your creator records.
            </p>
          </div>

          <span className="os-pill">
            <span className="os-pill-dot text-[var(--success)]" />
            Authenticated creator
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <section className="os-card p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-[var(--border-strong)] bg-[var(--bg-soft)]">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={displayName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-[var(--text-muted)]">
                    {initials}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="os-eyebrow">Current account</p>
                <h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {displayName}
                </h2>
                <p className="mt-1 truncate text-[11px] text-[var(--text-muted)]">
                  {profile.email || user.primaryEmailAddress?.emailAddress || 'No email available'}
                </p>
                {profile.handle && (
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--accent)]">
                    @{profile.handle}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="os-card">
            <div className="border-b border-[var(--border-subtle)] px-5 py-4 sm:px-7">
              <p className="os-eyebrow">Identity</p>
              <h2 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Creator details</h2>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              <label className="space-y-1.5">
                <span className="os-field-label">Full name</span>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(event) => update('name', event.target.value)}
                  required
                  className="os-input"
                />
              </label>

              <label className="space-y-1.5">
                <span className="os-field-label">Creator handle</span>
                <input
                  type="text"
                  value={profile.handle}
                  onChange={(event) => update('handle', event.target.value)}
                  placeholder="yourhandle"
                  className="os-input"
                />
              </label>

              <label className="space-y-1.5">
                <span className="os-field-label">Email address</span>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="os-input cursor-not-allowed opacity-70"
                />
                <span className="block text-[9px] text-[var(--text-faint)]">
                  Managed by Clerk authentication.
                </span>
              </label>

              <label className="space-y-1.5">
                <span className="os-field-label">Phone number</span>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  placeholder="+254 ..."
                  className="os-input"
                />
              </label>

              <label className="space-y-1.5">
                <span className="os-field-label">Business name</span>
                <input
                  type="text"
                  value={profile.businessName}
                  onChange={(event) => update('businessName', event.target.value)}
                  placeholder="Studio or business name"
                  className="os-input"
                />
              </label>

              <label className="space-y-1.5">
                <span className="os-field-label">KRA PIN</span>
                <input
                  type="text"
                  value={profile.kraPin}
                  onChange={(event) => update('kraPin', event.target.value)}
                  placeholder="P000000000X"
                  className="os-input"
                />
              </label>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="os-field-label">Location</span>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(event) => update('location', event.target.value)}
                  placeholder="Nairobi, Kenya"
                  className="os-input"
                />
              </label>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="os-field-label">Profile avatar URL</span>
                <input
                  type="url"
                  value={profile.avatarUrl}
                  onChange={(event) => update('avatarUrl', event.target.value)}
                  placeholder="https://..."
                  className="os-input"
                />
              </label>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="os-field-label">Website</span>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(event) => update('website', event.target.value)}
                  placeholder="https://..."
                  className="os-input"
                />
              </label>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="os-field-label">Public bio</span>
                <textarea
                  rows={5}
                  value={profile.bio}
                  onChange={(event) => update('bio', event.target.value)}
                  placeholder="Tell clients about your creative work..."
                  className="os-input min-h-32 resize-y"
                />
              </label>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {message ? (
              <p className="text-xs text-[var(--text-muted)]">{message}</p>
            ) : (
              <p className="text-[10px] text-[var(--text-faint)]">
                Changes are saved to your authenticated creator account.
              </p>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary rounded-xl px-6 py-3 font-mono text-[9px] uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

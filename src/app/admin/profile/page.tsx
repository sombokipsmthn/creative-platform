'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
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
      <main className="ui-page">
        <div className="os-pulse">
          <span className="os-icon-box" />
          <p className="ui-meta">
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
    <main className="ui-page">
      <div className="ui-shell">
        <AdminPageHeader
          title="Account & profile"
          description="Manage your personal account, public creator profile, and account security."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          primaryAction={<span className="ui-badge"><span className="ui-badge-dot" />Authenticated creator</span>}
        />

        <form onSubmit={handleSave} className="">
          <section className="ui-card">
            <div className="">
              <div className="">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={displayName}
                    fill
                    className=""
                    unoptimized
                  />
                ) : (
                  <div className="">
                    {initials}
                  </div>
                )}
              </div>

              <div className="">
                <p className="ui-eyebrow">Current account</p>
                <h2 className="ui-section-title">
                  {displayName}
                </h2>
                <p className="ui-meta">
                  {profile.email || user.email || 'No email available'}
                </p>
                {profile.handle && (
                  <p className="ui-eyebrow">
                    @{profile.handle}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="ui-card">
            <p className="ui-eyebrow">Account security</p>
            <h2 className="ui-section-title">Passkeys</h2>
            <p className="ui-meta">Register this device or a security key for passwordless sign-in.</p>
            <div className="">
              <input value={passkeyName} onChange={(event) => setPasskeyName(event.target.value)} placeholder="Passkey name (optional)" className="ui-input" disabled={passkeyLoading} />
              <button type="button" onClick={() => void registerPasskey()} disabled={passkeyLoading || typeof window !== "undefined" && !window.PublicKeyCredential} className="">{passkeyLoading ? "Registering…" : "Register passkey"}</button>
            </div>
          </section>
          <section className="ui-card">
            <div className="">
              <p className="ui-eyebrow">Public profile</p>
              <h2 className="ui-section-title">Creator presentation</h2>
            </div>

            <div className="">
              <label className="">
                <span className="ui-label">Full name</span>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(event) => update('name', event.target.value)}
                  required
                  className="ui-input"
                />
              </label>

              <label className="">
                <span className="ui-label">Creator handle</span>
                <input
                  type="text"
                  value={profile.handle}
                  onChange={(event) => update('handle', event.target.value)}
                  placeholder="yourhandle"
                  className="ui-input"
                />
              </label>

              <label className="">
                <span className="ui-label">Email address</span>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="ui-input"
                />
                <span className="ui-meta">
                  Managed by Better Auth.
                </span>
              </label>

              <label className="">
                <span className="ui-label">Phone number</span>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  placeholder="+254 ..."
                  className="ui-input"
                />
              </label>

              <label className="">
                <span className="ui-label">Business name</span>
                <input
                  type="text"
                  value={profile.businessName}
                  onChange={(event) => update('businessName', event.target.value)}
                  placeholder="Studio or business name"
                  className="ui-input"
                />
              </label>

              <label className="">
                <span className="ui-label">KRA PIN</span>
                <input
                  type="text"
                  value={profile.kraPin}
                  onChange={(event) => update('kraPin', event.target.value)}
                  placeholder="P000000000X"
                  className="ui-input"
                />
              </label>

              <label className="">
                <span className="ui-label">Location</span>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(event) => update('location', event.target.value)}
                  placeholder="Nairobi, Kenya"
                  className="ui-input"
                />
              </label>

              <label className="">
                <span className="ui-label">Profile avatar URL</span>
                <input
                  type="url"
                  value={profile.avatarUrl}
                  onChange={(event) => update('avatarUrl', event.target.value)}
                  placeholder="https://..."
                  className="ui-input"
                />
              </label>

              <label className="">
                <span className="ui-label">Website</span>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(event) => update('website', event.target.value)}
                  placeholder="https://..."
                  className="ui-input"
                />
              </label>

              <label className="">
                <span className="ui-label">Public bio</span>
                <textarea
                  rows={5}
                  value={profile.bio}
                  onChange={(event) => update('bio', event.target.value)}
                  placeholder="Tell clients about your creative work..."
                  className="ui-textarea"
                />
              </label>
            </div>
          </section>

          <div className="">
            {message ? (
              <p className="ui-meta">{message}</p>
            ) : (
              <p className="ui-meta">
                Changes are saved to your authenticated creator account.
              </p>
            )}

            <Button
              type="submit"
              disabled={isSaving}
              variant="primary"
              className=""
            >
              {isSaving ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

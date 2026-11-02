'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { DeviceMobile as Smartphone, Monitor, Key, CircleNotch as Loader2 } from "@phosphor-icons/react";

export default function AdminSecurityPage() {
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  // Session data
  const { data: sessionsData, isLoading, isError, error } = useQuery({
    queryKey: ['security-sessions'],
    queryFn: async () => {
      if (!user) return null;
      const response = await fetch('/api/admin/sessions', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load sessions');
      return response.json();
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [passkeyName, setPasskeyName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Passkey registration
  const registerPasskey = async () => {
    setIsSaving(true);
    try {
      const result = await authClient.passkey.addPasskey({ name: passkeyName.trim() || "My passkey" });
      if (result.error) {
        setMessage("Passkey registration failed. Use a supported device and try again.");
      } else {
        setPasskeyName("");
        setMessage("Passkey registered. You can use it to sign in next time.");
      }
    } catch (err) {
      setMessage("Passkey registration failed. Use a supported device and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Revoke session
  const revokeSession = async (sessionId: string) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/sessions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Failed to revoke session');
      setMessage('Session revoked successfully.');
      queryClient.invalidateQueries({ queryKey: ['security-sessions'] });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to revoke session');
      setTimeout(() => setMessage(null), 3000);
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
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 animate-pulse" />
          <p className="text-sm text-muted-foreground uppercase">Loading security settings</p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-7xl py-8 sm:py-10">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive dark:border-destructive/20 dark:bg-destructive/5 dark:text-destructive-foreground">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2">
              Try again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const activeSession = sessionsData?.sessions?.find((s: any) => s.current) || sessionsData?.sessions?.[0];
  const otherSessions = sessionsData?.sessions?.filter((s: any) => !s.current) || [];

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl py-8 sm:py-10">
        <AdminPageHeader
          title="Sign-in & Sessions"
          description="View and manage your authenticated sessions and sign-in methods."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          tabs={[
            { label: 'Account & Profile', href: '/admin/settings?tab=account-profile', active: false },
            { label: 'Business Preferences', href: '/admin/settings?tab=business-preferences', active: false },
            { label: 'Gallery Defaults', href: '/admin/settings?tab=gallery-delivery', active: false },
            { label: 'Notifications', href: '/admin/settings?tab=notifications', active: false },
            { label: 'Integrations', href: '/admin/settings?tab=integrations', active: false },
            { label: 'Sign-in & Sessions', href: '/admin/settings/security', active: true },
          ]}
        />

        <form className="space-y-8">
          {/* Active Session */}
          <section className="rounded-xl border bg-card shadow-sm p-5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Active Session</p>
            <h2 className="text-2xl font-semibold tracking-tight">Current device</h2>
            <p className="text-sm text-muted-foreground mt-2">The device you&apos;re currently using to access your account.</p>

            {activeSession && (
              <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{activeSession.device}</p>
                    <p className="text-xs text-muted-foreground">{activeSession.location} · {activeSession.lastActive}</p>
                  </div>
                </div>
                {activeSession.current && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Current</Badge>
                  </div>
                )}
              </div>
            )}

            {!activeSession && (
              <p className="text-sm text-muted-foreground">No active session found.</p>
            )}
          </section>

          {/* Session Management */}
          <section className="rounded-xl border bg-card shadow-sm p-5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Session Management</p>
            <h2 className="text-2xl font-semibold tracking-tight">Active sessions</h2>
            <p className="text-sm text-muted-foreground mt-2">View and manage devices currently signed into your account.</p>

            <div className="space-y-3">
              {/* Current session row */}
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{activeSession?.device || 'MacBook Pro · Chrome'}</p>
                    <p className="text-xs text-muted-foreground">{activeSession?.location || 'Nairobi, Kenya'} · {activeSession?.lastActive || '2 minutes ago'}</p>
                  </div>
                </div>
                {activeSession?.current && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Current</Badge>
                  </div>
                )}
              </div>

              {/* Other sessions */}
              {otherSessions.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm font-medium text-muted-foreground">Other active sessions</p>
                  <p className="text-xs text-muted-foreground mt-1">You have {otherSessions.length} other sessions active.</p>
                </div>
              )}

              {otherSessions.length > 0 && (
                <div className="mt-3">
                  {otherSessions.map((s: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <Monitor className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium">{s.device}</p>
                          <p className="text-xs text-muted-foreground">{s.location} · {s.lastActive}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => revokeSession(s.id)}
                          disabled={isSaving}
                          title="Revoke session"
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {otherSessions.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">No other sessions found.</p>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => window.location.reload()}
            >
              Sign out of all other sessions
            </Button>
          </section>

          {/* Passkey Management */}
          <section className="rounded-xl border bg-card shadow-sm p-5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Passkey Management</p>
            <h2 className="text-2xl font-semibold tracking-tight">Passwordless sign-in</h2>
            <p className="text-sm text-muted-foreground mt-2">Register this device or a security key for passwordless sign-in.</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
                placeholder="Passkey name (optional)"
                className="flex-1"
                disabled={isSaving}
              />
              <Button
                type="button"
                onClick={registerPasskey}
                disabled={isSaving || typeof window !== "undefined" && !window.PublicKeyCredential}
                variant="primary"
              >
                {isSaving ? 'Registering…' : 'Register passkey'}
              </Button>
            </div>

            {message && (
              <p className={`text-sm mt-2 ${message.includes('error') ? 'text-destructive' : 'text-success-foreground'}`}>{message}</p>
            )}
          </section>
        </form>
      </div>
    </main>
  );
}
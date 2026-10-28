'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { Envelope as Mail, ChatText as MessageSquare, Bell, FileText, CreditCard } from "@phosphor-icons/react";

interface NotificationPreferences {
  gallerySelections: boolean;
  galleryComments: boolean;
  galleryShares: boolean;
  galleryApprovals: boolean;
  contractSigned: boolean;
  contractViewed: boolean;
  contractDeclined: boolean;
  invoicePaid: boolean;
  invoiceOverdue: boolean;
  paymentReceived: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
}

const emptyPreferences: NotificationPreferences = {
  gallerySelections: true,
  galleryComments: true,
  galleryShares: true,
  galleryApprovals: true,
  contractSigned: true,
  contractViewed: true,
  contractDeclined: true,
  invoicePaid: true,
  invoiceOverdue: true,
  paymentReceived: true,
  emailEnabled: true,
  inAppEnabled: true,
};

interface NotificationEvent {
  key: keyof Omit<NotificationPreferences, 'emailEnabled' | 'inAppEnabled'>;
  label: string;
  description: string;
  category: 'gallery' | 'contracts' | 'payments';
}

const notificationEvents: NotificationEvent[] = [
  { key: 'gallerySelections', label: 'Client selects photos', description: 'When a client makes selections in a gallery', category: 'gallery' },
  { key: 'galleryComments', label: 'Client comments on photos', description: 'When a client leaves a comment on a photo', category: 'gallery' },
  { key: 'galleryShares', label: 'Gallery is shared', description: 'When a gallery link is shared with others', category: 'gallery' },
  { key: 'galleryApprovals', label: 'Gallery approval requested', description: 'When a client requests approval for selections', category: 'gallery' },
  { key: 'contractSigned', label: 'Contract signed', description: 'When a client signs a contract', category: 'contracts' },
  { key: 'contractViewed', label: 'Contract viewed', description: 'When a client views a contract', category: 'contracts' },
  { key: 'contractDeclined', label: 'Contract declined', description: 'When a client declines a contract', category: 'contracts' },
  { key: 'invoicePaid', label: 'Invoice paid', description: 'When an invoice is marked as paid', category: 'payments' },
  { key: 'invoiceOverdue', label: 'Invoice overdue', description: 'When an invoice becomes overdue', category: 'payments' },
  { key: 'paymentReceived', label: 'Payment received', description: 'When a payment is received', category: 'payments' },
];

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  const { data: prefsData, isLoading, isError, error } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      if (!user) return null;
      const response = await fetch('/api/notifications', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load notification preferences');
      return response.json();
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const [preferences, setPreferences] = useState<NotificationPreferences>(emptyPreferences);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isLoading || !user || !prefsData) return;
    setPreferences({
      gallerySelections: prefsData.preferences?.gallerySelections ?? true,
      galleryComments: prefsData.preferences?.galleryComments ?? true,
      galleryShares: prefsData.preferences?.galleryShares ?? true,
      galleryApprovals: prefsData.preferences?.galleryApprovals ?? true,
      contractSigned: prefsData.preferences?.contractSigned ?? true,
      contractViewed: prefsData.preferences?.contractViewed ?? true,
      contractDeclined: prefsData.preferences?.contractDeclined ?? true,
      invoicePaid: prefsData.preferences?.invoicePaid ?? true,
      invoiceOverdue: prefsData.preferences?.invoiceOverdue ?? true,
      paymentReceived: prefsData.preferences?.paymentReceived ?? true,
      emailEnabled: prefsData.preferences?.emailEnabled ?? true,
      inAppEnabled: prefsData.preferences?.inAppEnabled ?? true,
    });
  }, [isLoading, user, prefsData]);

  const update = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const saveMutation = useMutation({
    mutationFn: async (prefs: NotificationPreferences) => {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Failed to save notification preferences');
      return result;
    },
    onSuccess: () => {
      setMessage('Notification preferences saved successfully.');
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err) => {
      setMessage(err instanceof Error ? err.message : 'Failed to save notification preferences');
      setTimeout(() => setMessage(null), 5000);
    },
    onSettled: () => setIsSaving(false),
  });

  const handleSave = () => {
    setIsSaving(true);
    saveMutation.mutate(preferences);
  };

  const toggleAll = (enabled: boolean) => {
    const updates: Partial<NotificationPreferences> = {};
    notificationEvents.forEach(event => {
      updates[event.key] = enabled;
    });
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  if (!user) {
    return null;
  }

  if (isPending || isLoading) {
    return (
      <main className="min-h-screen flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 animate-pulse" />
          <p className="text-sm text-muted-foreground uppercase">Loading notification preferences</p>
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

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl py-8 sm:py-10">
        <AdminPageHeader
          title="Notifications"
          description="Configure which events trigger notifications and choose your preferred delivery channels."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          tabs={[
            { label: 'Account & Profile', href: '/admin/settings?tab=account-profile', active: false },
            { label: 'Business Preferences', href: '/admin/settings/business', active: false },
            { label: 'Gallery Defaults', href: '/admin/settings/gallery-defaults', active: false },
            { label: 'Notifications', href: '/admin/settings/notifications', active: true },
            { label: 'Integrations', href: '/admin/settings/integrations', active: false },
            { label: 'Sign-in & Sessions', href: '/admin/settings/security', active: false },
          ]}
        />

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* Delivery Channels */}
          <section className="rounded-xl border bg-card shadow-sm p-5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Delivery Channels</p>
            <h2 className="text-2xl font-semibold tracking-tight">How you receive notifications</h2>
            <p className="text-sm text-muted-foreground mt-2">Enable or disable each delivery channel. Disabling a channel prevents all notifications through that channel.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email notifications</p>
                    <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailEnabled}
                    onChange={(e) => update('emailEnabled', e.target.checked)}
                    className="h-5 w-5 accent-primary"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">In-app notifications</p>
                    <p className="text-xs text-muted-foreground">Receive notifications within the platform</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.inAppEnabled}
                    onChange={(e) => update('inAppEnabled', e.target.checked)}
                    className="h-5 w-5 accent-primary"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Event Preferences - Gallery */}
          <section className="rounded-xl border bg-card shadow-sm p-5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Gallery Events</p>
            <h2 className="text-2xl font-semibold tracking-tight">Gallery activity notifications</h2>
            <p className="text-sm text-muted-foreground mt-2">Choose which gallery events trigger notifications.</p>

            <div className="space-y-3 mt-4">
              {notificationEvents
                .filter(e => e.category === 'gallery')
                .map((event) => (
                  <div key={event.key} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Bell className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{event.label}</p>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences[event.key]}
                        onChange={(e) => update(event.key, e.target.checked)}
                        className="h-5 w-5 accent-primary"
                      />
                    </label>
                  </div>
                ))}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => toggleAll(true)}>Enable all</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => toggleAll(false)}>Disable all</Button>
            </div>
          </section>

          {/* Event Preferences - Contracts */}
          <section className="rounded-xl border bg-card shadow-sm p-5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Contract Events</p>
            <h2 className="text-2xl font-semibold tracking-tight">Contract lifecycle notifications</h2>
            <p className="text-sm text-muted-foreground mt-2">Choose which contract events trigger notifications.</p>

            <div className="space-y-3 mt-4">
              {notificationEvents
                .filter(e => e.category === 'contracts')
                .map((event) => (
                  <div key={event.key} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{event.label}</p>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences[event.key]}
                        onChange={(e) => update(event.key, e.target.checked)}
                        className="h-5 w-5 accent-primary"
                      />
                    </label>
                  </div>
                ))}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => toggleAll(true)}>Enable all</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => toggleAll(false)}>Disable all</Button>
            </div>
          </section>

          {/* Event Preferences - Payments */}
          <section className="rounded-xl border bg-card shadow-sm p-5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Payment Events</p>
            <h2 className="text-2xl font-semibold tracking-tight">Invoice and payment notifications</h2>
            <p className="text-sm text-muted-foreground mt-2">Choose which payment events trigger notifications.</p>

            <div className="space-y-3 mt-4">
              {notificationEvents
                .filter(e => e.category === 'payments')
                .map((event) => (
                  <div key={event.key} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{event.label}</p>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences[event.key]}
                        onChange={(e) => update(event.key, e.target.checked)}
                        className="h-5 w-5 accent-primary"
                      />
                    </label>
                  </div>
                ))}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button type="button" variant="ghost" size="sm" onClick={() => toggleAll(true)}>Enable all</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => toggleAll(false)}>Disable all</Button>
            </div>
          </section>

          {/* Save Action */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {message && <p className={`text-sm ${message.includes('error') ? 'text-destructive' : 'text-success-foreground'}`}>{message}</p>}
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              variant="primary"
              className="px-6 py-3 text-xs font-sans uppercase tracking-widest w-full sm:w-auto"
            >
              {isSaving ? 'Saving…' : 'Save Notification Preferences'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
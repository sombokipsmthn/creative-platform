'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';

interface BusinessPreferences {
  kraPin: string;
  defaultCurrency: string;
  defaultWhtRate: string;
  defaultPaymentTerms: string;
  invoicePrefix: string;
  quotePrefix: string;
}

const emptyBusinessPrefs: BusinessPreferences = {
  kraPin: '',
  defaultCurrency: 'KES',
  defaultWhtRate: '5%',
  defaultPaymentTerms: '30',
  invoicePrefix: 'INV',
  quotePrefix: 'QTE',
};

export default function AdminBusinessPreferencesPage() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  const { data: businessData, isLoading, isError, error } = useQuery({
    queryKey: ['business-preferences'],
    queryFn: async () => {
      if (!user) return null;
      const response = await fetch('/api/business-preferences', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load business preferences');
      return response.json();
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const [businessPrefs, setBusinessPrefs] = useState<BusinessPreferences>(emptyBusinessPrefs);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !user || !businessData) return;

    setBusinessPrefs({
      kraPin: businessData.preferences?.kraPin || '',
      defaultCurrency: businessData.preferences?.currency || 'KES',
      defaultWhtRate: businessData.preferences?.whtRate !== undefined
        ? (businessData.preferences.whtRate === 0 ? '0%' : `${businessData.preferences.whtRate}%`)
        : '5%',
      defaultPaymentTerms: businessData.preferences?.defaultPaymentTerms || '30',
      invoicePrefix: businessData.preferences?.invoicePrefix || 'INV',
      quotePrefix: businessData.preferences?.quotePrefix || 'QTE',
    });
  }, [isLoading, user, businessData]);

  const update = (key: keyof BusinessPreferences, value: string) => {
    setBusinessPrefs(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/business-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessPrefs),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || 'Failed to save business preferences');
      }

      setMessage('Business preferences saved successfully.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Save business preferences error:', err);
      setMessage(err instanceof Error ? err.message : 'Failed to save business preferences');
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
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 animate-pulse" />
          <p className="text-sm text-muted-foreground uppercase">Loading business preferences</p>
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
          title="Business Preferences"
          description="Configure currency, tax settings, KRA PIN, and document numbering defaults."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          tabs={[
            { label: 'Account & Profile', href: '/admin/settings?tab=account-profile', active: false },
            { label: 'Business Preferences', href: '/admin/settings/business', active: true },
            { label: 'Gallery Defaults', href: '/admin/settings/gallery-defaults', active: false },
            { label: 'Notifications', href: '/admin/settings/notifications', active: false },
            { label: 'Integrations', href: '/admin/settings/integrations', active: false },
            { label: 'Sign-in & Sessions', href: '/admin/settings/security', active: false },
          ]}
        />

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* Kenyan Tax & Business Settings */}
          <section className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Kenyan Tax & Business Settings</p>
            <h2 className="text-2xl font-semibold tracking-tight">Currency, tax settings, and KRA PIN</h2>
            <p className="text-sm text-muted-foreground mt-2">Configure KRA PIN, base currency, and withholding tax rules.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium leading-none">Creator KRA PIN Number</label>
                <Input
                  type="text"
                  value={businessPrefs.kraPin}
                  onChange={(e) => update('kraPin', e.target.value)}
                  placeholder="A012345678X"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium leading-none">Default Currency</label>
                <Select value={businessPrefs.defaultCurrency} onValueChange={(value) => update('defaultCurrency', value)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">KES — Kenyan Shilling (KSh)</SelectItem>
                    <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                    <SelectItem value="GBP">GBP — British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium leading-none">Withholding Tax (WHT) Rate</label>
                <Select value={businessPrefs.defaultWhtRate} onValueChange={(value) => update('defaultWhtRate', value)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5%">5% — Resident Professional Services</SelectItem>
                    <SelectItem value="20%">20% — Non-Resident Fee</SelectItem>
                    <SelectItem value="0%">0% — Tax Exempt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium leading-none">Default Payment Terms (Days)</label>
                <Input
                  type="number"
                  value={businessPrefs.defaultPaymentTerms}
                  onChange={(e) => update('defaultPaymentTerms', e.target.value)}
                  min={0}
                  max={365}
                />
              </div>
            </div>
          </section>

          {/* Document Numbering */}
          <section className="rounded-xl border bg-card text-card-foreground shadow-sm p-5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Document Numbering</p>
            <h2 className="text-2xl font-semibold tracking-tight">Auto-generated document numbers</h2>
            <p className="text-sm text-muted-foreground mt-2">Set prefixes for auto-generated document numbers.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium leading-none">Invoice Prefix</label>
                <Input
                  type="text"
                  value={businessPrefs.invoicePrefix}
                  onChange={(e) => update('invoicePrefix', e.target.value)}
                  maxLength={10}
                  placeholder="INV"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium leading-none">Quote Prefix</label>
                <Input
                  type="text"
                  value={businessPrefs.quotePrefix}
                  onChange={(e) => update('quotePrefix', e.target.value)}
                  maxLength={10}
                  placeholder="QTE"
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
              {isSaving ? 'Saving…' : 'Save Business Preferences'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
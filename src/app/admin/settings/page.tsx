'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ExternalLink, Save } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';

type WorkspaceForm = {
  businessName: string;
  phone: string;
  kraPin: string;
  vatRegistered: boolean;
  vatNumber: string;
  currency: string;
  depositPercentage: number;
  whtRate: number;
};

const emptyForm: WorkspaceForm = {
  businessName: '',
  phone: '',
  kraPin: '',
  vatRegistered: false,
  vatNumber: '',
  currency: 'KES',
  depositPercentage: 50,
  whtRate: 0,
};

const sections = [
  { href: '#workspace', label: 'Workspace' },
  { href: '#business-documents', label: 'Business documents' },
  { href: '#connected-workflows', label: 'Connected workflows' },
];

export default function AdminSettingsPage() {
  const [form, setForm] = useState<WorkspaceForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const response = await fetch('/api/profile', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || 'Could not load workspace settings.');
        if (cancelled) return;
        const business = data.businessProfile || {};
        setForm({
          businessName: business.businessName || '',
          phone: business.phone || '',
          kraPin: business.kraPin || '',
          vatRegistered: Boolean(business.vatRegistered),
          vatNumber: business.vatNumber || '',
          currency: business.currency || 'KES',
          depositPercentage: Number(business.depositPercentage ?? 50),
          whtRate: Number(business.whtRate ?? 0),
        });
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Could not load workspace settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  function update<K extends keyof WorkspaceForm>(key: K, value: WorkspaceForm[K]) {
    setForm(current => ({ ...current, [key]: value }));
    setMessage('');
    setError('');
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessProfile: form }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Could not save workspace settings.');
      setMessage('Workspace settings saved.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save workspace settings.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="ui-page"><div className="ui-shell"><p className="ui-meta">Loading workspace settings…</p></div></main>;
  }

  return (
    <main className="ui-page ui-page-padded">
      <div className="ui-shell">
        <AdminPageHeader
          title="Platform settings"
          description="Manage the workspace defaults used by your creative business."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          primaryAction={<span className="ui-badge"><span className="ui-badge-dot" />Workspace scope</span>}
        />

        <nav className="mb-8 flex flex-wrap gap-2 border-b border-border pb-4" aria-label="Platform settings sections">
          {sections.map(section => <a key={section.href} href={section.href} className="ui-button ui-button-secondary text-sm">{section.label}</a>)}
        </nav>

        <form onSubmit={save} className="space-y-6">
          <section id="workspace" className="ui-card scroll-mt-24">
            <div className="ui-card-header">
              <p className="ui-eyebrow">Workspace</p>
              <h2 className="ui-card-title">Business identity</h2>
              <p className="ui-meta">These details are shared by operational workflows and business documents.</p>
            </div>
            <div className="ui-card-content grid gap-5 sm:grid-cols-2">
              <label><span className="ui-label">Business name</span><input className="ui-input" value={form.businessName} onChange={event => update('businessName', event.target.value)} placeholder="Studio or business name" /></label>
              <label><span className="ui-label">Business phone</span><input className="ui-input" value={form.phone} onChange={event => update('phone', event.target.value)} placeholder="+254 …" /></label>
              <label><span className="ui-label">Default currency</span><select className="ui-select" value={form.currency} onChange={event => update('currency', event.target.value)}><option value="KES">KES — Kenyan Shilling</option><option value="USD">USD — US Dollar</option><option value="EUR">EUR — Euro</option></select></label>
              <label><span className="ui-label">KRA PIN</span><input className="ui-input" value={form.kraPin} onChange={event => update('kraPin', event.target.value)} placeholder="P000000000X" /></label>
            </div>
          </section>

          <section id="business-documents" className="ui-card scroll-mt-24">
            <div className="ui-card-header">
              <p className="ui-eyebrow">Business documents</p>
              <h2 className="ui-card-title">Quote and invoice defaults</h2>
              <p className="ui-meta">These values are persisted on your business profile and consumed by document workflows.</p>
            </div>
            <div className="ui-card-content grid gap-5 sm:grid-cols-2">
              <label><span className="ui-label">Default deposit percentage</span><input className="ui-input" type="number" min={0} max={100} value={form.depositPercentage} onChange={event => update('depositPercentage', Number(event.target.value))} /></label>
              <label><span className="ui-label">Withholding tax rate</span><input className="ui-input" type="number" min={0} max={100} value={form.whtRate} onChange={event => update('whtRate', Number(event.target.value))} /></label>
              <label className="flex items-center gap-3 sm:col-span-2"><input type="checkbox" checked={form.vatRegistered} onChange={event => update('vatRegistered', event.target.checked)} /><span><span className="ui-label">VAT registered</span><span className="ui-meta block">Use the VAT number on supported documents.</span></span></label>
              {form.vatRegistered && <label><span className="ui-label">VAT number</span><input className="ui-input" value={form.vatNumber} onChange={event => update('vatNumber', event.target.value)} /></label>}
            </div>
          </section>

          <section id="connected-workflows" className="ui-card scroll-mt-24">
            <div className="ui-card-header"><p className="ui-eyebrow">Connected workflows</p><h2 className="ui-card-title">Configure settings where they take effect</h2><p className="ui-meta">Gallery delivery and contract templates have their own authoritative editors. This keeps per-gallery behavior separate from workspace defaults.</p></div>
            <div className="ui-card-content grid gap-3 sm:grid-cols-2">
              <Link href="/admin/galleries" className="ui-card ui-card-interactive p-4"><span className="flex items-center justify-between font-medium">Galleries and watermarks <ArrowRight className="h-4 w-4" /></span><span className="ui-meta mt-2 block">Configure watermarking, delivery, proofing, and gallery access on the gallery itself.</span></Link>
              <Link href="/admin/contracts/templates" className="ui-card ui-card-interactive p-4"><span className="flex items-center justify-between font-medium">Contract templates <ArrowRight className="h-4 w-4" /></span><span className="ui-meta mt-2 block">Manage reusable contract content in the templates workspace.</span></Link>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
            <Button type="submit" variant="primary" disabled={saving}><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save workspace settings'}</Button>
            {message && <span className="ui-meta flex items-center gap-1 text-emerald-600"><Check className="h-4 w-4" />{message}</span>}
            {error && <span className="ui-meta text-destructive" role="alert">{error}</span>}
            <Link href="/admin/profile" className="ui-button ui-button-ghost ml-auto">Personal account <ExternalLink className="h-4 w-4" /></Link>
          </div>
        </form>
      </div>
    </main>
  );
}

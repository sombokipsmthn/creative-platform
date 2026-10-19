'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ExternalLink, Save } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';

type SettingsTab = 'branding' | 'watermark' | 'presets' | 'templates' | 'preferences' | 'integrations' | 'account';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('branding');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteAccountError, setDeleteAccountError] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // 1. Branding State
  const [domainSlug, setDomainSlug] = useState('kipsmthn.platform.com');
  const [customDomain, setCustomDomain] = useState('kipsmthn.com');
  const [hidePlatformBranding, setHidePlatformBranding] = useState(true);

  // 2. Watermark State
  const [watermarkText, setWatermarkText] = useState('KIPSMTHN PROOF');
  const [watermarkOpacity, setWatermarkOpacity] = useState(30);
  const [watermarkPosition, setWatermarkPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>('bottom-right');
  const [watermarkSize, setWatermarkSize] = useState(42);
  const [watermarkPreset, setWatermarkPreset] = useState<'proof' | 'brand'>('proof');
  const [applyWatermarkToProofs, setApplyWatermarkToProofs] = useState(true);

  useEffect(() => {
    const applyPreset = window.setTimeout(() => {
      if (watermarkPreset === 'proof') {
        setWatermarkText('KIPSMTHN PROOF');
        setWatermarkOpacity(30);
        setWatermarkPosition('bottom-right');
        setWatermarkSize(42);
      } else {
        setWatermarkText('KIPSMTHN');
        setWatermarkOpacity(55);
        setWatermarkPosition('bottom-right');
        setWatermarkSize(36);
      }
    }, 0);
    return () => window.clearTimeout(applyPreset);
  }, [watermarkPreset]);

  // Handle watermark changes from preview
  const handleWatermarkChange = (settings: {
    text: string;
    opacity: number;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    size: number;
  }) => {
    setWatermarkText(settings.text);
    setWatermarkOpacity(settings.opacity);
    setWatermarkPosition(settings.position);
    setWatermarkSize(settings.size);
  };

  // 3. Presets State
  const [defaultSelectionLimit, setDefaultSelectionLimit] = useState(25);
  const [defaultExpiryDays, setDefaultExpiryDays] = useState(60);
  const [defaultPin, setDefaultPin] = useState('4821');

  // 4. Email Templates State
  const [invitationSubject, setInvitationSubject] = useState('Your Private Client Gallery is Ready — KIPSMTHN');
  const [invitationBody, setInvitationBody] = useState('Hello {ClientName},\n\nYour private gallery "{GalleryTitle}" is now live on KIPSMTHN.\n\nUse your access PIN: {PIN} to view, favorite, and download your deliverables.\n\nBest regards,\nSomboriot Kipchilat');

  // 5. Preferences State
  const [kraPin, setKraPin] = useState('A012345678X');
  const [defaultCurrency, setDefaultCurrency] = useState('KES');
  const [defaultWhtRate, setDefaultWhtRate] = useState('5%');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Settings successfully saved for tab: ${activeTab.toUpperCase()}`);
  };

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'branding', label: 'Branding' },
    { id: 'watermark', label: 'Watermark' },
    { id: 'presets', label: 'Presets' },
    { id: 'templates', label: 'Email Templates' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'account', label: 'Account & Data' },
  ];

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
          )}

          {/* TAB 6: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="ui-card">
              <div className="ui-card-header">
                <h2 className="ui-card-title">API Integrations & Storage</h2>
                <p className="ui-meta">Manage external services connected to KIPSMTHN.</p>
              </div>
              <div className="ui-card-content space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slice-200 dark:border-zinc-800 rounded-xl flex justify-between items-center text-xs font-sans">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">KRA eTIMS Taxpayer Portal Bridge</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Connected to etims.kra.go.ke</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full font-bold">Active ✓</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slice-200 dark:border-zinc-800 rounded-xl flex justify-between items-center text-xs font-sans">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Cloudflare R2 Object Storage</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">142.8 GB Used • $0 Egress Fees</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full font-bold">Active ✓</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slice-200 dark:border-zinc-800 rounded-xl flex justify-between items-center text-xs font-sans">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Google Drive Importer API</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">OAuth 2.0 Read-Only Connector</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                  >
                    Configure
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT DATA / PERMANENT DELETION */}
          {activeTab === 'account' && (
            <section className="ui-card border border-red-300 dark:border-red-900">
              <div className="ui-card-header">
                <h2 className="ui-card-title text-red-700 dark:text-red-300">Delete creator account</h2>
                <p className="ui-meta">Permanently remove your creator account and its associated workspace data.</p>
              </div>
              <div className="ui-card-content space-y-4">
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                  <p className="font-semibold">This action cannot be undone.</p>
                  <p className="mt-2">Your clients, projects, galleries, uploaded gallery/project media, quotes, invoices, contracts, calendar-derived records, profile, and account credentials will be deleted. The shared equipment catalogue will be preserved.</p>
                  <p className="mt-2">Download anything you need first. If storage cleanup fails, the deletion is stopped so the account records remain available for retry.</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="delete-account-confirmation" className="ui-label">Type DELETE MY CREATOR ACCOUNT to confirm</label>
                  <input
                    id="delete-account-confirmation"
                    value={deleteConfirmation}
                    onChange={(event) => setDeleteConfirmation(event.target.value)}
                    autoComplete="off"
                    className="ui-input"
                    placeholder="DELETE MY CREATOR ACCOUNT"
                  />
                </div>
                {deleteAccountError && (
                  <p role="alert" className="text-sm text-red-700 dark:text-red-300">{deleteAccountError}</p>
                )}
                <button
                  type="button"
                  disabled={isDeletingAccount || deleteConfirmation !== 'DELETE MY CREATOR ACCOUNT'}
                  onClick={async () => {
                    setIsDeletingAccount(true);
                    setDeleteAccountError('');
                    try {
                      const response = await fetch('/api/account', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ confirmation: deleteConfirmation }),
                      });
                      const payload = await response.json().catch(() => ({}));
                      if (!response.ok) {
                        throw new Error(typeof payload.error === 'string' ? payload.error : 'Account deletion failed.');
                      }
                      window.location.assign('/sign-in?accountDeleted=1');
                    } catch (error) {
                      setDeleteAccountError(error instanceof Error ? error.message : 'Account deletion failed. Please retry.');
                      setIsDeletingAccount(false);
                    }
                  }}
                  className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeletingAccount ? 'Deleting account and associated data…' : 'Permanently delete creator account'}
                </button>
              </div>
            </section>
          )}
        </form>
      </div>
    </main>
  );
}

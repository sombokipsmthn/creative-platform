'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowSquareOut as ExternalLink, UserCircle as UserRound, Briefcase as BriefcaseBusiness, ShieldCheck, Gear as Settings, Image, Globe, CreditCard, Bell, Key, Envelope as Mail, DeviceMobile as Smartphone, CircleNotch as Loader2, X, Check, Plus, Image as ImageIcon, Sparkle as Sparkles } from "@phosphor-icons/react";
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WatermarkStudio from '@/components/WatermarkStudio';
import { authClient } from '@/lib/auth-client';
import CreatorOnboardingModal from '@/components/CreatorOnboardingModal';
import { PortfolioRenderer } from '@/components/portfolio-renderer';

type SettingsTab =
  | 'account-profile'
  | 'workspace-branding'
  | 'gallery-delivery'
  | 'email-templates'
  | 'business-preferences'
  | 'integrations'
  | 'security'
  | 'creator-portfolio';

const tabConfig: { id: SettingsTab; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'account-profile',
    label: 'Account & Profile',
    icon: <UserRound className="h-4 w-4" />,
    description: 'Your identity, contact details, and authentication settings.'
  },
  {
    id: 'workspace-branding',
    label: 'Workspace Branding',
    icon: <Globe className="h-4 w-4" />,
    description: 'Custom domain, logos, and platform branding for client-facing pages.'
  },
  {
    id: 'gallery-delivery',
    label: 'Gallery Delivery',
    icon: <Image className="h-4 w-4" role="img" aria-label="Gallery Delivery" />,
    description: 'Default watermark, gallery presets, and client portal settings.'
  },
  {
    id: 'email-templates',
    label: 'Email Templates',
    icon: <Mail className="h-4 w-4" />,
    description: 'Automated notification emails for gallery invitations and updates.'
  },
  {
    id: 'business-preferences',
    label: 'Business Preferences',
    icon: <CreditCard className="h-4 w-4" />,
    description: 'Currency, tax settings, KRA PIN, and regional defaults.'
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: <Settings className="h-4 w-4" />,
    description: 'Connected services, storage, and API integrations.'
  },
  {
    id: 'security',
    label: 'Security',
    icon: <ShieldCheck className="h-4 w-4" />,
    description: 'Passkeys, session management, and access controls.'
  },
  {
    id: 'creator-portfolio',
    label: 'Creator Portfolio',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'Public portfolio, headline, and project visibility settings.'
  },
];

const settingsTabIds = tabConfig.map((tab) => tab.id);
const getSettingsTab = (value: string | null): SettingsTab =>
  value && settingsTabIds.includes(value as SettingsTab) ? value as SettingsTab : 'account-profile';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account-profile');
  const initializedFromUrl = useRef(false);

  useEffect(() => {
    setActiveTab(getSettingsTab(new URLSearchParams(window.location.search).get('tab')));
    initializedFromUrl.current = true;

    const handlePopState = () => {
      setActiveTab(getSettingsTab(new URLSearchParams(window.location.search).get('tab')));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!initializedFromUrl.current) return;
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.get('tab') === activeTab) return;
    currentParams.set('tab', activeTab);
    window.history.pushState({ tab: activeTab }, '', `${window.location.pathname}?${currentParams.toString()}`);
  }, [activeTab]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Account & Profile State
  const [profile, setProfile] = useState({
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
    onboardingStatus: '',
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  // Portfolio State
  const [portfolio, setPortfolio] = useState<{
    headline: string;
    contactEmail: string;
    layout: 'editorial' | 'grid';
    published: boolean;
    selectedProjectIds: string[];
    projects: Array<{ id: string; title: string; visibility: string; cover_url?: string }>;
  }>({
    headline: '',
    contactEmail: '',
    layout: 'editorial',
    published: false,
    selectedProjectIds: [],
    projects: [],
  });
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioSaving, setPortfolioSaving] = useState(false);

  // Gallery Delivery State
  const [galleryDefaults, setGalleryDefaults] = useState({
    defaultPhotoSelectionLimit: 25,
    defaultExpirationDays: 60,
    defaultMasterPin: '4821',
    defaultAllowDownloads: true,
    defaultAllowFavorites: true,
    defaultAllowSelections: true,
    defaultRequirePin: false,
  });
  const [gallerySaving, setGallerySaving] = useState(false);

  // Workspace Branding State
  const [branding, setBranding] = useState({
    domainSlug: 'kipsmthn.platform.com',
    customDomain: 'kipsmthn.com',
    hidePlatformBranding: true,
  });
  const [brandingSaving, setBrandingSaving] = useState(false);

  // Email Templates State
  const [emailTemplates, setEmailTemplates] = useState({
    invitationSubject: 'Your Private Client Gallery is Ready — KIPSMTHN',
    invitationBody: 'Hello {ClientName},\n\nYour private gallery "{GalleryTitle}" is now live on KIPSMTHN.\n\nUse your access PIN: {PIN} to view, favorite, and download your deliverables.\n\nBest regards,\n{CreatorName}',
    reminderSubject: 'Reminder: Your gallery "{GalleryTitle}" expires in {DaysRemaining} days',
    reminderBody: 'Hello {ClientName},\n\nThis is a friendly reminder that your access to "{GalleryTitle}" will expire on {ExpiryDate}.\n\nVisit the gallery to make your final selections and downloads.\n\nBest regards,\n{CreatorName}',
  });
  const [emailSaving, setEmailSaving] = useState(false);

  // Business Preferences State
  const [businessPrefs, setBusinessPrefs] = useState({
    kraPin: 'A012345678X',
    defaultCurrency: 'KES',
    defaultWhtRate: '5%',
    defaultPaymentTerms: '30',
    invoicePrefix: 'INV',
    quotePrefix: 'QTE',
  });
  const [businessSaving, setBusinessSaving] = useState(false);

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('/api/profile', { cache: 'no-store' });
        const data = await response.json();
        if (response.ok && data) {
          setProfile({
            name: data.user?.name || '',
            handle: data.user?.handle || '',
            email: data.user?.email || '',
            phone: data.businessProfile?.phone || '',
            kraPin: data.businessProfile?.kraPin || '',
            location: data.profile?.location || '',
            bio: data.profile?.bio || '',
            website: data.profile?.website || '',
            businessName: data.businessProfile?.businessName || '',
            avatarUrl: data.profile?.avatarUrl || data.user?.image || '',
            onboardingStatus: data.user?.onboardingStatus || '',
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setProfileLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Load portfolio data
  useEffect(() => {
    async function loadPortfolio() {
      try {
        const response = await fetch('/api/portfolio', { cache: 'no-store' });
        const data = await response.json();
        if (response.ok && data) {
          setPortfolio({
            headline: data.portfolio?.headline || '',
            contactEmail: data.portfolio?.contactEmail || '',
            layout: data.portfolio?.layout === 'grid' ? 'grid' : 'editorial',
            published: Boolean(data.portfolio?.isPublished),
            selectedProjectIds: Array.isArray(data.portfolio?.selectedProjectIds) ? data.portfolio.selectedProjectIds : [],
            projects: data.projects || data.portfolio?.projects || [],
          });
        }
      } catch (error) {
        console.error('Failed to load portfolio:', error);
      } finally {
        setPortfolioLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  // Load gallery delivery defaults
  useEffect(() => {
    async function loadGalleryDefaults() {
      try {
        const response = await fetch('/api/gallery-defaults', { cache: 'no-store' });
        const data = await response.json();
        if (response.ok && data.defaults) setGalleryDefaults((current) => ({ ...current, ...data.defaults }));
      } catch (error) {
        console.error('Failed to load gallery defaults:', error);
      }
    }
    loadGalleryDefaults();
  }, []);

  // Load branding settings
  useEffect(() => {
    async function loadBranding() {
      try {
        const response = await fetch('/api/workspace/branding', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setBranding(prev => ({
            ...prev,
            domainSlug: data.domainSlug || prev.domainSlug,
            customDomain: data.customDomain || prev.customDomain,
            hidePlatformBranding: data.hidePlatformBranding ?? prev.hidePlatformBranding,
          }));
        }
      } catch (error) {
        console.error('Failed to load branding:', error);
      }
    }
    loadBranding();
  }, []);

  // Load email templates
  useEffect(() => {
    async function loadEmailTemplates() {
      try {
        const response = await fetch('/api/email-templates', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setEmailTemplates(prev => ({
            ...prev,
            invitationSubject: data.invitationSubject || prev.invitationSubject,
            invitationBody: data.invitationBody || prev.invitationBody,
            reminderSubject: data.reminderSubject || prev.reminderSubject,
            reminderBody: data.reminderBody || prev.reminderBody,
          }));
        }
      } catch (error) {
        console.error('Failed to load email templates:', error);
      }
    }
    loadEmailTemplates();
  }, []);

  // Load business preferences
  useEffect(() => {
    async function loadBusinessPrefs() {
      try {
        const response = await fetch('/api/business-preferences', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setBusinessPrefs(prev => ({
            ...prev,
            kraPin: data.kraPin || prev.kraPin,
            defaultCurrency: data.defaultCurrency || prev.defaultCurrency,
            defaultWhtRate: data.defaultWhtRate || prev.defaultWhtRate,
            defaultPaymentTerms: data.defaultPaymentTerms || prev.defaultPaymentTerms,
            invoicePrefix: data.invoicePrefix || prev.invoicePrefix,
            quotePrefix: data.quotePrefix || prev.quotePrefix,
          }));
        }
      } catch (error) {
        console.error('Failed to load business preferences:', error);
      }
    }
    loadBusinessPrefs();
  }, []);

  const handleSave = async (section: string, saveFn: () => Promise<void>) => {
    setSaveMessage(null);
    try {
      await saveFn();
      setSaveMessage(`${section} saved successfully.`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : `Failed to save ${section.toLowerCase()}.`);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  // Save functions
  const saveProfile = async () => {
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: { name: profile.name.trim(), handle: profile.handle.trim() },
        profile: { bio: profile.bio, avatarUrl: profile.avatarUrl, website: profile.website, location: profile.location },
        businessProfile: { businessName: profile.businessName, phone: profile.phone, kraPin: profile.kraPin },
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data?.error || 'Failed to save profile');
    }
  };

  const saveBranding = async () => {
    const response = await fetch('/api/workspace/branding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branding),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data?.error || 'Failed to save branding');
    }
  };

  const saveEmailTemplates = async () => {
    const response = await fetch('/api/email-templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailTemplates),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data?.error || 'Failed to save email templates');
    }
  };

  const saveBusinessPrefs = async () => {
    const response = await fetch('/api/business-preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(businessPrefs),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data?.error || 'Failed to save business preferences');
    }
  };

  const saveGalleryDefaults = async () => {
    const response = await fetch('/api/gallery-defaults', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(galleryDefaults),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data?.error || 'Failed to save gallery defaults');
    }
  };

  const savePortfolio = async () => {
    const response = await fetch('/api/portfolio', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headline: portfolio.headline,
        contactEmail: portfolio.contactEmail,
        layout: portfolio.layout,
        isPublished: portfolio.published,
        selectedProjectIds: portfolio.selectedProjectIds,
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data?.error || 'Failed to save portfolio');
    }
  };

  const updateProfile = (key: keyof typeof profile, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const updatePortfolio = (key: 'headline' | 'contactEmail' | 'layout' | 'published', value: string | boolean) => {
    setPortfolio(prev => ({ ...prev, [key]: value }));
  };

  const updateBranding = (key: keyof typeof branding, value: string | boolean) => {
    setBranding(prev => ({ ...prev, [key]: value }));
  };

  const updateEmailTemplates = (key: keyof typeof emailTemplates, value: string) => {
    setEmailTemplates(prev => ({ ...prev, [key]: value }));
  };

  const updateBusinessPrefs = (key: keyof typeof businessPrefs, value: string) => {
    setBusinessPrefs(prev => ({ ...prev, [key]: value }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account-profile':
        return (
          <div className="space-y-6">
            {/* Profile Header Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={profile.name || 'Avatar'} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-muted-foreground">
                        {(profile.name || 'C').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Current account</p>
                    <h3 className="mt-1 truncate text-2xl font-semibold tracking-tight">{profile.name || 'Creator'}</h3>
                    <p className="text-sm text-muted-foreground">{profile.email || 'No email available'}</p>
                    {profile.handle && (
                      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mt-1">@{profile.handle}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-0">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="profile-full-name" className="text-sm font-medium leading-none">Full name</label>
                    <Input
                      id="profile-full-name"
                      type="text"
                      value={profile.name}
                      onChange={(e) => updateProfile('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="profile-handle" className="text-sm font-medium leading-none">Creator handle</label>
                    <Input
                      id="profile-handle"
                      type="text"
                      value={profile.handle}
                      onChange={(e) => updateProfile('handle', e.target.value)}
                      placeholder="yourhandle"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium leading-none">Email address</label>
                    <Input
                      type="email"
                      value={profile.email}
                      readOnly
                      className="cursor-not-allowed opacity-70"
                    />
                    <span className="text-xs text-muted-foreground">Managed by Better Auth</span>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="profile-phone" className="text-sm font-medium leading-none">Phone number</label>
                    <Input
                      id="profile-phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => updateProfile('phone', e.target.value)}
                      placeholder="+254 …"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="profile-business-name" className="text-sm font-medium leading-none">Business name</label>
                    <Input
                      id="profile-business-name"
                      type="text"
                      value={profile.businessName}
                      onChange={(e) => updateProfile('businessName', e.target.value)}
                      placeholder="Studio or business name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="profile-kra-pin" className="text-sm font-medium leading-none">KRA PIN</label>
                    <Input
                      id="profile-kra-pin"
                      type="text"
                      value={profile.kraPin}
                      onChange={(e) => updateProfile('kraPin', e.target.value)}
                      placeholder="P000000000X"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="profile-location" className="text-sm font-medium leading-none">Location</label>
                    <Input
                      id="profile-location"
                      type="text"
                      value={profile.location}
                      onChange={(e) => updateProfile('location', e.target.value)}
                      placeholder="Nairobi, Kenya"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="profile-website" className="text-sm font-medium leading-none">Website</label>
                    <Input
                      id="profile-website"
                      type="url"
                      value={profile.website}
                      onChange={(e) => updateProfile('website', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="profile-avatar" className="text-sm font-medium leading-none">Profile avatar URL</label>
                    <Input
                      id="profile-avatar"
                      type="url"
                      value={profile.avatarUrl}
                      onChange={(e) => updateProfile('avatarUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="profile-bio" className="text-sm font-medium leading-none">Public bio</label>
                    <Textarea
                      id="profile-bio"
                      rows={5}
                      value={profile.bio}
                      onChange={(e) => updateProfile('bio', e.target.value)}
                      placeholder="Tell clients about your creative work..."
                      className="min-h-32 resize-y"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Onboarding Recovery Section */}
            <Card>
              <CardHeader>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Creator setup</p>
                <h3 className="text-2xl font-semibold tracking-tight">Onboarding & setup</h3>
                <p className="text-sm text-muted-foreground mt-2">Complete or resume your creator setup.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.onboardingStatus === "complete" && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400">
                        <Check className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-emerald-800 dark:text-emerald-200">Setup complete</p>
                        <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">Your creator profile and services are fully configured.</p>
                      </div>
                    </div>
                  )}
                  {profile.onboardingStatus === "skipped" && (
                    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400">
                        <X className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-amber-800 dark:text-amber-200">Setup was skipped</p>
                        <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">You chose to explore the dashboard first. Resume setup anytime to complete your profile and services.</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setShowOnboarding(true)}
                        variant="outline"
                        className="whitespace-nowrap"
                      >
                        Resume setup
                      </Button>
                    </div>
                  )}
                  {profile.onboardingStatus === "incomplete" && (
                    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 dark:border-primary/20 dark:bg-primary/10">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                        <BriefcaseBusiness className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-primary dark:text-primary">Setup in progress</p>
                        <p className="mt-1 text-sm text-primary/80 dark:text-primary/80">Complete your creator profile, services, and business details.</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setShowOnboarding(true)}
                        variant="primary"
                        className="whitespace-nowrap"
                      >
                        Continue setup
                      </Button>
                    </div>
                  )}
                  {(!profile.onboardingStatus || profile.onboardingStatus === "pending") && (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                        <BriefcaseBusiness className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Get started with setup</p>
                        <p className="mt-1 text-sm text-muted-foreground">Set up your creator profile, services, and business details to start receiving clients.</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setShowOnboarding(true)}
                        variant="primary"
                        className="whitespace-nowrap"
                      >
                        Start setup
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card>
              <CardHeader>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Account security</p>
                <h3 className="text-2xl font-semibold tracking-tight">Passkeys</h3>
                <p className="text-sm text-muted-foreground mt-2">Register this device or a security key for passwordless sign-in.</p>
              </CardHeader>
              <CardContent>
                <PasskeySection />
              </CardContent>
            </Card>

            {/* Save Action */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {saveMessage && <p className="text-sm text-muted-foreground">{saveMessage}</p>}
              <Button
                type="button"
                onClick={() => handleSave('Profile', saveProfile)}
                disabled={profileSaving}
                variant="primary"
                className="px-6 py-3 text-xs font-sans uppercase tracking-widest w-full sm:w-auto"
              >
                {profileSaving ? 'Saving…' : 'Save Profile Changes'}
              </Button>
            </div>
          </div>
        );

      case 'workspace-branding':
        return (
          <div className="space-y-6">
            {/* Domain & Custom URLs */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold tracking-tight">Domain & Custom URLs</h3>
                <p className="text-sm text-muted-foreground">Your client galleries are always available on your default site address.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Default Site Address</label>
                  <Input
                    type="text"
                    value={branding.domainSlug}
                    onChange={(e) => updateBranding('domainSlug', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Custom Domain</label>
                  <Input
                    type="text"
                    value={branding.customDomain}
                    onChange={(e) => updateBranding('customDomain', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Use your own domain for client galleries (e.g. kipsmthn.com).</p>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <label className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={branding.hidePlatformBranding}
                      onChange={(e) => updateBranding('hidePlatformBranding', e.target.checked)}
                      className="h-4 w-4 rounded accent-primary"
                    />
                    Hide default platform branding from client galleries
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Logos & Favicon */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold tracking-tight">Logos & Favicon</h3>
                <p className="text-sm text-muted-foreground">Upload custom brand logos for your client portal header and browser tab icon.</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border-2 border-dashed border-border rounded-2xl text-center space-y-3 bg-muted/50">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl">+</div>
                  <p className="text-xs font-bold text-foreground">Upload Header Logo</p>
                  <p className="text-[10px] text-muted-foreground">PNG or SVG with transparent background, max 500px wide</p>
                  <Button variant="outline" size="sm" className="mt-2">Choose File</Button>
                </div>
                <div className="p-6 border-2 border-dashed border-border rounded-2xl text-center space-y-3 bg-muted/50">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-primary/20 text-xl">+</div>
                  <p className="text-xs font-bold text-foreground">Upload Favicon Icon</p>
                  <p className="text-[10px] text-muted-foreground">32x32 PNG, ICO or SVG file</p>
                  <Button variant="outline" size="sm" className="mt-2">Choose File</Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Action */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {saveMessage && <p className="text-sm text-muted-foreground">{saveMessage}</p>}
              <Button
                type="button"
                onClick={() => handleSave('Branding', saveBranding)}
                disabled={brandingSaving}
                variant="primary"
                className="px-6 py-3 text-xs font-sans uppercase tracking-widest w-full sm:w-auto"
              >
                {brandingSaving ? 'Saving…' : 'Save Branding Changes'}
              </Button>
            </div>
          </div>
        );

      case 'gallery-delivery':
        return (
          <div className="space-y-6">
            {/* Watermark Studio - full component */}
            <WatermarkStudio />

            {/* Gallery Default Presets */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold tracking-tight">Default Gallery Presets</h3>
                <p className="text-sm text-muted-foreground">Pre-fill settings when creating new private client galleries.</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Default Photo Selection Limit</label>
                  <Input type="number" value={galleryDefaults.defaultPhotoSelectionLimit} onChange={(e) => setGalleryDefaults((current) => ({ ...current, defaultPhotoSelectionLimit: Number(e.target.value) }))} min={1} max={200} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Default Expiration (Days)</label>
                  <Input type="number" value={galleryDefaults.defaultExpirationDays} onChange={(e) => setGalleryDefaults((current) => ({ ...current, defaultExpirationDays: Number(e.target.value) }))} min={1} max={365} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Default Master PIN</label>
                  <Input type="text" value={galleryDefaults.defaultMasterPin} onChange={(e) => setGalleryDefaults((current) => ({ ...current, defaultMasterPin: e.target.value }))} maxLength={10} />
                </div>
              </CardContent>
            </Card>

            {/* Client Portal Settings */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold tracking-tight">Client Portal Settings</h3>
                <p className="text-sm text-muted-foreground">Configure the default experience for your client galleries.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow downloads by default</p>
                    <p className="text-xs text-muted-foreground">Clients can download web-sized images from galleries</p>
                  </div>
                  <input type="checkbox" checked={galleryDefaults.defaultAllowDownloads} onChange={(e) => setGalleryDefaults((current) => ({ ...current, defaultAllowDownloads: e.target.checked }))} className="h-4 w-4 accent-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow favorites by default</p>
                    <p className="text-xs text-muted-foreground">Clients can mark photos as favorites</p>
                  </div>
                  <input type="checkbox" checked={galleryDefaults.defaultAllowFavorites} onChange={(e) => setGalleryDefaults((current) => ({ ...current, defaultAllowFavorites: e.target.checked }))} className="h-4 w-4 accent-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow selections/proofing by default</p>
                    <p className="text-xs text-muted-foreground">Clients can select images for final delivery</p>
                  </div>
                  <input type="checkbox" checked={galleryDefaults.defaultAllowSelections} onChange={(e) => setGalleryDefaults((current) => ({ ...current, defaultAllowSelections: e.target.checked }))} className="h-4 w-4 accent-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Require PIN for gallery access</p>
                    <p className="text-xs text-muted-foreground">Clients must enter a PIN to view the gallery</p>
                  </div>
                  <input type="checkbox" checked={galleryDefaults.defaultRequirePin} onChange={(e) => setGalleryDefaults((current) => ({ ...current, defaultRequirePin: e.target.checked }))} className="h-4 w-4 accent-primary" />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {saveMessage && <p className="text-sm text-muted-foreground">{saveMessage}</p>}
              <Button type="button" onClick={() => handleSave('Gallery defaults', saveGalleryDefaults)} disabled={gallerySaving} variant="primary" className="px-6 py-3 text-xs font-sans uppercase tracking-widest w-full sm:w-auto">
                {gallerySaving ? 'Saving…' : 'Save Gallery Defaults'}
              </Button>
            </div>
          </div>
        );

      case 'creator-portfolio':
        return (
          <div className="space-y-6">
            {/* Portfolio Overview */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold tracking-tight">Portfolio Settings</h3>
                <p className="text-sm text-muted-foreground">Configure your public portfolio and project visibility.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Headline</label>
                    <Input
                      type="text"
                      value={portfolio.headline}
                      onChange={(e) => updatePortfolio('headline', e.target.value)}
                      placeholder="Your headline here"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Contact Email</label>
                    <Input
                      type="email"
                      value={portfolio.contactEmail}
                      onChange={(e) => updatePortfolio('contactEmail', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Selection */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold tracking-tight">Project Visibility</h3>
                <p className="text-sm text-muted-foreground">Select which projects are visible in your public portfolio.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {portfolio.projects.map((project) => {
                    const isSelected = portfolio.selectedProjectIds.includes(project.id);
                    const isPublished = project.visibility === 'published';
                    return (
                      <div
                        key={project.id}
                        className="group ui-card ui-card-interactive border border-slate-700 bg-slate-950 rounded-xl p-4 flex flex-col justify-between"
                      >
                        <div className="relative h-48 w-full overflow-hidden rounded-xl mb-4">
                          {project.cover_url ? (
                            <div className="absolute inset-0">
                              <img
                                src={project.cover_url}
                                alt={project.title}
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                              />
                            </div>
                          ) : (
                            <div
                              className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-zinc-800"
                            >
                              <ImageIcon className="h-8 w-8 opacity-70" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col flex-1">
                          <p className="font-medium truncate">{project.title}</p>
                          <p className="text-xs text-slate-500 truncate">
                            {project.id}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            asChild
                            variant={isSelected ? 'primary' : 'ghost'}
                            size="icon"
                            className="p-1 rounded-xl transition-colors {isSelected ? 'bg-primary/10' : 'border-primary/20'}"
                            onClick={() => {
                              if (isSelected) {
                                setPortfolio(prev => ({
                                  ...prev,
                                  selectedProjectIds: prev.selectedProjectIds.filter(id => id !== project.id),
                                }));
                              } else {
                                setPortfolio(prev => ({
                                  ...prev,
                                  selectedProjectIds: [...prev.selectedProjectIds, project.id],
                                }));
                              }
                            }}
                          >
                            {isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                          </Button>
                          <span className="text-[10px] text-slate-500">{project.visibility}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Published Toggle */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold tracking-tight">Publish Portfolio</h3>
                <p className="text-sm text-muted-foreground">Make your portfolio publicly available.</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Portfolio Published</p>
                    <p className="text-xs text-muted-foreground">Enable to make your portfolio publicly accessible.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={portfolio.layout} onValueChange={(value) => updatePortfolio('layout', value)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="editorial">Editorial</SelectItem>
                        <SelectItem value="grid">Grid</SelectItem>
                      </SelectContent>
                    </Select>
                    <select
                    value={portfolio.published ? 'true' : 'false'}
                    onChange={(e) => updatePortfolio('published', e.target.value === 'true')}
                    className="ui-select rounded-lg border-border px-3 py-2"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Choose the presentation layout used by your public portfolio.</p>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Link href="/admin/portfolio" className="text-sm font-medium text-primary hover:underline">Open full portfolio editor and preview →</Link>
            </div>

            {/* Save Action */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {saveMessage && <p className="text-sm text-muted-foreground">{saveMessage}</p>}
              <Button
                type="button"
                onClick={() => handleSave('Portfolio', savePortfolio)}
                disabled={portfolioSaving}
                variant="primary"
                className="px-6 py-3 text-xs font-sans uppercase tracking-widest w-full sm:w-auto"
              >
                {portfolioSaving ? 'Saving…' : 'Save Portfolio Changes'}
              </Button>
            </div>
          </div>
        );


      case 'email-templates':
        return (
          <div className="space-y-6">
            {/* Gallery Invitation Template */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold tracking-tight">Gallery Invitation Email</h3>
                <p className="text-sm text-muted-foreground">Sent when a new private gallery is published for a client.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Email Subject</label>
                  <Input
                    type="text"
                    value={emailTemplates.invitationSubject}
                    onChange={(e) => updateEmailTemplates('invitationSubject', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Email Message Body</label>
                  <Textarea
                    rows={8}
                    value={emailTemplates.invitationBody}
                    onChange={(e) => updateEmailTemplates('invitationBody', e.target.value)}
                  />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Available variables: {['{ClientName}', '{GalleryTitle}', '{PIN}', '{CreatorName}', '{GalleryLink}'].map((v) => <code key={v} className="bg-muted px-1 rounded">{v}</code>)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Expiry Reminder Template */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold tracking-tight">Expiry Reminder Email</h3>
                <p className="text-sm text-muted-foreground">Sent automatically before a gallery expires (configurable timing).</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Email Subject</label>
                  <Input
                    type="text"
                    value={emailTemplates.reminderSubject}
                    onChange={(e) => updateEmailTemplates('reminderSubject', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Email Message Body</label>
                  <Textarea
                    rows={8}
                    value={emailTemplates.reminderBody}
                    onChange={(e) => updateEmailTemplates('reminderBody', e.target.value)}
                  />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Available variables: {['{ClientName}', '{GalleryTitle}', '{DaysRemaining}', '{ExpiryDate}', '{CreatorName}', '{GalleryLink}'].map((v) => <code key={v} className="bg-muted px-1 rounded">{v}</code>)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Save Action */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {saveMessage && <p className="text-sm text-muted-foreground">{saveMessage}</p>}
              <Button
                type="button"
                onClick={() => handleSave('Email templates', saveEmailTemplates)}
                disabled={emailSaving}
                variant="primary"
                className="px-6 py-3 text-xs font-sans uppercase tracking-widest w-full sm:w-auto"
              >
                {emailSaving ? 'Saving…' : 'Save Email Templates'}
              </Button>
            </div>
          </div>
        );

      case 'business-preferences':
        return (
          <div className="space-y-6">
            {/* Kenyan Tax & Business Settings */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold tracking-tight">Kenyan Tax & Business Settings</h3>
                <p className="text-sm text-muted-foreground">Configure KRA PIN, base currency, and withholding tax rules.</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Creator KRA PIN Number</label>
                  <Input
                    type="text"
                    value={businessPrefs.kraPin}
                    onChange={(e) => updateBusinessPrefs('kraPin', e.target.value)}
                    placeholder="A012345678X"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Default Currency</label>
                  <Select value={businessPrefs.defaultCurrency} onValueChange={(value) => updateBusinessPrefs('defaultCurrency', value)}>
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
                  <Select value={businessPrefs.defaultWhtRate} onValueChange={(value) => updateBusinessPrefs('defaultWhtRate', value)}>
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
                    onChange={(e) => updateBusinessPrefs('defaultPaymentTerms', e.target.value)}
                    min={0}
                    max={365}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Document Numbering */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold tracking-tight">Document Numbering</h3>
                <p className="text-sm text-muted-foreground">Set prefixes for auto-generated document numbers.</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Invoice Prefix</label>
                  <Input
                    type="text"
                    value={businessPrefs.invoicePrefix}
                    onChange={(e) => updateBusinessPrefs('invoicePrefix', e.target.value)}
                    maxLength={10}
                    placeholder="INV"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Quote Prefix</label>
                  <Input
                    type="text"
                    value={businessPrefs.quotePrefix}
                    onChange={(e) => updateBusinessPrefs('quotePrefix', e.target.value)}
                    maxLength={10}
                    placeholder="QTE"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Action */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {saveMessage && <p className="text-sm text-muted-foreground">{saveMessage}</p>}
              <Button
                type="button"
                onClick={() => handleSave('Business preferences', saveBusinessPrefs)}
                disabled={businessSaving}
                variant="primary"
                className="px-6 py-3 text-xs font-sans uppercase tracking-widest w-full sm:w-auto"
              >
                {businessSaving ? 'Saving…' : 'Save Business Preferences'}
              </Button>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            {/* Active Integrations */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold tracking-tight">Connected Services</h3>
                <p className="text-sm text-muted-foreground">Manage external services connected to your workspace.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <IntegrationCard
                  name="KRA eTIMS Taxpayer Portal Bridge"
                  description="Connected to etims.kra.go.ke for tax compliance"
                  status="active"
                  action={<Badge variant="success">Active</Badge>}
                />
                <IntegrationCard
                  name="Cloudflare R2 Object Storage"
                  description="142.8 GB Used • $0 Egress Fees"
                  status="active"
                  action={<Badge variant="success">Active</Badge>}
                />
                <IntegrationCard
                  name="Google Drive Importer"
                  description="OAuth 2.0 Read-Only Connector"
                  status="configured"
                  action={<Button variant="secondary" size="sm">Configure</Button>}
                />
                <IntegrationCard
                  name="M-Pesa Payment Gateway"
                  description="Safaricom Daraja API for payment collection"
                  status="inactive"
                  action={<Button variant="outline" size="sm">Connect</Button>}
                />
                <IntegrationCard
                  name="Slack Notifications"
                  description="Post gallery activity to Slack channels"
                  status="inactive"
                  action={<Button variant="outline" size="sm">Connect</Button>}
                />
              </CardContent>
            </Card>

            {/* API Access */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold tracking-tight">API Access</h3>
                <p className="text-sm text-muted-foreground">Generate API keys for custom integrations and third-party tools.</p>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">API Key for Custom Integrations</p>
                      <p className="text-xs text-muted-foreground">Use this key to authenticate API requests from your own applications.</p>
                    </div>
                    <Button variant="secondary" size="sm">Generate Key</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            {/* Passkeys */}
            <Card>
              <CardHeader>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Account security</p>
                <h3 className="text-2xl font-semibold tracking-tight">Passkeys</h3>
                <p className="text-sm text-muted-foreground mt-2">Register this device or a security key for passwordless sign-in.</p>
              </CardHeader>
              <CardContent>
                <PasskeySection />
              </CardContent>
            </Card>

            {/* Session Management */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold tracking-tight">Active Sessions</h3>
                <p className="text-sm text-muted-foreground">View and manage devices currently signed into your account.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <SessionRow
                    device="MacBook Pro · Chrome"
                    location="Nairobi, Kenya"
                    lastActive="2 minutes ago"
                    current={true}
                  />
                  <SessionRow
                    device="iPhone 15 · Safari"
                    location="Nairobi, Kenya"
                    lastActive="1 hour ago"
                    current={false}
                    onRevoke={() => {}}
                  />
                  <SessionRow
                    device="iPad Pro · Chrome"
                    location="Mombasa, Kenya"
                    lastActive="3 days ago"
                    current={false}
                    onRevoke={() => {}}
                  />
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full">Sign out of all other sessions</Button>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold tracking-tight">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <div>
                    <p className="font-medium">Authenticator App (TOTP)</p>
                    <p className="text-xs text-muted-foreground">Use Google Authenticator, 1Password, or similar apps.</p>
                  </div>
                  <Button variant="secondary" size="sm">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <AdminPageHeader
          title="Settings"
          description="Configure your workspace, gallery delivery, client communications, and business preferences."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          tabs={tabConfig.map(tab => ({
            label: tab.label,
            active: activeTab === tab.id,
            onClick: () => setActiveTab(tab.id),
            icon: tab.icon,
          }))}
        />

        <form className="space-y-8">
          {saveMessage && <p role="status" className="text-sm text-muted-foreground">{saveMessage}</p>}
          {renderTabContent()}
        </form>
      </div>

      {showOnboarding && (
        <CreatorOnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={() => setShowOnboarding(false)}
          onDismiss={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}

function PasskeySection() {
  const [passkeyName, setPasskeyName] = useState("");
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const registerPasskey = async () => {
    setPasskeyLoading(true);
    setMessage(null);
    try {
      const { authClient } = await import('@/lib/auth-client');
      const result = await authClient.passkey.addPasskey({ name: passkeyName.trim() || "My passkey" });
      if (result.error) {
        setMessage("Passkey registration failed. Use a supported device and try again.");
      } else {
        setPasskeyName("");
        setMessage("Passkey registered. You can use it to sign in next time.");
      }
    } catch (error) {
      setMessage("Passkey registration failed. Use a supported device and try again.");
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input value={passkeyName} onChange={(e) => setPasskeyName(e.target.value)} placeholder="Passkey name (optional)" className="flex-1" disabled={passkeyLoading} />
      <Button type="button" onClick={registerPasskey} disabled={passkeyLoading || typeof window !== "undefined" && !window.PublicKeyCredential} variant="primary">
        {passkeyLoading ? "Registering…" : "Register passkey"}
      </Button>
      {message && <p className="text-sm text-muted-foreground mt-2">{message}</p>}
    </div>
  );
}

function IntegrationCard({ name, description, status, action }: { name: string; description: string; status: 'active' | 'configured' | 'inactive'; action: React.ReactNode }) {
  const statusConfig = {
    active: { badge: <Badge variant="success">Active</Badge>, color: 'text-emerald-600 dark:text-emerald-400' },
    configured: { badge: <Badge variant="secondary">Configured</Badge>, color: 'text-primary dark:text-primary' },
    inactive: { badge: <Badge variant="outline">Not Connected</Badge>, color: 'text-muted-foreground' },
  };
  const config = statusConfig[status];

  return (
    <div className="p-4 bg-muted/50 border border-border rounded-xl flex justify-between items-center">
      <div>
        <p className="font-medium text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-3">{config.badge}{action}</div>
    </div>
  );
}

function SessionRow({ device, location, lastActive, current, onRevoke }: { device: string; location: string; lastActive: string; current: boolean; onRevoke?: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{device}</p>
          <p className="text-xs text-muted-foreground">{location} · {lastActive}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {current && <Badge variant="secondary" className="text-xs">Current</Badge>}
        {!current && onRevoke && (
          <Button variant="ghost" size="icon" onClick={onRevoke} className="h-8 w-8">
            <Key className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
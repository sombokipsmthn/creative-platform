'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, UserRound, BriefcaseBusiness, ShieldCheck, Settings, Image, Globe, CreditCard, Bell, Key, Mail, Smartphone, Loader2, X, Check, Plus, ImageIcon, Sparkles } from 'lucide-react';
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

const initialActiveTab = typeof window !== 'undefined'
  ? (new URLSearchParams(window.location.search).get('tab') as SettingsTab | null) || 'account-profile'
  : 'account-profile';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialActiveTab);

  // Sync URL param on tab change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.delete('tab');
      currentParams.append('tab', activeTab);
      const newUrl = window.location.pathname + '?' + currentParams.toString();
      window.history.replaceState({ path: newUrl }, '', newUrl);
    }
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
    layout: 'editorial' | 'mosaic' | 'story' | 'minimal' | 'editorial';
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
            layout: data.portfolio?.layout || 'editorial',
            published: data.portfolio?.isPublished || false,
            selectedProjectIds: Array.isArray(data.portfolio?.selectedProjectIds)
              ? data.portfolio.selectedProjectIds
              : [],
            projects: data.portfolio?.projects || [],
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

  const updatePortfolio = (key: keyof typeof portfolio, value: string | boolean) => {
    setPortfolio(prev => ({ ...prev, [key]: value }));
  };

  const updateBusinessPrefs = (key: keyof typeof businessPrefs, value: string) => {
    setBusinessPrefs(prev => ({ ...prev, [key]: value }));
  };

  // Passkey state
  const [passkeyName, setPasskeyName] = useState("");
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyMessage, setPasskeyMessage] = useState<string | null>(null);

  const registerPasskey = async () => {
    setPasskeyLoading(true);
    setPasskeyMessage(null);
    try {
      const result = await authClient.passkey.addPasskey({ name: passkeyName.trim() || "My passkey" });
      if (result.error) {
        setPasskeyMessage("Passkey registration failed. Use a supported device and try again.");
      } else {
        setPasskeyName("");
        setPasskeyMessage("Passkey registered. You can use it to sign in next time.");
      }
    } catch (error) {
      setPasskeyMessage("Passkey registration failed. Use a supported device and try again.");
    } finally {
      setPasskeyLoading(false);
    }
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
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input value={passkeyName} onChange={(e) => setPasskeyName(e.target.value)} placeholder="Passkey name (optional)" className="flex-1" disabled={passkeyLoading} />
                  <Button type="button" onClick={registerPasskey} disabled={passkeyLoading || typeof window !== "undefined" && !window.PublicKeyCredential} variant="primary">
                    {passkeyLoading ? "Registering…" : "Register passkey"}
                  </Button>
                  {passkeyMessage && <p className="text-sm text-muted-foreground mt-2">{passkeyMessage}</p>}
                </div>
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
                  <select
                    value={portfolio.published ? 'true' : 'false'}
                    onChange={(e) => updatePortfolio('published', e.target.value === 'true')}
                    className="ui-select rounded-lg border-border px-3 py-2"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </CardContent>
            </Card>

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
        // ... existing email templates case
      case 'business-preferences':
        // ... existing business preferences case
      // ... remaining cases
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
            href: '#',
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

// PasskeySection component removed - integrated into account-profile case above

function IntegrationCard({ name, description, status, action }: { name: string; description: string; status: 'active' | 'configured' | 'inactive'; action: React.ReactNode }) {
  // ... (same as before)
}
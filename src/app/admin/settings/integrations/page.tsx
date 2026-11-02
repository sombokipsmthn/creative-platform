'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { Plug as Plug2, CircleNotch as Loader2, Key, Globe, Database, CreditCard, ChatCircle as MessageCircle } from "@phosphor-icons/react";

interface Integration {
  integrationKey: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'configured' | 'inactive';
  config: Record<string, any>;
  connectedAt: string | null;
  id: string | null;
}

interface ApiIntegration {
  integrationKey: string;
  name: string;
  description: string;
  category: string;
  status: string;
  config: Record<string, any>;
  connectedAt: string | null;
  id: string | null;
}

const AVAILABLE_INTEGRATIONS = [
  {
    integrationKey: 'kra_etims',
    name: 'KRA eTIMS Taxpayer Portal Bridge',
    description: 'Connected to etims.kra.go.ke for tax compliance',
    category: 'tax',
  },
  {
    integrationKey: 'cloudflare_r2',
    name: 'Cloudflare R2 Object Storage',
    description: 'Object storage with zero egress fees',
    category: 'storage',
  },
  {
    integrationKey: 'google_drive',
    name: 'Google Drive Importer',
    description: 'OAuth 2.0 Read-Only Connector for importing assets',
    category: 'storage',
  },
  {
    integrationKey: 'mpesa',
    name: 'M-Pesa Payment Gateway',
    description: 'Safaricom Daraja API for payment collection',
    category: 'payments',
  },
  {
    integrationKey: 'slack',
    name: 'Slack Notifications',
    description: 'Post gallery activity to Slack channels',
    category: 'notifications',
  },
];

export default function AdminIntegrationsPage() {
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  const { data: integrationsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      if (!user) return null;
      const response = await fetch('/api/integrations', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load integrations');
      return response.json();
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const [message, setMessage] = useState<string | null>(null);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    if (isLoading || !user || !integrationsData) return;

    const newConfigValues: Record<string, Record<string, string>> = {};
    integrationsData.integrations.forEach((integration: ApiIntegration) => {
      if (integration.config) {
        newConfigValues[integration.integrationKey] = integration.config;
      }
    });
    setConfigValues(newConfigValues);
  }, [isLoading, user, integrationsData]);

  const connectMutation = useMutation({
    mutationFn: async (integrationKey: string) => {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationKey, action: 'connect' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Failed to connect integration');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setMessage('Integration connected successfully.');
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err) => {
      setMessage(err instanceof Error ? err.message : 'Failed to connect integration');
      setTimeout(() => setMessage(null), 5000);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (integrationKey: string) => {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationKey, action: 'disconnect' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Failed to disconnect integration');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setMessage('Integration disconnected.');
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err) => {
      setMessage(err instanceof Error ? err.message : 'Failed to disconnect integration');
      setTimeout(() => setMessage(null), 5000);
    },
  });

  const configureMutation = useMutation({
    mutationFn: async ({ integrationKey, config }: { integrationKey: string; config: Record<string, any> }) => {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationKey, action: 'configure', config }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Failed to configure integration');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setConfiguring(null);
      setMessage('Integration configured successfully.');
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err) => {
      setMessage(err instanceof Error ? err.message : 'Failed to configure integration');
      setTimeout(() => setMessage(null), 5000);
    },
  });

  const generateApiKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/integrations/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Failed to generate API key');
      return result;
    },
    onSuccess: (result) => {
      if (result.apiKey) {
        navigator.clipboard.writeText(result.apiKey);
        setMessage('API key generated and copied to clipboard!');
      } else {
        setMessage('API key generated!');
      }
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err) => {
      setMessage(err instanceof Error ? err.message : 'Failed to generate API key');
      setTimeout(() => setMessage(null), 5000);
    },
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { badge: 'Active', color: 'text-success-foreground dark:text-success-foreground', bgColor: 'bg-success/5 dark:bg-success/5', borderColor: 'border-success/20 dark:border-success/20' };
      case 'configured':
        return { badge: 'Configured', color: 'text-primary-foreground dark:text-primary-foreground', bgColor: 'bg-primary/10 dark:bg-primary/10', borderColor: 'border-primary/20 dark:border-primary/20' };
      case 'inactive':
      default:
        return { badge: 'Not Connected', color: 'text-muted-foreground', bgColor: 'bg-muted dark:bg-muted', borderColor: 'border-border dark:border-border' };
    }
  };

  const handleConfigChange = (integrationKey: string, key: string, value: string) => {
    setConfigValues(prev => ({
      ...prev,
      [integrationKey]: {
        ...prev[integrationKey],
        [key]: value,
      },
    }));
  };

  if (!user) {
    return null;
  }

  if (isPending || isLoading) {
    return (
      <main className="min-h-screen flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 animate-pulse" />
          <p className="text-sm text-muted-foreground uppercase">Loading integrations</p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-7xl py-8 sm:py-10">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive dark:border-destructive/20 dark:bg-destructive/5 dark:text-destructive-foreground">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
              Try again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const integrations = integrationsData?.integrations || [];

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl py-8 sm:py-10">
        <AdminPageHeader
          title="Integrations"
          description="Manage connected services, storage, and API integrations for your workspace."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          tabs={[
            { label: 'Account & Profile', href: '/admin/settings?tab=account-profile', active: false },
            { label: 'Business Preferences', href: '/admin/settings/business', active: false },
            { label: 'Gallery Defaults', href: '/admin/settings/gallery-defaults', active: false },
            { label: 'Notifications', href: '/admin/settings/notifications', active: false },
            { label: 'Integrations', href: '/admin/settings/integrations', active: true },
            { label: 'Sign-in & Sessions', href: '/admin/settings/security', active: false },
          ]}
        />

        <div className="space-y-8">
          {/* Connected Services */}
          <section className="rounded-xl border bg-card shadow-sm p-5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Connected Services</p>
            <h2 className="text-2xl font-semibold tracking-tight">Manage external services</h2>
            <p className="text-sm text-muted-foreground mt-2">Connect, configure, or disconnect services used by your workspace.</p>

            <div className="space-y-4 mt-4">
              {AVAILABLE_INTEGRATIONS.map((available) => {
                const connected = integrations.find((i: ApiIntegration) => i.integrationKey === available.integrationKey);
                const status = connected?.status || 'inactive';
                const statusConfig = getStatusConfig(status);
                const isConfiguring = configuring === available.integrationKey;

                return (
                  <div
                    key={available.integrationKey}
                    className={`p-4 border rounded-xl ${statusConfig.borderColor} ${statusConfig.bgColor} transition-colors`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Plug2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{available.name}</p>
                          <p className="text-sm text-muted-foreground">{available.description}</p>
                          {status === 'configured' && configValues[available.integrationKey] && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Configured: {Object.keys(configValues[available.integrationKey]).join(', ')}
                            </div>
                          )}
                          {connected?.connectedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Connected: {new Date(connected.connectedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Status badge */}
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.color} ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
                          {statusConfig.badge}
                        </span>

                        {/* Actions */}
                        {status === 'inactive' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => connectMutation.mutate(available.integrationKey)}
                            disabled={connectMutation.isPending}
                          >
                            {connectMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Connect'}
                          </Button>
                        )}

                        {status === 'active' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => disconnectMutation.mutate(available.integrationKey)}
                            disabled={disconnectMutation.isPending}
                          >
                            {disconnectMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Disconnect'}
                          </Button>
                        )}

                        {(status === 'active' || status === 'configured') && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setConfiguring(available.integrationKey)}
                            disabled={isConfiguring}
                          >
                            {isConfiguring ? 'Close' : 'Configure'}
                          </Button>
                        )}

                        {status === 'inactive' && available.integrationKey === 'google_drive' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfiguring(available.integrationKey)}
                          >
                            Configure
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Configuration form */}
                    {isConfiguring && (
                      <div className="mt-4 pt-4 border-t border-border space-y-4">
                        <p className="text-sm font-medium">Configuration</p>
                        {available.integrationKey === 'google_drive' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-sm font-medium leading-none">Client ID</label>
                              <Input
                                type="text"
                                value={configValues[available.integrationKey]?.clientId || ''}
                                onChange={(e) => handleConfigChange(available.integrationKey, 'clientId', e.target.value)}
                                placeholder="Enter Google OAuth Client ID"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium leading-none">Client Secret</label>
                              <Input
                                type="password"
                                value={configValues[available.integrationKey]?.clientSecret || ''}
                                onChange={(e) => handleConfigChange(available.integrationKey, 'clientSecret', e.target.value)}
                                placeholder="Enter Google OAuth Client Secret"
                              />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <label className="text-sm font-medium leading-none">Redirect URI</label>
                              <Input
                                type="text"
                                value={`${window.location.origin}/api/auth/callback/google`}
                                readOnly
                                className="bg-muted cursor-not-allowed"
                              />
                              <p className="text-xs text-muted-foreground">Add this URI to your Google OAuth consent screen</p>
                            </div>
                          </div>
                        )}

                        {available.integrationKey === 'cloudflare_r2' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-sm font-medium leading-none">Account ID</label>
                              <Input
                                type="text"
                                value={configValues[available.integrationKey]?.accountId || ''}
                                onChange={(e) => handleConfigChange(available.integrationKey, 'accountId', e.target.value)}
                                placeholder="Cloudflare Account ID"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium leading-none">Access Key ID</label>
                              <Input
                                type="text"
                                value={configValues[available.integrationKey]?.accessKeyId || ''}
                                onChange={(e) => handleConfigChange(available.integrationKey, 'accessKeyId', e.target.value)}
                                placeholder="R2 Access Key ID"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium leading-none">Secret Access Key</label>
                              <Input
                                type="password"
                                value={configValues[available.integrationKey]?.secretAccessKey || ''}
                                onChange={(e) => handleConfigChange(available.integrationKey, 'secretAccessKey', e.target.value)}
                                placeholder="R2 Secret Access Key"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium leading-none">Bucket Name</label>
                              <Input
                                type="text"
                                value={configValues[available.integrationKey]?.bucketName || ''}
                                onChange={(e) => handleConfigChange(available.integrationKey, 'bucketName', e.target.value)}
                                placeholder="R2 Bucket Name"
                              />
                            </div>
                          </div>
                        )}

                        {available.integrationKey === 'mpesa' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-sm font-medium leading-none">Consumer Key</label>
                              <Input
                                type="text"
                                value={configValues[available.integrationKey]?.consumerKey || ''}
                                onChange={(e) => handleConfigChange(available.integrationKey, 'consumerKey', e.target.value)}
                                placeholder="Daraja Consumer Key"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium leading-none">Consumer Secret</label>
                              <Input
                                type="password"
                                value={configValues[available.integrationKey]?.consumerSecret || ''}
                                onChange={(e) => handleConfigChange(available.integrationKey, 'consumerSecret', e.target.value)}
                                placeholder="Daraja Consumer Secret"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium leading-none">Shortcode</label>
                              <Input
                                type="text"
                                value={configValues[available.integrationKey]?.shortcode || ''}
                                onChange={(e) => handleConfigChange(available.integrationKey, 'shortcode', e.target.value)}
                                placeholder="Business Shortcode"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium leading-none">Passkey</label>
                              <Input
                                type="password"
                                value={configValues[available.integrationKey]?.passkey || ''}
                                onChange={(e) => handleConfigChange(available.integrationKey, 'passkey', e.target.value)}
                                placeholder="Lipa Na M-Pesa Passkey"
                              />
                            </div>
                          </div>
                        )}

                        {available.integrationKey === 'slack' && (
                          <div className="space-y-1">
                            <label className="text-sm font-medium leading-none">Webhook URL</label>
                            <Input
                              type="url"
                              value={configValues[available.integrationKey]?.webhookUrl || ''}
                              onChange={(e) => handleConfigChange(available.integrationKey, 'webhookUrl', e.target.value)}
                              placeholder="https://hooks.slack.com/services/..."
                            />
                          </div>
                        )}

                        {available.integrationKey === 'kra_etims' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-sm font-medium leading-none">API Key</label>
                              <Input
                                type="password"
                                value={configValues[available.integrationKey]?.apiKey || ''}
                                onChange={(e) => handleConfigChange(available.integrationKey, 'apiKey', e.target.value)}
                                placeholder="eTIMS API Key"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium leading-none">PIN</label>
                              <Input
                                type="text"
                                value={configValues[available.integrationKey]?.pin || ''}
                                onChange={(e) => handleConfigChange(available.integrationKey, 'pin', e.target.value)}
                                placeholder="eTIMS PIN"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              configureMutation.mutate({
                                integrationKey: available.integrationKey,
                                config: configValues[available.integrationKey] || {},
                              });
                            }}
                            disabled={configureMutation.isPending}
                          >
                            {configureMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : 'Save Configuration'}
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setConfiguring(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* API Access */}
          <section className="rounded-xl border bg-card shadow-sm p-5 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">API Access</p>
            <h2 className="text-2xl font-semibold tracking-tight">Custom API keys</h2>
            <p className="text-sm text-muted-foreground mt-2">Generate API keys for custom integrations and third-party tools.</p>

            <div className="mt-4 p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">API Key for Custom Integrations</p>
                  <p className="text-xs text-muted-foreground">Use this key to authenticate API requests from your own applications.</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => generateApiKeyMutation.mutate()}
                  disabled={generateApiKeyMutation.isPending}
                >
                  {generateApiKeyMutation.isPending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Key className="h-3 w-3 mr-1" />
                      Generate Key
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>

          {message && (
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${message.includes('error') ? 'border-destructive/20 bg-destructive/5 text-destructive dark:border-destructive/20 dark:bg-destructive/5 dark:text-destructive-foreground' : 'border-success/20 bg-success/5 text-success-foreground dark:border-success/20 dark:bg-success/5 dark:text-success-foreground'}`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
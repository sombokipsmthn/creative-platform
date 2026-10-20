'use client';

import Link from 'next/link';
import { ArrowRight, ExternalLink, UserRound, BriefcaseBusiness, ShieldCheck } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';
import WatermarkStudio from '@/components/WatermarkStudio';

const sections = [
  {
    title: 'Account and profile',
    description: 'Manage the identity clients see and the details used across your workspace.',
    links: [
      { href: '/admin/profile', icon: UserRound, title: 'Creator profile', description: 'Name, handle, contact details, business information, and passkeys.' },
      { href: '/admin/portfolio', icon: BriefcaseBusiness, title: 'Public portfolio', description: 'Choose public work, set your presentation, and publish your portfolio.' },
    ],
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <AdminPageHeader
          title="Settings"
          description="Keep your creator identity, public presence, and gallery delivery preferences in one predictable place."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
        />

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} aria-labelledby="account-settings-heading">
              <div className="mb-4">
                <h2 id="account-settings-heading" className="text-lg font-semibold tracking-tight">{section.title}</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{section.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {section.links.map(({ href, icon: Icon, title, description }) => (
                  <Link key={href} href={href} className="group rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <div className="flex items-start gap-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground"><Icon className="size-5" aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-3 font-medium"><span>{title}</span><ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
                        <span className="mt-1 block text-sm leading-6 text-muted-foreground">{description}</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          <section aria-labelledby="gallery-settings-heading">
            <div className="mb-4">
              <h2 id="gallery-settings-heading" className="text-lg font-semibold tracking-tight">Gallery delivery</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Set the default watermark inherited by new galleries. Gallery-specific delivery settings remain inside each gallery workspace.</p>
            </div>
            <WatermarkStudio />
          </section>

          <section aria-labelledby="security-settings-heading" className="rounded-xl border bg-muted/40 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <h2 id="security-settings-heading" className="font-medium">Security and authentication</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Authentication is managed by Better Auth. Use your profile page to register a passkey or update creator details.</p>
                <Button asChild variant="link" className="mt-2 h-auto px-0"><Link href="/admin/profile">Open creator profile <ExternalLink className="ml-1 size-3.5" aria-hidden="true" /></Link></Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

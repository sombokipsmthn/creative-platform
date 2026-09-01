'use client'

import { Layers, Sliders, Star, Settings, Heart, Palette } from 'lucide-react'

interface SidebarTab {
  type: string
  label: string
  icon: React.ReactNode
}

const tabs: SidebarTab[] = [
  {
    type: 'photos',
    label: 'Photos & Collections',
    icon: <Layers className="h-4 w-4" />,
  },
  {
    type: 'details',
    label: 'Gallery Details',
    icon: <Sliders className="h-4 w-4" />,
  },
  {
    type: 'themes',
    label: 'Theme & Design',
    icon: <Palette className="h-4 w-4" />,
  },
  {
    type: 'cover',
    label: 'Cover Image',
    icon: <Star className="h-4 w-4" />,
  },
  {
    type: 'settings',
    label: 'Settings & Access',
    icon: <Settings className="h-4 w-4" />,
  },
  {
    type: 'activity',
    label: 'Client Activity',
    icon: <Heart className="h-4 w-4" />,
  },
]

export default function ProjectSidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  return (
    <aside className="w-full shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] md:w-60 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col px-3 py-4 md:px-4 md:py-5">
        <div className="mb-5 px-2">
          <p className="os-eyebrow">Project</p>
          <h2 className="mt-2 text-base font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
            Project Tools
          </h2>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            Manage this client gallery
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-1 md:block md:space-y-1" aria-label="Project tools">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.type

            return (
              <button
                key={tab.type}
                type="button"
                onClick={() => onTabChange(tab.type)}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex min-h-10 w-full items-center gap-2.5 rounded-[0.7rem] px-3 py-2.5 text-left text-xs font-medium transition-all duration-150 md:text-sm ${
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm ring-1 ring-inset ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.55rem] border transition-colors ${
                    isActive
                      ? 'border-[color-mix(in_srgb,var(--accent)_20%,transparent)] bg-[var(--bg-card)] text-[var(--accent)]'
                      : 'border-transparent text-[var(--text-muted)] group-hover:border-[var(--border-subtle)] group-hover:bg-[var(--bg-card)] group-hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.icon}
                </span>
                <span className="min-w-0 truncate">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

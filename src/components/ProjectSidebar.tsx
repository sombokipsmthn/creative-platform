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
    icon: <Layers className="" />,
  },
  {
    type: 'details',
    label: 'Gallery Details',
    icon: <Sliders className="" />,
  },
  {
    type: 'themes',
    label: 'Theme & Design',
    icon: <Palette className="" />,
  },
  {
    type: 'cover',
    label: 'Cover Image',
    icon: <Star className="" />,
  },
  {
    type: 'settings',
    label: 'Settings & Access',
    icon: <Settings className="" />,
  },
  {
    type: 'activity',
    label: 'Client Activity',
    icon: <Heart className="" />,
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
    <aside className="">
      <div className="">
        <div className="">
          <p className="os-eyebrow">Gallery</p>
          <h2 className="">
            Gallery tools
          </h2>
          <p className="">
            Build and deliver this client gallery
          </p>
        </div>

        <nav className="" aria-label="Project tools">
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
                <span className="">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

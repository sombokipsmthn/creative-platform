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
    icon: <Layers className="w-4 h-4" />,
  },
  {
    type: 'details',
    label: 'Gallery Details',
    icon: <Sliders className="w-4 h-4" />,
  },
  {
    type: 'themes',
    label: 'Theme & Design',
    icon: <Palette className="w-4 h-4" />,
  },
  {
    type: 'cover',
    label: 'Cover Image',
    icon: <Star className="w-4 h-4" />,
  },
  {
    type: 'settings',
    label: 'Settings & Access',
    icon: <Settings className="w-4 h-4" />,
  },
  {
    type: 'activity',
    label: 'Client Activity',
    icon: <Heart className="w-4 h-4" />,
  },
]

export default function ProjectSidebar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <div className="w-64 h-full bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Project Tools</h2>
      </div>
      
      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => onTabChange(tab.type)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.type ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

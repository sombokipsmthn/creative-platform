'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GalleryTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface GalleryTopNavProps {
  tabs: GalleryTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function GalleryTopNav({
  tabs,
  activeTab,
  onTabChange,
}: GalleryTopNavProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="border-b border-border">
      <TabsList variant="line" className="w-full justify-start gap-6 overflow-x-auto rounded-none p-0">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} data-testid={`gallery-tab-${tab.id}`} className="flex-none gap-2 px-0 py-3 text-xs uppercase tracking-widest">
            {tab.icon}
            <span>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

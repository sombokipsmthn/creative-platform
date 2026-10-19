'use client';

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
    <div className="">
      <div className="">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`pb-3 text-xs font-sans uppercase tracking-widest cursor-pointer transition-all  whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-bold'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tab.icon && (
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center text-current ${
                  isActive
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-text-muted)]'
                }`}>
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

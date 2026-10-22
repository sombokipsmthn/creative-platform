'use client';

import { usePathname } from 'next/navigation';
import {
  Building2,
  Image,
  Droplet,
  FileText,
  Bell,
  Plug2,
  Shield,
} from 'lucide-react';

interface SettingsNavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const navigationItems: SettingsNavigationItem[] = [
  {
    id: 'workspace-business',
    label: 'Workspace & Business',
    icon: <Building2 className="h-4 w-4" />,
    description: 'Business name, KRA PIN, VAT, currency, tax defaults',
  },
  {
    id: 'gallery-delivery',
    label: 'Gallery Delivery',
    icon: <Image className="h-4 w-4" />,
    description: 'Default selection limits, expiration, download settings',
  },
  {
    id: 'watermarks',
    label: 'Watermarks',
    icon: <Droplet className="h-4 w-4" />,
    description: 'Text, image, opacity, position, presets',
  },
  {
    id: 'documents-communication',
    label: 'Documents & Communication',
    icon: <FileText className="h-4 w-4" />,
    description: 'Email templates, document numbering, communication defaults',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="h-4 w-4" />,
    description: 'Event preferences, email and in-app channels',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: <Plug2 className="h-4 w-4" />,
    description: 'Connected services, storage, API access',
  },
  {
    id: 'security',
    label: 'Security',
    icon: <Shield className="h-4 w-4" />,
    description: 'Passkeys, sessions, two-factor authentication',
  },
];

interface SettingsNavigationProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function SettingsNavigation({ activeSection, onSectionChange }: SettingsNavigationProps) {
  return (
    <nav
      className="hidden lg:block w-64 flex-shrink-0"
      aria-label="Settings sections"
    >
      <div className="sticky top-24">
        <ul className="space-y-1" role="list">
          {navigationItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-start gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  aria-current={isActive ? 'true' : 'false'}
                  aria-label={isActive ? `${item.label} (current)` : item.label}
                >
                  <span
                    className={`flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium truncate ${isActive ? '' : ''}`}>
                      {item.label}
                    </p>
                    <p className={`text-[11px] truncate ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <span
                      className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary-foreground"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

interface MobileSettingsTabsProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function MobileSettingsTabs({ activeSection, onSectionChange }: MobileSettingsTabsProps) {
  return (
    <div className="lg:hidden mb-6">
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide" role="tablist">
        {navigationItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSectionChange(item.id)}
              className={`flex-shrink-0 flex items-center gap-2 rounded-xl px-3 py-2.5 whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground bg-accent hover:bg-accent/80'
              }`}
            >
              <span className="h-4 w-4" aria-hidden="true" role="img" aria-label={item.label}>{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

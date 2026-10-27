'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  Keyboard,
  Sparkles,
  Plus,
  Settings,
  Users,
  FolderKanban,
  FileText,
  Receipt,
  Calendar,
  FileSignature,
  GalleryHorizontalEnd,
  LayoutDashboard,
  Globe,
  UserRound,
  CreditCard,
  Bell,
  Plug2,
  ShieldCheck,
  Image,
  Mail,
  MessageSquare,
  FileQuestion,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: string;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Define all available commands
  const commands = useMemo<CommandItem[]>(() => [
    // Navigation
    { id: 'nav-dashboard', label: 'Command Center', description: 'Go to dashboard overview', icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />, shortcut: '⌘1', category: 'Navigation', action: () => router.push('/admin'), keywords: ['dashboard', 'home', 'overview', 'command center'] },
    { id: 'nav-clients', label: 'Clients', description: 'Manage client CRM', icon: <Users className="h-4 w-4" aria-hidden="true" />, shortcut: '⌘2', category: 'Navigation', action: () => router.push('/admin/clients'), keywords: ['clients', 'crm', 'customers'] },
    { id: 'nav-projects', label: 'Projects', description: 'Track projects and engagements', icon: <FolderKanban className="h-4 w-4" aria-hidden="true" />, shortcut: '⌘3', category: 'Navigation', action: () => router.push('/admin/projects'), keywords: ['projects', 'engagements'] },
    { id: 'nav-galleries', label: 'Galleries', description: 'Manage client galleries', icon: <GalleryHorizontalEnd className="h-4 w-4" aria-hidden="true" />, shortcut: '⌘4', category: 'Navigation', action: () => router.push('/admin/galleries'), keywords: ['galleries', 'delivery', 'proofing'] },
    { id: 'nav-quotes', label: 'Quotes', description: 'Create and manage quotes', icon: <FileText className="h-4 w-4" aria-hidden="true" />, shortcut: '⌘5', category: 'Navigation', action: () => router.push('/admin/quotes'), keywords: ['quotes', 'estimates', 'proposals'] },
    { id: 'nav-invoices', label: 'Invoices', description: 'Manage invoices and payments', icon: <Receipt className="h-4 w-4" aria-hidden="true" />, shortcut: '⌘6', category: 'Navigation', action: () => router.push('/admin/invoices'), keywords: ['invoices', 'billing', 'payments'] },
    { id: 'nav-contracts', label: 'Contracts', description: 'Manage contracts and agreements', icon: <FileSignature className="h-4 w-4" aria-hidden="true" />, category: 'Navigation', action: () => router.push('/admin/contracts'), keywords: ['contracts', 'agreements', 'legal'] },
    { id: 'nav-portfolio', label: 'Portfolio', description: 'Manage public portfolio', icon: <Sparkles className="h-4 w-4" aria-hidden="true" />, category: 'Navigation', action: () => router.push('/admin/portfolio'), keywords: ['portfolio', 'public', 'showcase'] },
    { id: 'nav-settings', label: 'Settings', description: 'Workspace settings', icon: <Settings className="h-4 w-4" aria-hidden="true" />, category: 'Navigation', action: () => router.push('/admin/settings'), keywords: ['settings', 'preferences', 'configuration'] },

    // Quick Actions
    { id: 'action-new-client', label: 'New Client', description: 'Register a new client', icon: <Plus className="h-4 w-4" aria-hidden="true" />, category: 'Actions', action: () => router.push('/admin/clients?new=true'), keywords: ['new', 'create', 'add', 'client', 'register'] },
    { id: 'action-new-project', label: 'New Project', description: 'Create a new project', icon: <Plus className="h-4 w-4" aria-hidden="true" />, category: 'Actions', action: () => router.push('/admin/projects?new=true'), keywords: ['new', 'create', 'add', 'project'] },
    { id: 'action-new-quote', label: 'New Quote', description: 'Create a new quote', icon: <Plus className="h-4 w-4" aria-hidden="true" />, category: 'Actions', action: () => router.push('/admin/quotes/new'), keywords: ['new', 'create', 'add', 'quote', 'estimate'] },
    { id: 'action-new-invoice', label: 'New Invoice', description: 'Create a new invoice', icon: <Plus className="h-4 w-4" aria-hidden="true" />, category: 'Actions', action: () => router.push('/admin/invoices/new'), keywords: ['new', 'create', 'add', 'invoice', 'bill'] },
    { id: 'action-new-contract', label: 'New Contract', description: 'Create a new contract', icon: <Plus className="h-4 w-4" aria-hidden="true" />, category: 'Actions', action: () => router.push('/admin/contracts/new'), keywords: ['new', 'create', 'add', 'contract', 'agreement'] },
    { id: 'action-new-gallery', label: 'New Gallery', description: 'Create a new client gallery', icon: <Plus className="h-4 w-4" aria-hidden="true" />, category: 'Actions', action: () => router.push('/admin/galleries?new=true'), keywords: ['new', 'create', 'add', 'gallery', 'delivery'] },

    // Settings shortcuts
    { id: 'settings-profile', label: 'Profile Settings', description: 'Edit your profile and avatar', icon: <UserRound className="h-4 w-4" aria-hidden="true" />, category: 'Settings', action: () => router.push('/admin/settings?tab=account-profile'), keywords: ['profile', 'account', 'avatar', 'name'] },
    { id: 'settings-branding', label: 'Workspace Branding', description: 'Custom domain and logos', icon: <Globe className="h-4 w-4" aria-hidden="true" />, category: 'Settings', action: () => router.push('/admin/settings?tab=workspace-branding'), keywords: ['branding', 'domain', 'logo', 'custom'] },
    { id: 'settings-business', label: 'Business Preferences', description: 'Currency, tax, KRA PIN', icon: <CreditCard className="h-4 w-4" aria-hidden="true" />, category: 'Settings', action: () => router.push('/admin/settings/business'), keywords: ['business', 'tax', 'kra', 'currency', 'payment'] },
    { id: 'settings-gallery', label: 'Gallery Defaults', description: 'Default gallery settings', icon: <Image className="h-4 w-4" aria-hidden="true" />, category: 'Settings', action: () => router.push('/admin/settings/gallery-defaults'), keywords: ['gallery', 'defaults', 'watermark', 'delivery'] },
    { id: 'settings-notifications', label: 'Notifications', description: 'Configure notification preferences', icon: <Bell className="h-4 w-4" aria-hidden="true" />, category: 'Settings', action: () => router.push('/admin/settings/notifications'), keywords: ['notifications', 'email', 'alerts'] },
    { id: 'settings-integrations', label: 'Integrations', description: 'Connected services', icon: <Plug2 className="h-4 w-4" aria-hidden="true" />, category: 'Settings', action: () => router.push('/admin/settings/integrations'), keywords: ['integrations', 'api', 'services', 'connect'] },
    { id: 'settings-security', label: 'Sign-in & Sessions', description: 'Passkeys and active sessions', icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />, category: 'Settings', action: () => router.push('/admin/settings/security'), keywords: ['security', 'passkeys', 'sessions', '2fa'] },

    // Help
    { id: 'help-shortcuts', label: 'Keyboard Shortcuts', description: 'View all keyboard shortcuts', icon: <Keyboard className="h-4 w-4" aria-hidden="true" />, shortcut: '⌘/', category: 'Help', action: () => setIsOpen(true), keywords: ['help', 'shortcuts', 'keys', 'keyboard'] },
    { id: 'help-docs', label: 'Documentation', description: 'View help documentation', icon: <FileQuestion className="h-4 w-4" aria-hidden="true" />, category: 'Help', action: () => window.open('https://docs.creative-platform.com', '_blank'), keywords: ['help', 'docs', 'documentation', 'guide'] },
    { id: 'help-support', label: 'Contact Support', description: 'Get help from support team', icon: <HelpCircle className="h-4 w-4" aria-hidden="true" />, category: 'Help', action: () => window.open('mailto:support@creative-platform.com', '_blank'), keywords: ['help', 'support', 'contact', 'email'] },
  ], [router]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return commands;
    }
    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.description?.toLowerCase().includes(lowerQuery) ||
      cmd.category.toLowerCase().includes(lowerQuery) ||
      cmd.keywords?.some(k => k.toLowerCase().includes(lowerQuery)) ||
      cmd.shortcut?.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with ⌘K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setQuery('');
        setSelectedIndex(0);
      }

      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle internal keyboard navigation when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const totalItems = filteredCommands.length;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % totalItems);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            setIsOpen(false);
            setQuery('');
            setSelectedIndex(0);
          }
          break;
        case 'Tab':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % totalItems);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const categories = Object.keys(groupedCommands);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-2xl mx-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => { setIsOpen(false); setQuery(''); setSelectedIndex(0); }}
        />

        {/* Palette */}
        <div className="relative ui-card border-[var(--color-border-subtle)] shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="relative p-4 border-b border-[var(--color-border-subtle)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="w-full pl-10 pr-12 py-3 bg-[var(--color-bg-input)] border border-[var(--color-border-subtle)] rounded-xl text-[var(--color-text-primary)] text-base outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] placeholder-[var(--color-text-muted)]"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-bg-soft)] border border-[var(--color-border-subtle)] rounded">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {categories.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="mx-auto mb-3 h-8 w-8 text-[var(--color-text-muted)]" />
                <p className="text-[var(--color-text-muted)]">No commands found for &ldquo;{query}&rdquo;</p>
              </div>
            ) : (
              categories.map((category, catIndex) => (
                <div key={category} className="py-2">
                  <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    {category}
                  </div>
                  {groupedCommands[category].map((cmd, itemIndex) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          setIsOpen(false);
                          setQuery('');
                          setSelectedIndex(0);
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={cn(
                          'w-full px-4 py-3 flex items-center gap-3 text-left transition-colors',
                          isSelected
                            ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                            : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-soft)]'
                        )}
                      >
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                          {cmd.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{cmd.label}</p>
                          {cmd.description && (
                            <p className="text-xs text-[var(--color-text-muted)] truncate">{cmd.description}</p>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <kbd className="px-2 py-0.5 text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-bg-soft)] border border-[var(--color-border-subtle)] rounded">
                            {cmd.shortcut}
                          </kbd>
                        )}
                        <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer Hint */}
          <div className="px-4 py-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)]">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span>↑↓ Navigate • ⏎ Select • Esc Close</span>
              <span>⌘K to open</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
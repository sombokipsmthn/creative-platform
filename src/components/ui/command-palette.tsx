'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Bell, CreditCard, Signature as FileSignature, FileText, FolderSimple as FolderKanban, Keyboard, Images as GalleryHorizontalEnd, Image as ImageIcon, SquaresFour as LayoutDashboard, Plus, Receipt, MagnifyingGlass as Search, Gear as Settings, ShieldCheck, Sparkle as Sparkles, Users } from "@phosphor-icons/react";
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { isPaletteShortcut } from '@/lib/ui/keyboard-shortcuts';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
  keywords: string[];
}

const SHORTCUTS_EVENT = 'creative-platform:show-shortcuts';

function isEditableTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && (
    target.isContentEditable ||
    target.matches('input, textarea, select, [role="textbox"]')
  );
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands = useMemo<CommandItem[]>(() => [
    { id: 'nav-dashboard', label: 'Command Center', description: 'Open the studio dashboard', icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />, category: 'Navigation', action: () => router.push('/admin'), keywords: ['dashboard', 'home', 'overview'] },
    { id: 'nav-clients', label: 'Clients', description: 'Manage client records', icon: <Users className="h-4 w-4" aria-hidden="true" />, category: 'Navigation', action: () => router.push('/admin/clients'), keywords: ['crm', 'customers'] },
    { id: 'nav-projects', label: 'Projects', description: 'Manage client projects', icon: <FolderKanban className="h-4 w-4" aria-hidden="true" />, category: 'Navigation', action: () => router.push('/admin/projects'), keywords: ['engagements'] },
    { id: 'nav-galleries', label: 'Galleries', description: 'Manage client galleries', icon: <GalleryHorizontalEnd className="h-4 w-4" aria-hidden="true" />, category: 'Navigation', action: () => router.push('/admin/galleries'), keywords: ['delivery', 'proofing'] },
    { id: 'nav-quotes', label: 'Quotes', description: 'Manage quotes and proposals', icon: <FileText className="h-4 w-4" aria-hidden="true" />, category: 'Navigation', action: () => router.push('/admin/quotes'), keywords: ['estimates'] },
    { id: 'nav-invoices', label: 'Invoices', description: 'Manage invoices and payments', icon: <Receipt className="h-4 w-4" aria-hidden="true" />, category: 'Navigation', action: () => router.push('/admin/invoices'), keywords: ['billing', 'payments'] },
    { id: 'nav-contracts', label: 'Contracts', description: 'Manage client agreements', icon: <FileSignature className="h-4 w-4" aria-hidden="true" />, category: 'Navigation', action: () => router.push('/admin/contracts'), keywords: ['agreements'] },
    { id: 'nav-expenses', label: 'Expenses', description: 'Open expense management', icon: <CreditCard className="h-4 w-4" aria-hidden="true" />, category: 'Navigation', action: () => router.push('/admin/expenses'), keywords: ['receipts', 'claims'] },
    { id: 'nav-portfolio', label: 'Portfolio', description: 'Manage your public portfolio', icon: <Sparkles className="h-4 w-4" aria-hidden="true" />, category: 'Navigation', action: () => router.push('/admin/portfolio'), keywords: ['showcase', 'public'] },
    { id: 'nav-settings', label: 'Settings', description: 'Open workspace settings', icon: <Settings className="h-4 w-4" aria-hidden="true" />, category: 'Navigation', action: () => router.push('/admin/settings'), keywords: ['preferences'] },
    { id: 'action-new-client', label: 'New Client', description: 'Open the existing client creation form', icon: <Plus className="h-4 w-4" aria-hidden="true" />, category: 'Create', action: () => router.push('/admin/clients?new=true'), keywords: ['add', 'register'] },
    { id: 'action-new-project', label: 'New Project', description: 'Open the existing project creation form', icon: <Plus className="h-4 w-4" aria-hidden="true" />, category: 'Create', action: () => router.push('/admin/projects?new=true'), keywords: ['add'] },
    { id: 'action-new-gallery', label: 'New Gallery', description: 'Open the gallery creation workflow', icon: <Plus className="h-4 w-4" aria-hidden="true" />, category: 'Create', action: () => router.push('/admin/galleries?new=true'), keywords: ['add', 'delivery'] },
    { id: 'action-new-quote', label: 'New Quote', description: 'Start a quote', icon: <Plus className="h-4 w-4" aria-hidden="true" />, category: 'Create', action: () => router.push('/admin/quotes/new'), keywords: ['estimate', 'proposal'] },
    { id: 'action-new-invoice', label: 'New Invoice', description: 'Start an invoice', icon: <Plus className="h-4 w-4" aria-hidden="true" />, category: 'Create', action: () => router.push('/admin/invoices/new'), keywords: ['bill', 'payment'] },
    { id: 'action-new-contract', label: 'New Contract', description: 'Start the contract creation workflow', icon: <Plus className="h-4 w-4" aria-hidden="true" />, category: 'Create', action: () => router.push('/admin/contracts/new'), keywords: ['agreement'] },
    { id: 'settings-business', label: 'Business Preferences', description: 'Open currency and tax preferences', icon: <CreditCard className="h-4 w-4" aria-hidden="true" />, category: 'Settings', action: () => router.push('/admin/settings/business'), keywords: ['tax', 'kra', 'currency'] },
    { id: 'settings-gallery', label: 'Gallery Defaults', description: 'Manage default gallery settings', icon: <ImageIcon className="h-4 w-4" aria-hidden="true" />, category: 'Settings', action: () => router.push('/admin/settings/gallery-defaults'), keywords: ['watermark', 'delivery'] },
    { id: 'settings-notifications', label: 'Notifications', description: 'Manage notification preferences', icon: <Bell className="h-4 w-4" aria-hidden="true" />, category: 'Settings', action: () => router.push('/admin/settings/notifications'), keywords: ['email', 'alerts'] },
    { id: 'settings-security', label: 'Security', description: 'Manage sign-in and sessions', icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />, category: 'Settings', action: () => router.push('/admin/settings/security'), keywords: ['passkeys', 'sessions'] },
    { id: 'help-shortcuts', label: 'Keyboard Shortcuts', description: 'Show the available keyboard shortcuts', icon: <Keyboard className="h-4 w-4" aria-hidden="true" />, category: 'Help', action: () => window.dispatchEvent(new Event(SHORTCUTS_EVENT)), keywords: ['help', 'keys'] },
  ], [router]);

  const filteredCommands = useMemo(() => {
    const value = query.trim().toLocaleLowerCase();
    if (!value) return commands;
    return commands.filter((command) => [
      command.label,
      command.description,
      command.category,
      ...command.keywords,
    ].some((part) => part.toLocaleLowerCase().includes(value)));
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const groups = new Map<string, CommandItem[]>();
    for (const command of filteredCommands) {
      const items = groups.get(command.category) ?? [];
      items.push(command);
      groups.set(command.category, items);
    }
    return groups;
  }, [filteredCommands]);

  const closePalette = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const openPalette = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;

      if (isPaletteShortcut(event) && (isOpen || !isEditableTarget(event.target))) {
        event.preventDefault();
        if (isOpen) closePalette();
        else openPalette();
        return;
      }

      if (isOpen) {
        if (event.key === 'Escape') {
          event.preventDefault();
          closePalette();
          return;
        }
        return;
      }

    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closePalette, isOpen, openPalette]);

  useEffect(() => {
    const handleShortcutsRequest = () => setIsOpen(false);
    window.addEventListener(SHORTCUTS_EVENT, handleShortcutsRequest);
    return () => window.removeEventListener(SHORTCUTS_EVENT, handleShortcutsRequest);
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const selectCommand = (command: CommandItem) => {
    command.action();
    closePalette();
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && filteredCommands.length) {
      event.preventDefault();
      setSelectedIndex((index) => (index + 1) % filteredCommands.length);
    } else if (event.key === 'ArrowUp' && filteredCommands.length) {
      event.preventDefault();
      setSelectedIndex((index) => (index - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (event.key === 'Enter' && filteredCommands[selectedIndex]) {
      event.preventDefault();
      selectCommand(filteredCommands[selectedIndex]);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) openPalette();
        else closePalette();
      }}
    >
      <DialogContent
        className="top-[min(12vh,5rem)] w-[calc(100%-2rem)] max-w-2xl translate-y-0 gap-0 overflow-hidden rounded-xl border-border bg-popover p-0 text-popover-foreground shadow-2xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">Search and navigate to workspace pages and available actions.</DialogDescription>
        <div className="relative border-b border-border p-4">
          <Search aria-hidden="true" className="absolute left-7 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search pages and actions…"
            aria-label="Search commands"
            aria-controls="command-results"
            aria-activedescendant={filteredCommands[selectedIndex] ? `command-${filteredCommands[selectedIndex].id}` : undefined}
            autoComplete="off"
            spellCheck={false}
            className="h-12 w-full rounded-lg border border-input bg-background py-2 pl-11 pr-16 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <kbd className="absolute right-7 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-2 py-1 text-[10px] text-muted-foreground">⌘/Ctrl+Shift+.</kbd>
        </div>
        <div id="command-results" className="max-h-[60vh] overflow-y-auto py-2" role="listbox" aria-label="Command results">
          {filteredCommands.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No matching pages or actions.</p>
          ) : Array.from(groupedCommands.entries()).map(([category, items]) => (
            <div key={category}>
              <h2 className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</h2>
              {items.map((command) => {
                const index = filteredCommands.indexOf(command);
                const selected = index === selectedIndex;
                return (
                  <button
                    id={`command-${command.id}`}
                    key={command.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => selectCommand(command)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'group flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                      selected ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-muted/60',
                    )}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">{command.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{command.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{command.description}</span>
                    </span>
                    <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          <span>↑ ↓ Move · Enter Open · Esc Close</span>
          <span>⌘/Ctrl+Shift+. to open</span>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

export default CommandPalette;

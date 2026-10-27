'use client';

import React, { useEffect, useState } from 'react';
import { X, Keyboard, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  // Global keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with ⌘/ (Mac) or Ctrl+/ (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const shortcuts = [
    { category: 'Navigation', items: [
      { keys: '⌘1', description: 'Command Center (Dashboard)' },
      { keys: '⌘2', description: 'Clients' },
      { keys: '⌘3', description: 'Projects' },
      { keys: '⌘4', description: 'Galleries' },
      { keys: '⌘5', description: 'Quotes' },
      { keys: '⌘6', description: 'Invoices' },
    ]},
    { category: 'Global', items: [
      { keys: '⌘K', description: 'Open Command Palette' },
      { keys: '⌘/', description: 'Show Keyboard Shortcuts' },
      { keys: 'Esc', description: 'Close dialogs / Cancel' },
    ]},
    { category: 'Actions', items: [
      { keys: 'N', description: 'New item (context-aware)' },
      { keys: '⌘N', description: 'New Client/Project/Quote/Invoice' },
      { keys: 'S', description: 'Save current form' },
      { keys: '⌘S', description: 'Save & Continue' },
    ]},
    { category: 'Table Navigation', items: [
      { keys: '↑ / ↓', description: 'Navigate rows' },
      { keys: 'Enter', description: 'Open selected row' },
      { keys: 'Space', description: 'Toggle row selection' },
      { keys: '⌘A', description: 'Select all visible rows' },
    ]},
    { category: 'Search & Filter', items: [
      { keys: '/', description: 'Focus search input' },
      { keys: '⌘F', description: 'Focus search input' },
      { keys: 'Esc', description: 'Clear search / Close filters' },
    ]},
  ];

  return (
    <>
      {/* Trigger in header */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label="Show keyboard shortcuts"
          >
            <Keyboard className="h-4.5 w-4.5" aria-hidden="true" />
            <span className="sr-only">Keyboard Shortcuts</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-[480px] max-w-[90vw] p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <Keyboard className="h-6 w-6 text-primary" aria-hidden="true" />
              <div>
                <SheetTitle className="text-lg">Keyboard Shortcuts</SheetTitle>
                <SheetDescription>Boost your productivity with these shortcuts</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {shortcuts.map((group) => (
              <div key={group.category}>
                <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {group.category}
                </h3>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div key={item.keys} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-foreground">{item.description}</span>
                      <kbd className={cn(
                        'flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium',
                        'bg-muted text-muted-foreground border border-border rounded',
                        'whitespace-nowrap shrink-0'
                      )}>
                        {item.keys.split(' + ').map((key, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <ChevronRight className="h-3 w-3 opacity-50" />}
                            {key}
                          </React.Fragment>
                        ))}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-4">
            <p className="text-xs text-center text-muted-foreground">
              Shortcuts use <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border border-border rounded">⌘</kbd> (Mac) or <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border border-border rounded">Ctrl</kbd> (Windows/Linux)
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default KeyboardShortcuts;
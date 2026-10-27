'use client';

import React, { useEffect, useState } from 'react';
import { ChevronRight, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { isShortcutsHelpShortcut } from '@/lib/ui/keyboard-shortcuts';

const SHORTCUTS_EVENT = 'creative-platform:show-shortcuts';

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShortcutsRequest = () => setIsOpen(true);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || (event.target instanceof HTMLElement && (event.target.isContentEditable || event.target.matches('input, textarea, select, [role="textbox"]')))) return;
      if (isShortcutsHelpShortcut(event)) {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener(SHORTCUTS_EVENT, handleShortcutsRequest);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener(SHORTCUTS_EVENT, handleShortcutsRequest);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const shortcuts = [
    { category: 'Global', items: [
      { keys: '⌘ / Ctrl + Shift + .', description: 'Open or close the command palette' },
      { keys: 'Alt + Shift + /', description: 'Show keyboard shortcuts' },
      { keys: 'Esc', description: 'Close the active dialog or palette' },
    ]},
    { category: 'Command palette', items: [
      { keys: '↑ / ↓', description: 'Move through matching commands' },
      { keys: 'Enter', description: 'Open the selected command' },
    ]},
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Show keyboard shortcuts">
          <Keyboard className="h-4.5 w-4.5" aria-hidden="true" />
          <span className="sr-only">Keyboard Shortcuts</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[480px] max-w-[90vw] p-0">
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <Keyboard className="h-6 w-6 text-primary" aria-hidden="true" />
            <div>
              <SheetTitle className="text-lg">Keyboard Shortcuts</SheetTitle>
              <SheetDescription>Shortcuts available in the creative workspace</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="max-h-[calc(100vh-200px)] space-y-6 overflow-y-auto p-4">
          {shortcuts.map((group) => (
            <section key={group.category} aria-label={group.category}>
              <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.category}</h3>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.keys} className="flex items-center justify-between gap-4 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50">
                    <span className="text-sm text-foreground">{item.description}</span>
                    <kbd className={cn('flex shrink-0 items-center gap-1 whitespace-nowrap rounded border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground')}>
                      {item.keys.split(' + ').map((key, index) => (
                        <React.Fragment key={key}>
                          {index > 0 && <ChevronRight className="h-3 w-3 opacity-50" aria-hidden="true" />}
                          {key}
                        </React.Fragment>
                      ))}
                    </kbd>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="border-t p-4">
          <p className="text-center text-xs text-muted-foreground">The command palette uses a modified shortcut so typing in search fields is not intercepted.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default KeyboardShortcuts;

// src/components/ThemeToggle.tsx
'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot() {
  return typeof window !== 'undefined'
    ? localStorage.getItem('theme') || 'dark'
    : 'dark';
}

function getServerSnapshot() {
  return 'dark';
}

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';

    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Button
      onClick={toggleTheme}
      type="button"
      variant={compact ? 'ghost' : 'secondary'}
      size={compact ? 'icon' : 'default'}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={compact ? 'border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)]' : undefined}
    >
      {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
      {!compact && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
    </Button>
  );
}
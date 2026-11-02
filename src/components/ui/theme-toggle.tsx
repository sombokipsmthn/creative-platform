'use client';

import React from 'react';
import { Sun, Moon } from "@phosphor-icons/react";
import { useDesignSystem } from './DesignSystemProvider';
import { Button } from './button';

export interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useDesignSystem();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`h-9 w-9 rounded-full transition-all duration-300 ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
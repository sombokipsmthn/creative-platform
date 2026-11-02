'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface DesignSystemContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const DesignSystemContext = createContext<DesignSystemContextType | undefined>(undefined);

export function DesignSystemProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('gallery-theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('gallery-theme', theme);
    // Apply theme class to document element
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <DesignSystemContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </DesignSystemContext.Provider>
  );
}

export function useDesignSystem() {
  const context = useContext(DesignSystemContext);
  if (context === undefined) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
}

export default DesignSystemProvider;
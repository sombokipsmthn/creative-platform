// src/components/ThemeToggle.tsx
'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full border border-purple-500/30 bg-zinc-900/60" />;
  }

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="relative z-50 w-9 h-9 flex items-center justify-center rounded-full border border-purple-500/40 bg-zinc-900/80 hover:bg-purple-600/30 text-white transition-all shadow-md shrink-0 cursor-pointer"
    >
      <span className="text-base select-none">{isDark ? '☀️' : '🌙'}</span>
    </button>
  );
}
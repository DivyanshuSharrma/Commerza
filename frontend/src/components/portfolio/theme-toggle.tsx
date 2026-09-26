'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('commerza_theme') as 'light' | 'dark' | null;
    const initial = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    if (initial === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('commerza_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) {
    return <div className="w-16 h-8 rounded-full bg-border/40 animate-pulse" />;
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Bright / Dark Mode"
      className="relative flex items-center justify-between w-16 h-8 p-1 rounded-full bg-border/60 hover:bg-border transition-colors cursor-pointer border border-border/80 shadow-inner group"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Bright'} Mode`}
    >
      <span className="text-[12px] leading-none select-none pl-1 transition-opacity opacity-80 group-hover:opacity-100">
        ☀️
      </span>
      <span className="text-[12px] leading-none select-none pr-1 transition-opacity opacity-80 group-hover:opacity-100">
        🌙
      </span>
      <div
        className={`absolute top-1 bottom-1 w-6 bg-card rounded-full shadow-md transform transition-transform duration-300 ease-out flex items-center justify-center text-[10px] ${
          theme === 'dark' ? 'translate-x-8 text-indigo-400' : 'translate-x-0 text-amber-500'
        }`}
      >
        {theme === 'dark' ? '●' : '○'}
      </div>
    </button>
  );
}

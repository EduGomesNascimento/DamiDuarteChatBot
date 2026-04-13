'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { Suspense, useEffect, useState } from 'react';

function ThemeToggleContent() {
  const [mounted, setMounted] = useState(false);

  try {
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
      setMounted(true);
    }, []);

    return (
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-bg-card hover:bg-bg-card-hover border border-border transition-all duration-300 hover:border-brand-red"
        title={`Mudar para ${theme === 'light' ? 'modo escuro' : 'modo claro'}`}
        aria-label="Alternar tema"
      >
        {theme === 'light' ? (
          <span className="text-lg" role="img" aria-label="Moon">🌙</span>
        ) : (
          <span className="text-lg" role="img" aria-label="Sun">☀️</span>
        )}
      </button>
    );
  } catch {
    // During SSR or if ThemeProvider is not available, return a placeholder
    return <div className="w-10 h-10 rounded-full bg-bg-card" />;
  }
}

export function ThemeToggle() {
  return (
    <Suspense fallback={<div className="w-10 h-10 rounded-full bg-bg-card" />}>
      <ThemeToggleContent />
    </Suspense>
  );
}

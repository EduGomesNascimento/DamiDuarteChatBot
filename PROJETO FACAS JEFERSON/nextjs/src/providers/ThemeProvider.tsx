'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark'); // Default: dark mode
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Detectar tema salvo ou usar preferência do sistema
    const saved = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');

    // Aplicar tema ao HTML element (para Tailwind CSS)
    const html = document.documentElement;

    if (initial === 'dark') {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
    }

    // Também usar data-theme para CSS variables
    html.setAttribute('data-theme', initial);

    setTheme(initial);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      const html = document.documentElement;

      // Aplicar classe "dark" para Tailwind
      if (newTheme === 'dark') {
        html.classList.add('dark');
        html.style.colorScheme = 'dark';
      } else {
        html.classList.remove('dark');
        html.style.colorScheme = 'light';
      }

      // Também usar data-theme para CSS variables
      html.setAttribute('data-theme', newTheme);

      // Persistir em localStorage
      localStorage.setItem('theme', newTheme);

      return newTheme;
    });
  };

  // Prevent hydration mismatch - retornar sem context até montar
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

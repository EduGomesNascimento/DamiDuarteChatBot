import type { Config } from 'tailwindcss'

// Cores via CSS variables (canais RGB) — permitem tema dark/light e ajuste fácil.
const c = (v: string) => `rgb(var(${v}) / <alpha-value>)`

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: c('--c-bg'),
        surface: c('--c-surface'),
        'surface-2': c('--c-surface2'),
        line: c('--c-line'),
        header: c('--c-header'),
        header2: c('--c-header2'),
        primary: {
          DEFAULT: c('--c-primary'),
          fg: c('--c-primary-fg'),
        },
        secondary: {
          DEFAULT: c('--c-secondary'),
        },
        accent: {
          DEFAULT: c('--c-accent'),
          fg: c('--c-accent-fg'),
        },
        success: c('--c-success'),
        warning: c('--c-warning'),
        danger: c('--c-danger'),
        'text-primary': c('--c-text'),
        'text-secondary': c('--c-text2'),
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        glow: '0 1px 3px rgb(0 0 0 / 0.12)',
        'glow-lg': '0 4px 10px rgb(0 0 0 / 0.14)',
        'glow-accent': '0 2px 5px rgb(0 0 0 / 0.15)',
        'glow-violet': '0 1px 3px rgb(0 0 0 / 0.12)',
        card: '0 1px 3px rgb(0 0 0 / 0.1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        'bounce-cart': {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.4)' },
          '100%': { transform: 'scale(1)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'glow-border': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        shimmer: 'shimmer 1.5s infinite',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
        'bounce-cart': 'bounce-cart 0.5s ease-out',
        blink: 'blink 1s step-end infinite',
        float: 'float 6s ease-in-out infinite',
        'glow-border': 'glow-border 4s ease infinite',
      },
    },
  },
  plugins: [],
}

export default config

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCart } from '@/components/providers/CartProvider'
import { useTheme } from '@/components/providers/ThemeProvider'
import { cn } from '@/lib/utils'

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'RECA Componentes'

const links = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/catalogo?categoria=placas-mcu', label: 'Placas & MCUs' },
  { href: '/catalogo?categoria=sensores-modulos', label: 'Sensores' },
  { href: '/catalogo?categoria=circuitos-integrados', label: 'CIs' },
  { href: '/catalogo?categoria=resistores', label: 'Passivos' },
  { href: '/catalogo?categoria=ferramentas-solda', label: 'Ferramentas' },
  { href: '/catalogo?categoria=instrumentacao', label: 'Medição' },
]

export function Header() {
  const { totalItens, bump } = useCart()
  const { theme, toggle } = useTheme()
  const router = useRouter()
  const [busca, setBusca] = useState('')
  const [animateCart, setAnimateCart] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (bump > 0) {
      setAnimateCart(true)
      const t = setTimeout(() => setAnimateCart(false), 500)
      return () => clearTimeout(t)
    }
  }, [bump])

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    if (busca.trim()) router.push(`/catalogo?busca=${encodeURIComponent(busca.trim())}`)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary font-mono font-bold shadow-glow">
            RC
          </span>
          <span className="glitch hidden font-display font-bold sm:block">{storeName}</span>
        </Link>

        <form onSubmit={onSearch} className="relative hidden flex-1 md:block">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Busque por nome, SKU, tag ou arquitetura…"
            className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 pl-10 text-sm outline-none transition-colors focus:border-primary/60"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">⌕</span>
        </form>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.slice(0, 1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Alternar tema"
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-text-secondary transition-colors hover:text-primary"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <Link
            href="/minha-conta"
            aria-label="Minha conta"
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-text-secondary transition-colors hover:text-primary"
          >
            ◉
          </Link>
          <Link
            href="/carrinho"
            className="relative grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-text-secondary transition-colors hover:text-primary"
            aria-label="Carrinho"
          >
            🛒
            {totalItens > 0 && (
              <span
                className={cn(
                  'absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-fg',
                  animateCart && 'animate-bounce-cart'
                )}
              >
                {totalItens}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-text-secondary lg:hidden"
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Sub-nav de categorias (desktop) */}
      <div className="hidden border-t border-white/5 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-2">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="border-t border-white/5 bg-surface px-4 py-3 lg:hidden">
          <form onSubmit={onSearch} className="mb-3">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar…"
              className="w-full rounded-xl border border-white/10 bg-bg px-4 py-2.5 text-sm outline-none focus:border-primary/60"
            />
          </form>
          <div className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

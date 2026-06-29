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
    <header className="sticky top-0 z-50">
      {/* Linha principal — logo, busca, conta, carrinho */}
      <div className="bg-header text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="grid h-9 w-9 place-items-center rounded bg-white/10 text-white font-bold">
              RC
            </span>
            <span className="hidden font-bold leading-tight sm:block">{storeName}</span>
          </Link>

          <form onSubmit={onSearch} className="hidden flex-1 md:flex">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Busque por nome, SKU, tag ou arquitetura…"
              className="w-full rounded-l-md border-0 bg-white px-4 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="flex items-center justify-center rounded-r-md bg-accent px-4 text-text-primary transition-colors hover:bg-[#F7CA00]"
            >
              ⌕
            </button>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggle}
              aria-label="Alternar tema"
              className="hidden h-9 w-9 place-items-center rounded text-white/80 transition-colors hover:bg-white/10 sm:grid"
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <Link
              href="/auth"
              className="hidden flex-col rounded px-2 py-1.5 text-xs leading-tight text-white/90 transition-colors hover:bg-white/10 sm:flex"
            >
              <span>Olá, faça login</span>
              <span className="font-bold">Minha conta</span>
            </Link>
            <Link
              href="/minha-conta"
              aria-label="Minha conta"
              className="grid h-9 w-9 place-items-center rounded text-white/90 transition-colors hover:bg-white/10 sm:hidden"
            >
              ◉
            </Link>
            <Link
              href="/carrinho"
              className="relative flex items-center gap-1 rounded px-2 py-1.5 text-white/90 transition-colors hover:bg-white/10"
              aria-label="Carrinho"
            >
              <span className="text-xl">🛒</span>
              <span className="hidden text-sm font-bold sm:block">Carrinho</span>
              {totalItens > 0 && (
                <span
                  className={cn(
                    'absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg',
                    animateCart && 'animate-bounce-cart'
                  )}
                >
                  {totalItens}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="grid h-9 w-9 place-items-center rounded text-white/90 lg:hidden"
              aria-label="Menu"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Busca mobile */}
        <form onSubmit={onSearch} className="flex px-4 pb-2.5 md:hidden">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar…"
            className="w-full rounded-l-md border-0 bg-white px-4 py-2 text-sm text-text-primary outline-none"
          />
          <button
            type="submit"
            aria-label="Buscar"
            className="flex items-center justify-center rounded-r-md bg-accent px-4 text-text-primary"
          >
            ⌕
          </button>
        </form>
      </div>

      {/* Segunda linha — categorias */}
      <div className="hidden bg-header2 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-1.5">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="rounded px-2.5 py-1 text-xs font-medium text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="border-t border-line bg-surface px-4 py-3 lg:hidden">
          <div className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="rounded px-3 py-2.5 text-sm text-text-secondary hover:text-primary"
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

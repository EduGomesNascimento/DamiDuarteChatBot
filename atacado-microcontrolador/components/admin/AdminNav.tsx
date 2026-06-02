'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Dashboard', icon: '◈' },
  { href: '/admin/produtos', label: 'Produtos', icon: '⬡' },
  { href: '/admin/pedidos', label: 'Pedidos', icon: '◫' },
  { href: '/admin/usuarios', label: 'Usuários', icon: '◉' },
  { href: '/admin/cupons', label: 'Cupons', icon: '◌' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active =
          link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
              active
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'
            )}
          >
            <span className="font-mono text-base">{link.icon}</span>
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

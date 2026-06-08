'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useToast } from '@/components/providers/ToastProvider'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/minha-conta',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/minha-conta/pedidos',
    label: 'Meus pedidos',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    href: '/minha-conta/enderecos',
    label: 'Endereços',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/minha-conta/dados',
    label: 'Dados da conta',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast('Você saiu da conta.', 'info')
      router.push('/')
      router.refresh()
    } catch {
      toast('Erro ao sair.', 'error')
    }
  }

  return (
    <nav className="surface-card rounded-2xl p-3 space-y-1">
      {navItems.map((item) => {
        const isActive =
          item.href === '/minha-conta'
            ? pathname === '/minha-conta'
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        )
      })}

      <div className="pt-2 mt-2 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger/10 transition-all duration-200 w-full"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </button>
      </div>
    </nav>
  )
}

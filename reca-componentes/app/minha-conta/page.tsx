import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = {
  title: 'Dashboard — Minha Conta',
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth')

  let pedidosCount = 0
  let enderecosCount = 0
  let nomeCompleto = ''

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: user.sub },
      select: {
        nomeCompleto: true,
        _count: {
          select: { pedidos: true, enderecos: true },
        },
      },
    })
    pedidosCount = usuario?._count.pedidos ?? 0
    enderecosCount = usuario?._count.enderecos ?? 0
    nomeCompleto = usuario?.nomeCompleto ?? ''
  } catch {
    // silencioso em caso de erro de DB
  }

  const primeiroNome = nomeCompleto.split(' ')[0]

  const cards = [
    {
      label: 'Pedidos realizados',
      value: pedidosCount,
      href: '/minha-conta/pedidos',
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      label: 'Endereços salvos',
      value: enderecosCount,
      href: '/minha-conta/enderecos',
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/20',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Greeting */}
      <div className="surface-card rounded-2xl p-6 border border-primary/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-text-secondary text-sm">Bem-vindo de volta,</p>
            <h2 className="font-display text-2xl font-bold text-text-primary mt-1">
              {primeiroNome || 'Maker'} 👋
            </h2>
            <p className="text-text-secondary text-sm mt-2">{user.email}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="block">
            <div className={`surface-card rounded-2xl p-5 border ${card.border} hover:shadow-glow transition-all duration-200 cursor-pointer`}>
              <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center mb-3`}>
                {card.icon}
              </div>
              <p className={`font-display text-3xl font-bold ${card.color}`}>
                {card.value}
              </p>
              <p className="text-text-secondary text-sm mt-1">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="surface-card rounded-2xl p-6">
        <h3 className="font-medium text-text-primary mb-4">Ações rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/catalogo"
            className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-sm font-medium text-text-secondary">Ver catálogo</span>
          </Link>
          <Link
            href="/minha-conta/dados"
            className="flex items-center gap-3 p-3 rounded-xl border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-text-secondary">Editar dados</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

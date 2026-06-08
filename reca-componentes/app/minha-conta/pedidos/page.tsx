import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatBRL } from '@/lib/utils'
import type { StatusPedido } from '@prisma/client'
import Link from 'next/link'

export const metadata = {
  title: 'Meus Pedidos — Minha Conta',
}

const statusMap: Record<StatusPedido, { label: string; color: string }> = {
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando pagamento', color: 'text-warning bg-warning/10 border-warning/30' },
  PAGAMENTO_CONFIRMADO: { label: 'Pagamento confirmado', color: 'text-primary bg-primary/10 border-primary/30' },
  EM_SEPARACAO: { label: 'Em separação', color: 'text-primary bg-primary/10 border-primary/30' },
  ENVIADO: { label: 'Enviado', color: 'text-secondary bg-secondary/10 border-secondary/30' },
  ENTREGUE: { label: 'Entregue', color: 'text-success bg-success/10 border-success/30' },
  CANCELADO: { label: 'Cancelado', color: 'text-danger bg-danger/10 border-danger/30' },
  ESTORNADO: { label: 'Estornado', color: 'text-danger bg-danger/10 border-danger/30' },
}

export default async function PedidosPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth')

  let pedidos: Array<{
    id: string
    numero: string
    status: StatusPedido
    total: { toNumber: () => number }
    criadoEm: Date
    modalidadeFrete: string
    rastreamento: string | null
    itens: Array<{ id: string; nome: string; quantidade: number; subtotal: { toNumber: () => number } }>
  }> = []

  try {
    pedidos = await prisma.pedido.findMany({
      where: { usuarioId: user.sub },
      orderBy: { criadoEm: 'desc' },
      include: {
        itens: {
          select: {
            id: true,
            nome: true,
            quantidade: true,
            subtotal: true,
          },
        },
      },
    })
  } catch {
    // silencioso
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-xl font-bold text-text-primary">Meus pedidos</h2>
        <span className="text-text-secondary text-sm">{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}</span>
      </div>

      {pedidos.length === 0 ? (
        <div className="surface-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-text-secondary mb-2">Nenhum pedido ainda</p>
          <p className="text-text-secondary/60 text-sm mb-6">Explore nosso catálogo e faça seu primeiro pedido!</p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 btn-primary text-sm"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        pedidos.map((pedido) => {
          const statusInfo = statusMap[pedido.status]
          const totalItens = pedido.itens.reduce((sum, i) => sum + i.quantidade, 0)

          return (
            <div key={pedido.id} className="surface-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all duration-200">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-mono text-sm text-text-secondary">Pedido</p>
                  <p className="font-display font-bold text-text-primary">{pedido.numero}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>

              {/* Items preview */}
              <div className="space-y-1 mb-4">
                {pedido.itens.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary truncate max-w-[70%]">
                      {item.quantidade}x {item.nome}
                    </span>
                    <span className="text-text-primary font-mono text-xs">
                      {formatBRL(item.subtotal.toNumber())}
                    </span>
                  </div>
                ))}
                {pedido.itens.length > 3 && (
                  <p className="text-text-secondary/60 text-xs">+{pedido.itens.length - 3} item(ns)</p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                  <span>
                    {new Date(pedido.criadoEm).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </span>
                  <span>{totalItens} ite{totalItens !== 1 ? 'ns' : 'm'}</span>
                  <span>{pedido.modalidadeFrete}</span>
                  {pedido.rastreamento && (
                    <span className="font-mono text-primary text-xs">
                      {pedido.rastreamento}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-success">
                    {formatBRL(pedido.total.toNumber())}
                  </span>
                  <Link
                    href="/catalogo"
                    className="btn-ghost text-xs px-3 py-1.5"
                  >
                    Recomprar
                  </Link>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

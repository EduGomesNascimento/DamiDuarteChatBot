import { prisma } from '@/lib/prisma'
import { OrdersTable, type PedidoRow } from '@/components/admin/OrdersTable'
import type { StatusPedido } from '@/components/admin/StatusBadge'

export const dynamic = 'force-dynamic'

export default async function AdminPedidosPage() {
  let pedidos: PedidoRow[] = []
  try {
    const rows = await prisma.pedido.findMany({
      include: { usuario: { select: { nomeCompleto: true, email: true } } },
      orderBy: { criadoEm: 'desc' },
    })
    pedidos = rows.map((p) => ({
      id: p.id,
      numero: p.numero,
      cliente: p.usuario.nomeCompleto,
      email: p.usuario.email,
      total: Number(p.total),
      status: p.status as StatusPedido,
      rastreamento: p.rastreamento,
      data: p.criadoEm.toLocaleDateString('pt-BR'),
    }))
  } catch {
    pedidos = []
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Pedidos</h2>
        <a href="/api/admin/relatorios/pedidos" className="btn-ghost text-sm">
          ⬇ Exportar CSV
        </a>
      </div>
      <div className="surface-card p-2">
        <OrdersTable pedidos={pedidos} />
      </div>
    </div>
  )
}

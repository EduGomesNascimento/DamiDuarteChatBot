import { comAuth, ok } from '@/lib/api'
import { prisma } from '@/lib/prisma'

const CONFIRMED_STATUSES = [
  'PAGAMENTO_CONFIRMADO',
  'EM_SEPARACAO',
  'ENVIADO',
  'ENTREGUE',
] as const

export async function GET() {
  return comAuth(async () => {
    const now = new Date()

    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - 7)
    startOfWeek.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      vendasHoje,
      vendasSemana,
      vendasMes,
      totalPedidos,
      totalProdutos,
      totalClientes,
    ] = await Promise.all([
      prisma.pedido.aggregate({
        _sum: { total: true },
        where: {
          status: { in: [...CONFIRMED_STATUSES] },
          criadoEm: { gte: startOfToday },
        },
      }),
      prisma.pedido.aggregate({
        _sum: { total: true },
        where: {
          status: { in: [...CONFIRMED_STATUSES] },
          criadoEm: { gte: startOfWeek },
        },
      }),
      prisma.pedido.aggregate({
        _sum: { total: true },
        where: {
          status: { in: [...CONFIRMED_STATUSES] },
          criadoEm: { gte: startOfMonth },
        },
      }),
      prisma.pedido.count(),
      prisma.produto.count({ where: { ativo: true } }),
      prisma.usuario.count({ where: { role: 'CLIENTE' } }),
    ])

    // Last 7 days revenue per day
    const dias7: { dia: string; valor: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now)
      dayStart.setDate(now.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)

      const agg = await prisma.pedido.aggregate({
        _sum: { total: true },
        where: {
          status: { in: [...CONFIRMED_STATUSES] },
          criadoEm: { gte: dayStart, lte: dayEnd },
        },
      })

      const label = dayStart.toLocaleDateString('pt-BR', { weekday: 'short' })
      dias7.push({ dia: label, valor: Number(agg._sum.total ?? 0) })
    }

    // Top 5 produtos mais vendidos
    const topItems = await prisma.itemPedido.groupBy({
      by: ['produtoId'],
      _sum: { quantidade: true },
      orderBy: { _sum: { quantidade: 'desc' } },
      take: 5,
    })

    const topProdutos = await Promise.all(
      topItems.map(async (item) => {
        const produto = await prisma.produto.findUnique({
          where: { id: item.produtoId },
          select: { nome: true, sku: true },
        })
        return {
          produtoId: item.produtoId,
          nome: produto?.nome ?? '(removido)',
          sku: produto?.sku ?? '',
          quantidade: item._sum.quantidade ?? 0,
        }
      })
    )

    return ok({
      vendasHoje: Number(vendasHoje._sum.total ?? 0),
      vendasSemana: Number(vendasSemana._sum.total ?? 0),
      vendasMes: Number(vendasMes._sum.total ?? 0),
      totalPedidos,
      totalProdutos,
      totalClientes,
      receita7dias: dias7,
      topProdutos,
    })
  }, { admin: true })
}

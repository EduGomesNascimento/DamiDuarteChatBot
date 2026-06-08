import { prisma } from '@/lib/prisma'
import { formatBRL } from '@/lib/utils'
import { RevenueChart } from '@/components/admin/RevenueChart'

export const dynamic = 'force-dynamic'

const CONFIRMADOS = ['PAGAMENTO_CONFIRMADO', 'EM_SEPARACAO', 'ENVIADO', 'ENTREGUE'] as const

async function carregar() {
  const now = new Date()
  const inicioHoje = new Date(now)
  inicioHoje.setHours(0, 0, 0, 0)
  const inicioSemana = new Date(now)
  inicioSemana.setDate(now.getDate() - 7)
  inicioSemana.setHours(0, 0, 0, 0)
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)

  const [hoje, semana, mes, totalPedidos, totalProdutos, totalClientes] = await Promise.all([
    prisma.pedido.aggregate({ _sum: { total: true }, where: { status: { in: [...CONFIRMADOS] }, criadoEm: { gte: inicioHoje } } }),
    prisma.pedido.aggregate({ _sum: { total: true }, where: { status: { in: [...CONFIRMADOS] }, criadoEm: { gte: inicioSemana } } }),
    prisma.pedido.aggregate({ _sum: { total: true }, where: { status: { in: [...CONFIRMADOS] }, criadoEm: { gte: inicioMes } } }),
    prisma.pedido.count(),
    prisma.produto.count({ where: { ativo: true } }),
    prisma.usuario.count({ where: { role: 'CLIENTE' } }),
  ])

  const dias7: { dia: string; valor: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const ini = new Date(now)
    ini.setDate(now.getDate() - i)
    ini.setHours(0, 0, 0, 0)
    const fim = new Date(ini)
    fim.setHours(23, 59, 59, 999)
    const agg = await prisma.pedido.aggregate({
      _sum: { total: true },
      where: { status: { in: [...CONFIRMADOS] }, criadoEm: { gte: ini, lte: fim } },
    })
    dias7.push({ dia: ini.toLocaleDateString('pt-BR', { weekday: 'short' }), valor: Number(agg._sum.total ?? 0) })
  }

  const topItems = await prisma.itemPedido.groupBy({
    by: ['produtoId'],
    _sum: { quantidade: true },
    orderBy: { _sum: { quantidade: 'desc' } },
    take: 5,
  })
  const topProdutos = await Promise.all(
    topItems.map(async (it) => {
      const p = await prisma.produto.findUnique({ where: { id: it.produtoId }, select: { nome: true, sku: true } })
      return { nome: p?.nome ?? '(removido)', sku: p?.sku ?? '', quantidade: it._sum.quantidade ?? 0 }
    })
  )

  return {
    vendasHoje: Number(hoje._sum.total ?? 0),
    vendasSemana: Number(semana._sum.total ?? 0),
    vendasMes: Number(mes._sum.total ?? 0),
    totalPedidos,
    totalProdutos,
    totalClientes,
    dias7,
    topProdutos,
  }
}

export default async function AdminDashboard() {
  let dados: Awaited<ReturnType<typeof carregar>> | null = null
  try {
    dados = await carregar()
  } catch {
    dados = null
  }

  if (!dados) {
    return <div className="surface-card p-8 text-text-secondary">Não foi possível carregar os dados (banco indisponível).</div>
  }

  const cards = [
    { label: 'Vendas hoje', valor: formatBRL(dados.vendasHoje) },
    { label: 'Vendas na semana', valor: formatBRL(dados.vendasSemana) },
    { label: 'Vendas no mês', valor: formatBRL(dados.vendasMes) },
    { label: 'Total de pedidos', valor: String(dados.totalPedidos) },
    { label: 'Produtos ativos', valor: String(dados.totalProdutos) },
    { label: 'Clientes', valor: String(dados.totalClientes) },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="gradient-border p-5">
            <div className="text-xs font-mono uppercase tracking-wide text-text-secondary">{c.label}</div>
            <div className="mt-2 font-display text-2xl font-bold text-primary">{c.valor}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={dados.dias7} />
        </div>
        <div className="surface-card p-6">
          <h3 className="mb-4 font-display font-semibold">Mais vendidos</h3>
          {dados.topProdutos.length === 0 ? (
            <p className="text-sm text-text-secondary">Ainda sem vendas registradas.</p>
          ) : (
            <ol className="space-y-3">
              {dados.topProdutos.map((p, i) => (
                <li key={p.sku || i} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-primary">{i + 1}.</span>
                    <span className="truncate text-sm">{p.nome}</span>
                  </span>
                  <span className="font-mono text-xs text-text-secondary">{p.quantidade}x</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}

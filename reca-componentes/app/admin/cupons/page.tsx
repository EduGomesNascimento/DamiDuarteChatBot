import { prisma } from '@/lib/prisma'
import { CouponsManager, type CupomRow } from '@/components/admin/CouponsManager'

export const dynamic = 'force-dynamic'

export default async function AdminCuponsPage() {
  let cupons: CupomRow[] = []
  try {
    const rows = await prisma.cupom.findMany({ orderBy: { codigo: 'asc' } })
    cupons = rows.map((c) => ({
      id: c.id,
      codigo: c.codigo,
      tipo: c.tipo,
      valor: Number(c.valor),
      minimo: c.minimo ? Number(c.minimo) : null,
      usos: c.usos,
      maxUsos: c.maxUsos,
      expiraEm: c.expiraEm ? c.expiraEm.toISOString() : null,
      ativo: c.ativo,
    }))
  } catch {
    cupons = []
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">Cupons</h2>
      <CouponsManager cupons={cupons} />
    </div>
  )
}

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, erro } from '@/lib/api'
import { cupomSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = cupomSchema.safeParse(body)
    if (!parsed.success) {
      return erro(parsed.error.errors[0].message, 400)
    }

    const { codigo, subtotal } = parsed.data
    const codigoUpper = codigo.toUpperCase().trim()

    const cupom = await prisma.cupom.findUnique({ where: { codigo: codigoUpper } })

    if (!cupom) return erro('Cupom não encontrado', 400)
    if (!cupom.ativo) return erro('Cupom inativo', 400)
    if (cupom.expiraEm && cupom.expiraEm < new Date()) return erro('Cupom expirado', 400)
    if (cupom.maxUsos !== null && cupom.usos >= cupom.maxUsos)
      return erro('Cupom esgotado', 400)
    if (cupom.minimo !== null && subtotal < Number(cupom.minimo))
      return erro(
        `Pedido mínimo de R$ ${Number(cupom.minimo).toFixed(2).replace('.', ',')} para este cupom`,
        400
      )

    let desconto = 0
    if (cupom.tipo === 'PERCENTUAL') {
      desconto = subtotal * (Number(cupom.valor) / 100)
    } else {
      desconto = Number(cupom.valor)
    }
    desconto = Math.min(desconto, subtotal)

    return ok({
      valido: true,
      tipo: cupom.tipo,
      valor: Number(cupom.valor),
      desconto,
      codigo: cupom.codigo,
    })
  } catch (e) {
    console.error('[cupom]', e)
    return erro('Erro interno', 500)
  }
}

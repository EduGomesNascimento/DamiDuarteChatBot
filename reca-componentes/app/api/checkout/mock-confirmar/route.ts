import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { ok, erro, comAuth } from '@/lib/api'
import type { AuthPayload } from '@/lib/auth'

export async function POST(req: NextRequest) {
  return comAuth(async (user: AuthPayload) => {
    const body = await req.json()
    const { numero, resultado = 'aprovado' } = body as {
      numero: string
      resultado?: 'aprovado' | 'pendente' | 'recusado'
    }

    if (!numero) return erro('Número do pedido obrigatório', 400)

    const pedido = await prisma.pedido.findFirst({
      where: { numero, usuarioId: user.sub },
    })

    if (!pedido) return erro('Pedido não encontrado', 404)

    let statusPedido: 'PAGAMENTO_CONFIRMADO' | 'AGUARDANDO_PAGAMENTO' | 'CANCELADO'
    let statusPagamento: 'APROVADO' | 'PENDENTE' | 'RECUSADO'

    if (resultado === 'aprovado') {
      statusPedido = 'PAGAMENTO_CONFIRMADO'
      statusPagamento = 'APROVADO'
    } else if (resultado === 'pendente') {
      statusPedido = 'AGUARDANDO_PAGAMENTO'
      statusPagamento = 'PENDENTE'
    } else {
      statusPedido = 'CANCELADO'
      statusPagamento = 'RECUSADO'
    }

    const mpId = `mock-${numero}-${Date.now()}`

    await prisma.$transaction(async (tx) => {
      // If rejected: restore stock
      if (statusPedido === 'CANCELADO') {
        const itens = await tx.itemPedido.findMany({ where: { pedidoId: pedido.id } })
        for (const item of itens) {
          await tx.produto.update({
            where: { id: item.produtoId },
            data: { estoque: { increment: item.quantidade } },
          })
        }
      }

      // Upsert payment record
      await tx.pagamento.upsert({
        where: { mpPaymentId: mpId },
        update: {},
        create: {
          pedidoId: pedido.id,
          mpPaymentId: mpId,
          metodo: 'PIX',
          status: statusPagamento,
          valor: new Prisma.Decimal(pedido.total),
        },
      })

      // Update order
      await tx.pedido.update({
        where: { id: pedido.id },
        data: {
          status: statusPedido,
          mpStatus: resultado,
          mpPaymentId: mpId,
        },
      })
    })

    return ok({ ok: true, status: statusPedido, mpId })
  })
}

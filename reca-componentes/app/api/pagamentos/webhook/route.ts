import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import {
  validarAssinaturaWebhook,
  consultarPagamento,
  mapStatusMP,
} from '@/lib/mercadopago'
import { emailConfirmacaoPedido } from '@/lib/resend'
import { formatBRL } from '@/lib/utils'

// MP requires a 200 response quickly even on errors
function resp200() {
  return NextResponse.json({ ok: true }, { status: 200 })
}

export async function POST(req: NextRequest) {
  try {
    const signatureHeader = req.headers.get('x-signature')
    const requestId = req.headers.get('x-request-id')
    const url = new URL(req.url)
    const dataId = url.searchParams.get('data.id') || url.searchParams.get('id')

    // Validate webhook signature
    const valido = validarAssinaturaWebhook({ signatureHeader, requestId, dataId })
    if (!valido) {
      console.warn('[webhook] Assinatura inválida')
      return NextResponse.json({ erro: 'Assinatura inválida' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const tipo = body?.type || body?.action
    const mpDataId = body?.data?.id || dataId

    // Only process payment notifications
    if (tipo !== 'payment' && !mpDataId) return resp200()
    if (!mpDataId) return resp200()

    const payment = await consultarPagamento(String(mpDataId))
    if (!payment) return resp200()

    const externalRef = payment.external_reference
    if (!externalRef) return resp200()

    const mpStatus = (payment.status as string) || 'pending'
    const statusPagamento = mapStatusMP(mpStatus)

    let statusPedido: string
    if (statusPagamento === 'APROVADO') {
      statusPedido = 'PAGAMENTO_CONFIRMADO'
    } else if (statusPagamento === 'ESTORNADO') {
      statusPedido = 'ESTORNADO'
    } else if (statusPagamento === 'RECUSADO') {
      statusPedido = 'CANCELADO'
    } else {
      statusPedido = 'AGUARDANDO_PAGAMENTO'
    }

    const pedido = await prisma.pedido.findFirst({
      where: { numero: externalRef },
      include: { itens: true, usuario: { select: { email: true } } },
    })

    if (!pedido) {
      console.warn('[webhook] Pedido não encontrado:', externalRef)
      return resp200()
    }

    await prisma.$transaction(async (tx) => {
      // Restore stock if rejected or refunded
      if (statusPedido === 'CANCELADO' || statusPedido === 'ESTORNADO') {
        if (pedido.status !== 'CANCELADO' && pedido.status !== 'ESTORNADO') {
          for (const item of pedido.itens) {
            await tx.produto.update({
              where: { id: item.produtoId },
              data: { estoque: { increment: item.quantidade } },
            })
          }
        }
      }

      const mpPaymentId = String(mpDataId)

      // Upsert payment record
      const existePagamento = await tx.pagamento.findUnique({ where: { mpPaymentId } })
      if (existePagamento) {
        await tx.pagamento.update({
          where: { mpPaymentId },
          data: { status: statusPagamento },
        })
      } else {
        await tx.pagamento.create({
          data: {
            pedidoId: pedido.id,
            mpPaymentId,
            metodo: 'PIX',
            status: statusPagamento,
            valor: new Prisma.Decimal(pedido.total),
            detalhes: { mpStatus, tipo: payment.payment_type_id },
          },
        })
      }

      // Update order status
      await tx.pedido.update({
        where: { id: pedido.id },
        data: {
          status: statusPedido as Parameters<typeof tx.pedido.update>[0]['data']['status'],
          mpStatus,
          mpPaymentId: String(mpDataId),
        },
      })
    })

    // E-mail de confirmação ao aprovar (apenas na transição)
    if (statusPagamento === 'APROVADO' && pedido.status !== 'PAGAMENTO_CONFIRMADO') {
      try {
        await emailConfirmacaoPedido(
          pedido.usuario.email,
          pedido.numero,
          formatBRL(Number(pedido.total))
        )
      } catch (mailErr) {
        console.error('[webhook] falha ao enviar e-mail de confirmação:', mailErr)
      }
    }

    return resp200()
  } catch (e) {
    console.error('[webhook] Erro:', e)
    // Always return 200 to MP so it doesn't retry endlessly
    return resp200()
  }
}

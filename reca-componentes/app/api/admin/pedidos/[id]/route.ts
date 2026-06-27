import { comAuth, ok, erro } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { emailPedidoEnviado } from '@/lib/resend'

interface RouteParams {
  params: { id: string }
}

const patchSchema = z.object({
  status: z
    .enum([
      'AGUARDANDO_PAGAMENTO',
      'PAGAMENTO_CONFIRMADO',
      'EM_SEPARACAO',
      'ENVIADO',
      'ENTREGUE',
      'CANCELADO',
      'ESTORNADO',
    ])
    .optional(),
  rastreamento: z.string().optional(),
})

export async function PATCH(request: Request, { params }: RouteParams) {
  return comAuth(async () => {
    const { id } = params
    const existing = await prisma.pedido.findUnique({ where: { id } })
    if (!existing) return erro('Pedido não encontrado', 404)

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return erro(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400)

    const pedido = await prisma.pedido.update({
      where: { id },
      data: parsed.data,
      include: {
        usuario: { select: { nomeCompleto: true, email: true } },
        itens: true,
      },
    })

    if (parsed.data.status === 'ENVIADO' && existing.status !== 'ENVIADO') {
      try {
        await emailPedidoEnviado(pedido.usuario.email, pedido.numero, pedido.rastreamento ?? 'em breve')
      } catch (mailErr) {
        console.error('[admin/pedidos] falha ao enviar e-mail de envio:', mailErr)
      }
    }

    return ok(pedido)
  }, { admin: true })
}

export async function GET(_request: Request, { params }: RouteParams) {
  return comAuth(async () => {
    const { id } = params
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        usuario: { select: { nomeCompleto: true, email: true } },
        itens: true,
        pagamentos: true,
      },
    })
    if (!pedido) return erro('Pedido não encontrado', 404)
    return ok(pedido)
  }, { admin: true })
}

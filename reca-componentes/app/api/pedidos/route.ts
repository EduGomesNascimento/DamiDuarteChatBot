import { ok, comAuth } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import type { AuthPayload } from '@/lib/auth'

export async function GET() {
  return comAuth(async (user: AuthPayload) => {
    const pedidos = await prisma.pedido.findMany({
      where: { usuarioId: user.sub },
      orderBy: { criadoEm: 'desc' },
      include: {
        itens: true,
        endereco: true,
        pagamentos: { orderBy: { criadoEm: 'desc' }, take: 1 },
      },
    })
    return ok(pedidos)
  })
}

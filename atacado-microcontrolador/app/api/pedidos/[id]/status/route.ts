import { NextRequest } from 'next/server'
import { ok, erro, comAuth } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import type { AuthPayload } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return comAuth(async (user: AuthPayload) => {
    const { id } = params

    // Allow lookup by either DB id or pedido numero
    const pedido = await prisma.pedido.findFirst({
      where: {
        OR: [{ id }, { numero: id }],
        usuarioId: user.sub,
      },
      select: {
        id: true,
        numero: true,
        status: true,
        mpStatus: true,
        total: true,
        criadoEm: true,
        atualizadoEm: true,
      },
    })

    if (!pedido) return erro('Pedido não encontrado', 404)

    return ok(pedido)
  })
}

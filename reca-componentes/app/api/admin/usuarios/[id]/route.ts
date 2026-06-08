import { comAuth, ok, erro } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface RouteParams {
  params: { id: string }
}

const patchSchema = z.object({
  role: z.enum(['CLIENTE', 'ADMIN']),
})

export async function PATCH(request: Request, { params }: RouteParams) {
  return comAuth(async () => {
    const { id } = params
    const existing = await prisma.usuario.findUnique({ where: { id } })
    if (!existing) return erro('Usuário não encontrado', 404)

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return erro(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400)

    const usuario = await prisma.usuario.update({
      where: { id },
      data: { role: parsed.data.role },
      select: {
        id: true,
        email: true,
        nomeCompleto: true,
        role: true,
        criadoEm: true,
      },
    })

    return ok(usuario)
  }, { admin: true })
}

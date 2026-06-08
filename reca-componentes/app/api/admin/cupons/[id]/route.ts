import { comAuth, ok, erro } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

interface RouteParams {
  params: { id: string }
}

const patchSchema = z.object({
  ativo: z.boolean().optional(),
  valor: z.number().positive().optional(),
  minimo: z.number().min(0).nullable().optional(),
  maxUsos: z.number().int().positive().nullable().optional(),
  expiraEm: z.string().nullable().optional(),
})

export async function PATCH(request: Request, { params }: RouteParams) {
  return comAuth(async () => {
    const { id } = params
    const existing = await prisma.cupom.findUnique({ where: { id } })
    if (!existing) return erro('Cupom não encontrado', 404)

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return erro(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400)

    const updateData: Prisma.CupomUpdateInput = {}
    if (parsed.data.ativo !== undefined) updateData.ativo = parsed.data.ativo
    if (parsed.data.valor !== undefined) updateData.valor = new Prisma.Decimal(parsed.data.valor)
    if (parsed.data.minimo !== undefined) {
      updateData.minimo = parsed.data.minimo != null ? new Prisma.Decimal(parsed.data.minimo) : null
    }
    if (parsed.data.maxUsos !== undefined) updateData.maxUsos = parsed.data.maxUsos
    if (parsed.data.expiraEm !== undefined) {
      updateData.expiraEm = parsed.data.expiraEm ? new Date(parsed.data.expiraEm) : null
    }

    const cupom = await prisma.cupom.update({ where: { id }, data: updateData })
    return ok(cupom)
  }, { admin: true })
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  return comAuth(async () => {
    const { id } = params
    const existing = await prisma.cupom.findUnique({ where: { id } })
    if (!existing) return erro('Cupom não encontrado', 404)

    await prisma.cupom.delete({ where: { id } })
    return ok({ ok: true })
  }, { admin: true })
}

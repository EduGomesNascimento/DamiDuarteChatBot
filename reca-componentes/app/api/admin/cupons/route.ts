import { comAuth, ok, erro } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

const cupomCreateSchema = z.object({
  codigo: z.string().trim().min(1, 'Código obrigatório'),
  tipo: z.enum(['PERCENTUAL', 'FIXO']),
  valor: z.number().positive('Valor deve ser positivo'),
  minimo: z.number().min(0).optional().nullable(),
  maxUsos: z.number().int().positive().optional().nullable(),
  expiraEm: z.string().optional().nullable(),
  ativo: z.boolean().optional().default(true),
})

export async function POST(request: Request) {
  return comAuth(async () => {
    const body = await request.json()
    const parsed = cupomCreateSchema.safeParse(body)
    if (!parsed.success) {
      return erro(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400)
    }

    const data = parsed.data
    const codigo = data.codigo.toUpperCase()

    const existing = await prisma.cupom.findUnique({ where: { codigo } })
    if (existing) return erro('Código de cupom já existe', 409)

    const cupom = await prisma.cupom.create({
      data: {
        codigo,
        tipo: data.tipo,
        valor: new Prisma.Decimal(data.valor),
        minimo: data.minimo != null ? new Prisma.Decimal(data.minimo) : null,
        maxUsos: data.maxUsos ?? null,
        expiraEm: data.expiraEm ? new Date(data.expiraEm) : null,
        ativo: data.ativo ?? true,
      },
    })

    return ok(cupom, { status: 201 })
  }, { admin: true })
}

export async function GET() {
  return comAuth(async () => {
    const cupons = await prisma.cupom.findMany({
      orderBy: { codigo: 'asc' },
    })
    return ok(cupons)
  }, { admin: true })
}

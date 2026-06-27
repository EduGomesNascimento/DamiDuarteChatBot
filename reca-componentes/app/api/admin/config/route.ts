import { comAuth, ok, erro } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { configSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'

export async function GET() {
  return comAuth(async () => {
    const c = await prisma.configuracao.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default' },
    })
    return ok({
      nomeLoja: c.nomeLoja,
      freteGratisAtivo: c.freteGratisAtivo,
      freteGratisMinimo: Number(c.freteGratisMinimo),
      descontoGlobalPct: Number(c.descontoGlobalPct),
      bannerTexto: c.bannerTexto,
    })
  }, { admin: true })
}

export async function PATCH(request: Request) {
  return comAuth(async () => {
    const body = await request.json()
    const parsed = configSchema.safeParse(body)
    if (!parsed.success) return erro(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400)
    const d = parsed.data

    const data: {
      nomeLoja?: string
      freteGratisAtivo?: boolean
      freteGratisMinimo?: Prisma.Decimal
      descontoGlobalPct?: Prisma.Decimal
      bannerTexto?: string | null
    } = {}
    if (d.nomeLoja !== undefined) data.nomeLoja = d.nomeLoja
    if (d.freteGratisAtivo !== undefined) data.freteGratisAtivo = d.freteGratisAtivo
    if (d.freteGratisMinimo !== undefined) data.freteGratisMinimo = new Prisma.Decimal(d.freteGratisMinimo)
    if (d.descontoGlobalPct !== undefined) data.descontoGlobalPct = new Prisma.Decimal(d.descontoGlobalPct)
    if (d.bannerTexto !== undefined) data.bannerTexto = d.bannerTexto

    const c = await prisma.configuracao.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    })
    return ok({
      nomeLoja: c.nomeLoja,
      freteGratisAtivo: c.freteGratisAtivo,
      freteGratisMinimo: Number(c.freteGratisMinimo),
      descontoGlobalPct: Number(c.descontoGlobalPct),
      bannerTexto: c.bannerTexto,
    })
  }, { admin: true })
}

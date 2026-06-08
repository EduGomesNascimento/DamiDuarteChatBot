import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, erro, comAuth } from '@/lib/api'
import { enderecoSchema } from '@/lib/validations'
import type { AuthPayload } from '@/lib/auth'

export async function GET() {
  return comAuth(async (user: AuthPayload) => {
    const enderecos = await prisma.endereco.findMany({
      where: { usuarioId: user.sub },
      orderBy: [{ principal: 'desc' }, { id: 'asc' }],
    })
    return ok(enderecos)
  })
}

export async function POST(req: NextRequest) {
  return comAuth(async (user: AuthPayload) => {
    const body = await req.json()
    const parsed = enderecoSchema.safeParse(body)
    if (!parsed.success) {
      return erro(parsed.error.errors[0].message, 400)
    }

    const data = parsed.data

    // Se for principal, desmarcar os outros
    if (data.principal) {
      await prisma.endereco.updateMany({
        where: { usuarioId: user.sub },
        data: { principal: false },
      })
    }

    const endereco = await prisma.endereco.create({
      data: {
        usuarioId: user.sub,
        apelido: data.apelido,
        cep: data.cep,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento ?? '',
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        principal: data.principal ?? false,
      },
    })

    return ok(endereco)
  })
}

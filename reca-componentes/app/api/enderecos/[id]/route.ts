import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, erro, comAuth } from '@/lib/api'
import { enderecoSchema } from '@/lib/validations'
import type { AuthPayload } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return comAuth(async (user: AuthPayload) => {
    const { id } = params

    const existing = await prisma.endereco.findUnique({ where: { id } })
    if (!existing || existing.usuarioId !== user.sub) {
      return erro('Endereço não encontrado', 404)
    }

    const body = await req.json()
    const parsed = enderecoSchema.safeParse(body)
    if (!parsed.success) {
      return erro(parsed.error.errors[0].message, 400)
    }

    const data = parsed.data

    if (data.principal) {
      await prisma.endereco.updateMany({
        where: { usuarioId: user.sub, id: { not: id } },
        data: { principal: false },
      })
    }

    const atualizado = await prisma.endereco.update({
      where: { id },
      data: {
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

    return ok(atualizado)
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return comAuth(async (user: AuthPayload) => {
    const { id } = params

    const existing = await prisma.endereco.findUnique({ where: { id } })
    if (!existing || existing.usuarioId !== user.sub) {
      return erro('Endereço não encontrado', 404)
    }

    await prisma.endereco.delete({ where: { id } })

    return ok({ ok: true })
  })
}

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ok, erro, comAuth } from '@/lib/api'
import type { AuthPayload } from '@/lib/auth'

const updateSchema = z.object({
  nomeCompleto: z.string().trim().min(3, 'Nome muito curto').optional(),
  telefone: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length >= 10 && v.length <= 11, 'Telefone inválido')
    .optional(),
})

export async function PATCH(req: NextRequest) {
  return comAuth(async (user: AuthPayload) => {
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return erro(parsed.error.errors[0].message, 400)
    }

    const data = parsed.data

    if (!data.nomeCompleto && !data.telefone) {
      return erro('Nenhum campo para atualizar', 400)
    }

    const atualizado = await prisma.usuario.update({
      where: { id: user.sub },
      data: {
        ...(data.nomeCompleto ? { nomeCompleto: data.nomeCompleto } : {}),
        ...(data.telefone ? { telefone: data.telefone } : {}),
      },
      select: {
        id: true,
        email: true,
        nomeCompleto: true,
        telefone: true,
        role: true,
        emailVerificado: true,
      },
    })

    return ok(atualizado)
  })
}

export async function GET() {
  return comAuth(async (user: AuthPayload) => {
    const usuario = await prisma.usuario.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        email: true,
        nomeCompleto: true,
        telefone: true,
        role: true,
        emailVerificado: true,
        criadoEm: true,
        cpf: true,
      },
    })

    if (!usuario) return erro('Usuário não encontrado', 404)

    // Mascarar CPF
    const cpf = usuario.cpf.replace(/\D/g, '')
    const cpfMascarado =
      cpf.length === 11
        ? `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
        : '***.***.***-**'

    return ok({ ...usuario, cpf: cpfMascarado })
  })
}

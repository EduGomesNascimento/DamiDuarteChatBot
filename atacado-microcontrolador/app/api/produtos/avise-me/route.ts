import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { avisoEstoqueSchema } from '@/lib/validations'
import { ok, erro } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = avisoEstoqueSchema.safeParse(body)

    if (!result.success) {
      return erro(result.error.errors[0]?.message ?? 'Dados inválidos', 400)
    }

    const { produtoId, email } = result.data

    await prisma.avisoEstoque.upsert({
      where: { produtoId_email: { produtoId, email } },
      create: { produtoId, email },
      update: {},
    })

    return ok({ sucesso: true })
  } catch (e) {
    console.error(e)
    return erro('Erro ao registrar aviso', 500)
  }
}

import { prisma } from '@/lib/prisma'
import { ok, erro, usuarioDaRequest } from '@/lib/api'

function mascaraCpf(cpf: string) {
  const c = cpf.replace(/\D/g, '')
  if (c.length !== 11) return '***.***.***-**'
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`
    .replace(/\d(?=\d{2}-\d{2}$)/g, '*')
}

export async function GET() {
  try {
    const authUser = await usuarioDaRequest()
    if (!authUser) return erro('Não autenticado', 401)

    const usuario = await prisma.usuario.findUnique({
      where: { id: authUser.sub },
      select: {
        id: true,
        email: true,
        nomeCompleto: true,
        telefone: true,
        role: true,
        emailVerificado: true,
        criadoEm: true,
        enderecos: {
          select: {
            id: true,
            apelido: true,
            cep: true,
            logradouro: true,
            numero: true,
            complemento: true,
            bairro: true,
            cidade: true,
            estado: true,
            principal: true,
          },
        },
      },
    })

    if (!usuario) return erro('Usuário não encontrado', 404)

    return ok(usuario)
  } catch (e) {
    console.error('[me] erro:', e)
    return erro('Erro interno', 500)
  }
}

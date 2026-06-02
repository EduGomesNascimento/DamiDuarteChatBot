import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, erro } from '@/lib/api'
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  setAuthCookies,
  TOKEN_TTL,
} from '@/lib/auth'
import { redis } from '@/lib/redis'
import { ipDaRequest } from '@/lib/rate-limit'
import { cadastroSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = cadastroSchema.safeParse(body)
    if (!parsed.success) {
      return erro(parsed.error.errors[0].message, 400)
    }

    const data = parsed.data
    const { email, nomeCompleto, cpf, telefone, dataNasc, endereco, dadosFiscais } = data

    // Verificar marcador redis de e-mail verificado
    const verificado = await redis.get(`otp:verified:${email}`)
    if (!verificado) {
      return erro('Verifique seu e-mail primeiro', 403)
    }

    // Verificar unicidade de email e CPF
    const existeEmail = await prisma.usuario.findUnique({ where: { email } })
    if (existeEmail) {
      return erro('E-mail já cadastrado', 409)
    }

    const existeCpf = await prisma.usuario.findUnique({ where: { cpf } })
    if (existeCpf) {
      return erro('CPF já cadastrado', 409)
    }

    const ip = ipDaRequest(req)
    const ua = req.headers.get('user-agent') ?? undefined

    // Criar usuário com endereco e dadosFiscais
    const novoUsuario = await prisma.usuario.create({
      data: {
        email,
        nomeCompleto,
        cpf,
        telefone,
        dataNasc: new Date(dataNasc),
        emailVerificado: true,
        enderecos: {
          create: {
            apelido: endereco.apelido,
            cep: endereco.cep,
            logradouro: endereco.logradouro,
            numero: endereco.numero,
            complemento: endereco.complemento ?? '',
            bairro: endereco.bairro,
            cidade: endereco.cidade,
            estado: endereco.estado,
            principal: true,
          },
        },
        dadosFiscais: {
          create: dadosFiscais?.tipo === 'PJ'
            ? {
                tipo: 'PJ',
                cpf,
                cnpj: dadosFiscais.cnpj ?? null,
                razaoSocial: dadosFiscais.razaoSocial ?? null,
                ie: dadosFiscais.ie ?? null,
              }
            : {
                tipo: 'PF',
                cpf,
              },
        },
      },
    })

    // Emitir tokens
    const payload = { sub: novoUsuario.id, email: novoUsuario.email, role: novoUsuario.role }
    const access = await signAccessToken(payload)
    const refresh = await signRefreshToken(payload)

    await prisma.sessao.create({
      data: {
        usuarioId: novoUsuario.id,
        refreshToken: hashToken(refresh),
        expiraEm: new Date(Date.now() + TOKEN_TTL.REFRESH_TTL * 1000),
        userAgent: ua,
        ip,
      },
    })

    await setAuthCookies(access, refresh)

    // Remover marcador redis
    await redis.del(`otp:verified:${email}`)

    return ok({ autenticado: true, role: 'CLIENTE' })
  } catch (e: unknown) {
    console.error('[cadastro] erro:', e)
    // Prisma unique constraint
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002') {
      return erro('E-mail ou CPF já cadastrado', 409)
    }
    return erro('Erro interno ao criar conta', 500)
  }
}

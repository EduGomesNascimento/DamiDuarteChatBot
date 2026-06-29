import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { trocarCodigoPorPerfil } from '@/lib/google'
import { roleForEmail } from '@/lib/admin'
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  setAuthCookies,
  TOKEN_TTL,
} from '@/lib/auth'

function falhar(req: NextRequest, motivo: string) {
  return NextResponse.redirect(new URL(`/auth?erro=${motivo}`, req.url))
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const stateCookie = cookies().get('g_state')?.value

  if (!code || !state || !stateCookie || state !== stateCookie) {
    return falhar(req, 'google_state')
  }
  cookies().delete('g_state')

  const perfil = await trocarCodigoPorPerfil(code).catch(() => null)
  if (!perfil || !perfil.email) return falhar(req, 'google_falhou')

  const email = perfil.email.toLowerCase()
  const role = roleForEmail(email)

  // Encontra ou cria o usuário. Google não fornece CPF/telefone — usamos
  // placeholders únicos; o cliente completa os dados fiscais no checkout.
  let usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario) {
    usuario = await prisma.usuario.create({
      data: {
        email,
        nomeCompleto: perfil.name || email.split('@')[0],
        cpf: `g:${perfil.sub}`,
        telefone: '',
        dataNasc: new Date('1970-01-01'),
        emailVerificado: true,
        role,
      },
    })
  } else {
    usuario = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { emailVerificado: true, role },
    })
  }

  const payload = { sub: usuario.id, email: usuario.email, role }
  const access = await signAccessToken(payload)
  const refresh = await signRefreshToken(payload)

  await prisma.sessao.create({
    data: {
      usuarioId: usuario.id,
      refreshToken: hashToken(refresh),
      expiraEm: new Date(Date.now() + TOKEN_TTL.REFRESH_TTL * 1000),
      userAgent: req.headers.get('user-agent') ?? undefined,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    },
  })

  await setAuthCookies(access, refresh)

  // Admin vai pro painel; cliente, pra conta.
  const destino = role === 'ADMIN' ? '/admin' : '/minha-conta'
  return NextResponse.redirect(new URL(destino, req.url))
}

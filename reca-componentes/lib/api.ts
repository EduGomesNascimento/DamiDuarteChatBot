import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAccessToken, type AuthPayload, COOKIE_NAMES } from './auth'

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init)
}

export function erro(mensagem: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ erro: mensagem, ...extra }, { status })
}

/** Lê usuário autenticado em uma rota de API. */
export async function usuarioDaRequest(): Promise<AuthPayload | null> {
  const token = cookies().get(COOKIE_NAMES.ACCESS_COOKIE)?.value
  if (!token) return null
  return verifyAccessToken(token)
}

/** Exige autenticação; lança Response 401 se ausente. */
export async function exigirAuth(): Promise<AuthPayload> {
  const user = await usuarioDaRequest()
  if (!user) throw erro('Não autenticado', 401)
  return user
}

export async function exigirAdmin(): Promise<AuthPayload> {
  const user = await exigirAuth()
  if (user.role !== 'ADMIN') throw erro('Acesso restrito a administradores', 403)
  return user
}

/** Helper para rotas: captura Response lançada por exigirAuth/exigirAdmin. */
export async function comAuth(
  handler: (user: AuthPayload) => Promise<Response>,
  opts?: { admin?: boolean }
): Promise<Response> {
  try {
    const user = opts?.admin ? await exigirAdmin() : await exigirAuth()
    return await handler(user)
  } catch (e) {
    if (e instanceof Response) return e
    console.error(e)
    return erro('Erro interno', 500)
  }
}

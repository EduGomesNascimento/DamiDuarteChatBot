import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { ok, erro } from '@/lib/api'
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
  COOKIE_NAMES,
  TOKEN_TTL,
} from '@/lib/auth'
import { ipDaRequest } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const store = cookies()
    const refreshToken = store.get(COOKIE_NAMES.REFRESH_COOKIE)?.value

    if (!refreshToken) {
      clearAuthCookies()
      return erro('Sessão expirada', 401)
    }

    // Verificar JWT
    const payload = await verifyRefreshToken(refreshToken)
    if (!payload) {
      clearAuthCookies()
      return erro('Token inválido', 401)
    }

    // Verificar sessão no banco
    const tokenHash = hashToken(refreshToken)
    const sessao = await prisma.sessao.findUnique({
      where: { refreshToken: tokenHash },
    })

    if (!sessao || sessao.expiraEm < new Date()) {
      clearAuthCookies()
      return erro('Sessão expirada', 401)
    }

    // Rotacionar tokens
    const newAccess = await signAccessToken(payload)
    const newRefresh = await signRefreshToken(payload)
    const ip = ipDaRequest(req)

    await prisma.sessao.update({
      where: { id: sessao.id },
      data: {
        refreshToken: hashToken(newRefresh),
        expiraEm: new Date(Date.now() + TOKEN_TTL.REFRESH_TTL * 1000),
        ip,
      },
    })

    await setAuthCookies(newAccess, newRefresh)

    return ok({ ok: true })
  } catch (e) {
    console.error('[refresh] erro:', e)
    clearAuthCookies()
    return erro('Erro ao renovar sessão', 401)
  }
}

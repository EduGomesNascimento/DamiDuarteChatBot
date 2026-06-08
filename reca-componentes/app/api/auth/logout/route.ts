import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { ok } from '@/lib/api'
import { hashToken, clearAuthCookies, COOKIE_NAMES } from '@/lib/auth'

export async function POST() {
  try {
    const store = cookies()
    const refreshToken = store.get(COOKIE_NAMES.REFRESH_COOKIE)?.value

    if (refreshToken) {
      const tokenHash = hashToken(refreshToken)
      await prisma.sessao.deleteMany({
        where: { refreshToken: tokenHash },
      })
    }
  } catch {
    // Ignorar erros ao deletar sessão — o cookie será limpo de qualquer forma
  } finally {
    clearAuthCookies()
  }

  return ok({ ok: true })
}

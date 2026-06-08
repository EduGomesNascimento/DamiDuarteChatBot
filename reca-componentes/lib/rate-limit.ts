import { redis } from './redis'

/**
 * Rate limiting baseado em Redis (com fallback em memória).
 * Retorna { ok, restante, resetEm }.
 */
export async function rateLimit(
  key: string,
  limite: number,
  janelaSegundos: number
): Promise<{ ok: boolean; restante: number; resetEm: number }> {
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, janelaSegundos)
  }
  const ttl = await redis.ttl(key)
  return {
    ok: count <= limite,
    restante: Math.max(0, limite - count),
    resetEm: ttl > 0 ? ttl : janelaSegundos,
  }
}

export function ipDaRequest(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') || '0.0.0.0'
}

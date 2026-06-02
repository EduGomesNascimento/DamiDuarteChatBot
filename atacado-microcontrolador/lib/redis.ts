import Redis from 'ioredis'

/**
 * Cliente Redis com fallback em memória.
 *
 * Em produção, defina REDIS_URL. Em desenvolvimento (ou quando o Redis não
 * está disponível), usamos um Map em memória para que rate-limiting e
 * armazenamento temporário de OTP continuem funcionando sem quebrar o app.
 */

interface KVStore {
  get(key: string): Promise<string | null>
  set(key: string, value: string, mode?: 'EX', ttlSeconds?: number): Promise<unknown>
  incr(key: string): Promise<number>
  expire(key: string, ttlSeconds: number): Promise<unknown>
  del(key: string): Promise<unknown>
  ttl(key: string): Promise<number>
}

class MemoryStore implements KVStore {
  private store = new Map<string, { value: string; expiresAt?: number }>()

  private isExpired(entry: { expiresAt?: number }) {
    return entry.expiresAt !== undefined && Date.now() > entry.expiresAt
  }

  async get(key: string) {
    const entry = this.store.get(key)
    if (!entry) return null
    if (this.isExpired(entry)) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  async set(key: string, value: string, mode?: 'EX', ttlSeconds?: number) {
    const expiresAt =
      mode === 'EX' && ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined
    this.store.set(key, { value, expiresAt })
    return 'OK'
  }

  async incr(key: string) {
    const current = await this.get(key)
    const next = (current ? parseInt(current, 10) : 0) + 1
    const entry = this.store.get(key)
    this.store.set(key, { value: String(next), expiresAt: entry?.expiresAt })
    return next
  }

  async expire(key: string, ttlSeconds: number) {
    const entry = this.store.get(key)
    if (entry) entry.expiresAt = Date.now() + ttlSeconds * 1000
    return 1
  }

  async del(key: string) {
    this.store.delete(key)
    return 1
  }

  async ttl(key: string) {
    const entry = this.store.get(key)
    if (!entry || entry.expiresAt === undefined) return -1
    return Math.max(0, Math.round((entry.expiresAt - Date.now()) / 1000))
  }
}

const globalForRedis = globalThis as unknown as {
  redis: KVStore | undefined
}

function createClient(): KVStore {
  if (process.env.REDIS_URL) {
    try {
      return new Redis(process.env.REDIS_URL) as unknown as KVStore
    } catch {
      console.warn('[redis] falha ao conectar, usando store em memória')
    }
  }
  return new MemoryStore()
}

export const redis: KVStore = globalForRedis.redis ?? createClient()
if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

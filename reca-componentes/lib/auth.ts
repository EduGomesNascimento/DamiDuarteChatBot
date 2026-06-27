import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { randomBytes, createHash } from 'crypto'

const ACCESS_TTL = 60 * 15 // 15 min
const REFRESH_TTL = 60 * 60 * 24 * 7 // 7 dias

const encoder = new TextEncoder()

function accessSecret() {
  return encoder.encode(process.env.JWT_SECRET || 'dev-secret-min-32-chars-change-me!!')
}
function refreshSecret() {
  return encoder.encode(
    process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-min-32-chars-change!!'
  )
}

export interface AuthPayload {
  sub: string // usuarioId
  email: string
  role: 'CLIENTE' | 'ADMIN'
}

export async function signAccessToken(payload: AuthPayload) {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL}s`)
    .sign(accessSecret())
}

export async function signRefreshToken(payload: AuthPayload) {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL}s`)
    .sign(refreshSecret())
}

export async function verifyAccessToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, accessSecret())
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as AuthPayload['role'],
    }
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret())
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as AuthPayload['role'],
    }
  } catch {
    return null
  }
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function randomToken() {
  return randomBytes(32).toString('hex')
}

const ACCESS_COOKIE = 'reca_access'
const REFRESH_COOKIE = 'reca_refresh'

export async function setAuthCookies(access: string, refresh: string) {
  const store = cookies()
  const secure = process.env.NODE_ENV === 'production'
  store.set(ACCESS_COOKIE, access, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TTL,
  })
  store.set(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TTL,
  })
}

export function clearAuthCookies() {
  const store = cookies()
  store.delete(ACCESS_COOKIE)
  store.delete(REFRESH_COOKIE)
}

/** Lê o usuário autenticado a partir do cookie de acesso (server-side). */
export async function getCurrentUser(): Promise<AuthPayload | null> {
  const token = cookies().get(ACCESS_COOKIE)?.value
  if (!token) return null
  return verifyAccessToken(token)
}

export const COOKIE_NAMES = { ACCESS_COOKIE, REFRESH_COOKIE }
export const TOKEN_TTL = { ACCESS_TTL, REFRESH_TTL }

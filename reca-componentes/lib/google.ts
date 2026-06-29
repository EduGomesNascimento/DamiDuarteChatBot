/**
 * Login com Google (OAuth 2.0) — fluxo "authorization code".
 *
 * Configure no Google Cloud Console (APIs & Services → Credentials → OAuth client):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 * Authorized redirect URI: {NEXT_PUBLIC_APP_URL}/api/auth/google/callback
 * E exponha NEXT_PUBLIC_GOOGLE_ENABLED=true para mostrar o botão no front.
 */
export const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
)

function redirectUri(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/api/auth/google/callback`
}

export function googleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export interface GooglePerfil {
  email: string
  name: string
  sub: string
  emailVerified: boolean
}

export async function trocarCodigoPorPerfil(code: string): Promise<GooglePerfil | null> {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirect_uri: redirectUri(),
      grant_type: 'authorization_code',
    }),
  })
  if (!tokenRes.ok) return null
  const tok = (await tokenRes.json()) as { access_token?: string }
  if (!tok.access_token) return null

  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tok.access_token}` },
  })
  if (!userRes.ok) return null
  const u = (await userRes.json()) as {
    email?: string
    name?: string
    sub?: string
    email_verified?: boolean
  }
  if (!u.email || !u.sub) return null
  return {
    email: u.email,
    name: u.name || u.email,
    sub: u.sub,
    emailVerified: Boolean(u.email_verified),
  }
}

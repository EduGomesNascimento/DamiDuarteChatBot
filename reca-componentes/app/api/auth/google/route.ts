import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { googleConfigured, googleAuthUrl } from '@/lib/google'
import { randomToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!googleConfigured) {
    return NextResponse.redirect(new URL('/auth?erro=google_indisponivel', req.url))
  }
  const state = randomToken().slice(0, 24)
  cookies().set('g_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })
  return NextResponse.redirect(googleAuthUrl(state))
}

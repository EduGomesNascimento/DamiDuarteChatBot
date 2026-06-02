import { NextRequest, NextResponse } from 'next/server'

const ACCESS_COOKIE = 'aen_access'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected =
    pathname.startsWith('/minha-conta') || pathname.startsWith('/admin')

  if (!isProtected) return NextResponse.next()

  const token = req.cookies.get(ACCESS_COOKIE)?.value

  if (!token) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/auth'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/minha-conta/:path*', '/admin/:path*'],
}

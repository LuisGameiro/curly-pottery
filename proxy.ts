import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import type { NextAuthRequest } from 'next-auth'

export const proxy = auth((req: NextAuthRequest) => {
  const pathname = req.nextUrl.pathname
  const isAdminPage = pathname.startsWith('/admin')
  const token = req.auth?.user

  // Admin routes: must have ADMIN role
  if (isAdminPage && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // User routes require a valid session
  if (pathname.startsWith('/user') && !token) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
}

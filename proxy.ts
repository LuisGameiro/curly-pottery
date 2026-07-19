import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname
    const isAdminPage = pathname.startsWith('/admin')

    // Admin routes: must have ADMIN role
    if (isAdminPage && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Admin routes require a valid session
        if (pathname.startsWith('/admin')) return !!token

        // User routes require a valid session
        if (pathname.startsWith('/user')) return !!token

        // All other routes are public
        return true
      },
    },
  },
)

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
}

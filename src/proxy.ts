import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isAuthRoute = nextUrl.pathname.startsWith('/login') ||
    nextUrl.pathname.startsWith('/register')
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard') ||
    nextUrl.pathname.startsWith('/practice') ||
    nextUrl.pathname.startsWith('/sessions') ||
    nextUrl.pathname.startsWith('/profile')
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && (isDashboardRoute || isAdminRoute)) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl))
  }

  // Protect admin routes — role check
  if (isAdminRoute && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/practice/:path*',
    '/sessions/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
}

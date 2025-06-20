import { authMiddleware } from '@civic/auth/nextjs/middleware'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export default function middleware(req: NextRequest) {
  const isAuthenticated = authMiddleware()(req)
  const { pathname } = req.nextUrl

  // If user is not authenticated and tries to access protected routes
  if (!isAuthenticated && (pathname.startsWith('/dashboard') || pathname.startsWith('/leaderboard'))) {
    const url = req.nextUrl.clone()
    url.pathname = '/authentication'
    return NextResponse.redirect(url)
  }

  return authMiddleware()(req)
}

export const config = {
  // include the paths you wish to secure here
  matcher: [
    /*
     * Match all request paths except:
     * - _next directory (Next.js static files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - image files
     * - home page
     * - about-us
     * - features
     * - profile
     * - dashboard
     * - leaderboard
     */
    '/((?!_next|favicon.ico|sitemap.xml|robots.txt|.*\.jpg|.*\.png|.*\.svg|.*\.gif|$|about-us|features|profile|dashboard|leaderboard).*)',
  ],
}

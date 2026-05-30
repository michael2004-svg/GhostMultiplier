import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot', '/reset-password']
const PROTECTED_ROUTES = ['/game', '/profile', '/wallet', '/history', '/leaderboard']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Build a mutable response we will return
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write cookies onto both the request and the response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Re-create response from the updated request so cookies flow through
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: use getUser(), not getSession()
  // getSession() can return stale data; getUser() hits the Supabase server
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Root redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL(user ? '/game' : '/login', request.url))
  }

  // Unauthenticated user trying to access a protected route
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  if (!user && isProtected) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user trying to access an auth page → send to game
  const isPublicAuthPage = PUBLIC_ROUTES.includes(pathname)
  if (user && isPublicAuthPage) {
    return NextResponse.redirect(new URL('/game', request.url))
  }

  // Always return the response so cookies are forwarded
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

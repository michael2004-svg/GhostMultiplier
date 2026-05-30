import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot', '/reset-password']
const PROTECTED_ROUTES = ['/game', '/profile', '/wallet', '/history', '/leaderboard']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Root — redirect based on auth state
  if (pathname === '/') {
    return NextResponse.redirect(new URL(user ? '/game' : '/login', request.url))
  }

  // Not logged in + trying to access protected route → go to login
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  if (!user && isProtected) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Logged in + on an auth page (login/register/etc) → go to game
  // Use startsWith so /login?redirectTo=... still matches
  const isPublicAuthPage = PUBLIC_ROUTES.some((r) => pathname.startsWith(r))
  if (user && isPublicAuthPage) {
    return NextResponse.redirect(new URL('/game', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT Next.js internals, static files, and api routes.
     * This prevents the middleware running on _next/data fetches which can
     * cause false redirect loops.
     */
    '/((?!_next/static|_next/image|_next/data|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
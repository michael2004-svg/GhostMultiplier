import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot', '/reset-password']
const PROTECTED_ROUTES = ['/game', '/profile', '/wallet', '/history', '/leaderboard']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Root redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL(user ? '/game' : '/login', request.url))
  }

  // Protect routes — only redirect if on a protected path
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from auth pages
  const isPublic = PUBLIC_ROUTES.includes(pathname)
  if (user && isPublic) {
    return NextResponse.redirect(new URL('/game', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, static assets
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}


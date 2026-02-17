// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  const secretKey = process.env.SESSION_SECRET || 'default-secret-change-me'
  const key = new TextEncoder().encode(secretKey)

  let role: string | null = null;
  if (session) {
    try {
      const { payload } = await jwtVerify(session, key, {
        algorithms: ['HS256'],
      })
      role = payload.role as string
    } catch {
       // Invalid session
    }
  }

  const pathname = request.nextUrl.pathname

  // 1. Protect Admin Pages (if accessed directly)
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 2. Protect Write API Routes (excluding the unlock & logout routes)
  if (pathname.startsWith('/api/') && pathname !== '/api/admin/unlock' && pathname !== '/api/admin/logout') {
    const method = request.method
    // If it's a mutation request, require admin
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      if (role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 })
      }
    }
  }

  return NextResponse.next()
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

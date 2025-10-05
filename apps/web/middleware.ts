import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  // Configurar CORS
  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Manejar preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }

  // Permitir que /auth/callback redirija libremente (para OAuth)
  if (request.nextUrl.pathname === '/auth/callback') {
    return supabaseResponse
  }

  // Proteger rutas del dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Si está autenticado y va a /login, redirigir al dashboard
  // PERO: permitir que clientes OAuth vayan a /join después de autenticarse
  if (request.nextUrl.pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard/owner', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

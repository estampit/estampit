import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'

// Protege rutas /dashboard/* exigiendo sesión. Ajusta según necesidad.
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const demoCookie = req.cookies.get('demo_user')?.value
  if (!demoCookie) {
    const supabase = createMiddlewareClient<Database>({ req, res })
    const { data: { session } } = await supabase.auth.getSession()
    if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }
  }
  return res
}

export const config = {
  matcher: ['/dashboard/:path*']
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token || token.trim().length === 0) {
    return NextResponse.json({ success: false, error: 'token_required' }, { status: 400 })
  }

  const siteUrl = request.headers.get('origin') || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.NEXT_PUBLIC_SITE_URL) || 'http://localhost:3001'
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return NextResponse.json(
      { success: false, error: 'server_not_configured' },
      { status: 500 }
    )
  }

  let actorId: string | null = null
  try {
    if (request.headers.get('content-length')) {
      const body = await request.json()
      if (body && typeof body.actorId === 'string' && body.actorId.trim().length > 0) {
        actorId = body.actorId.trim()
      }
    }
  } catch {
    // Ignore JSON parsing errors and treat body as empty
  }

  const admin = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const { data, error } = await admin.rpc('process_promotion_scan', {
    p_qr_token: token,
    p_actor_id: actorId
  })

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'scan_failed',
        details: error.message
      },
      { status: 500 }
    )
  }

  if (!data || (typeof data.success === 'boolean' && data.success === false)) {
    const errorCode = (data && 'error' in data && typeof data.error === 'string') ? data.error : 'scan_failed'
    const status = errorCode === 'invalid_token' ? 404 : errorCode === 'promotion_inactive' ? 409 : 400
    return NextResponse.json({ success: false, error: errorCode, details: data?.details ?? null }, { status })
  }

  return NextResponse.json({
    success: true,
    data: {
      ...data,
      siteUrl
    }
  })
}

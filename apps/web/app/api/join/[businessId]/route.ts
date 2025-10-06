import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type ProfilesRow = {
  id: string
  email: string | null
  phone: string | null
  name: string | null
}

type PendingReward = {
  id: string
  reward_description: string | null
  reward_type: string
  is_redeemed: boolean | null
  is_claimed: boolean | null
  created_at: string
  redeemed_at: string | null
}

type PromotionRow = {
  id: string
  business_id: string
  name: string
  description: string | null
  promo_type: string
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  reward_description: string | null
  config: Record<string, any> | null
}

function sanitizeEmail(value?: string | null) {
  return value?.trim().toLowerCase() || null
}

function sanitizePhone(value?: string | null) {
  return value?.trim() || null
}

function composeName(first?: string | null, last?: string | null, fallback?: string | null) {
  const combined = `${first?.trim() ?? ''} ${last?.trim() ?? ''}`.trim()
  if (combined.length > 0) return combined
  if (first?.trim()) return first.trim()
  if (last?.trim()) return last.trim()
  return fallback ?? null
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return NextResponse.json(
      { success: false, error: 'server_not_configured' },
      { status: 500 }
    )
  }

  const admin = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const originHeader = request.headers.get('origin')
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const hostHeader = request.headers.get('host')
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null

  const pickSiteUrl = () => {
    const candidates = [
      originHeader,
      configuredSiteUrl,
      hostHeader ? `${forwardedProto ?? 'https'}://${hostHeader}` : null,
      vercelUrl,
      'http://localhost:3001'
    ]

    for (const candidate of candidates) {
      if (candidate && candidate.trim().length > 0) {
        return candidate.replace(/\/$/, '')
      }
    }

    return 'http://localhost:3001'
  }

  const siteUrl = pickSiteUrl()

  let payload: any
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'invalid_json' }, { status: 400 })
  }

  const email = sanitizeEmail(payload?.email)
  const phone = sanitizePhone(payload?.phone)
  const firstName: string | null = payload?.firstName?.trim() || null
  const lastName: string | null = payload?.lastName?.trim() || null
  const promotionId: string | null = payload?.promotionId?.trim() || null

  if (!email && !phone) {
    return NextResponse.json({ success: false, error: 'identifier_required' }, { status: 400 })
  }

  if (!promotionId) {
    return NextResponse.json({ success: false, error: 'promotion_required' }, { status: 400 })
  }

  const { data: business, error: businessError } = await admin
    .from('businesses')
    .select('id,name,description,logo_url,settings')
    .eq('id', businessId)
    .maybeSingle()

  if (businessError || !business) {
    return NextResponse.json({ success: false, error: 'business_not_found' }, { status: 404 })
  }

  const businessUuid = business.id

  const { data: promotion, error: promotionError } = await admin
    .from('promotions')
    .select('id,business_id,name,description,promo_type,starts_at,ends_at,is_active,reward_description,config')
    .eq('id', promotionId)
    .eq('business_id', businessUuid)
    .maybeSingle<PromotionRow>()

  if (promotionError || !promotion) {
    return NextResponse.json({ success: false, error: 'promotion_not_found' }, { status: 404 })
  }

  const now = new Date()
  const startsAt = promotion.starts_at ? new Date(promotion.starts_at) : null
  const endsAt = promotion.ends_at ? new Date(promotion.ends_at) : null
  if (promotion.is_active !== true || (startsAt && startsAt > now) || (endsAt && endsAt < now)) {
    return NextResponse.json({ success: false, error: 'promotion_inactive' }, { status: 400 })
  }

  const { data: loyaltyCard, error: cardError } = await admin
    .from('loyalty_cards')
    .select('id,name,description,stamps_required,reward_description')
  .eq('business_id', businessUuid)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (cardError || !loyaltyCard) {
    return NextResponse.json({ success: false, error: 'no_loyalty_card' }, { status: 400 })
  }

  let existingProfile: ProfilesRow | null = null
  if (email || phone) {
    const filters: string[] = []
    if (email) filters.push(`email.eq.${email}`)
    if (phone) filters.push(`phone.eq.${phone}`)
    if (filters.length > 0) {
      const { data: profileData, error: profileErr } = await admin
        .from('profiles')
        .select('id,email,phone,name')
        .or(filters.join(','))
        .limit(1)
        .maybeSingle()
      if (!profileErr && profileData) {
        existingProfile = profileData as ProfilesRow
      }
    }
  }

  let userId = existingProfile?.id || null
  let existingUser = Boolean(userId)
  let resolvedEmail = existingProfile?.email ?? email
  let resolvedPhone = existingProfile?.phone ?? phone
  let resolvedName = existingProfile?.name ?? composeName(firstName, lastName, email || phone)

  if (!userId) {
    const createPayload: Record<string, any> = {
      user_metadata: {}
    }
    if (email) {
      createPayload.email = email
      createPayload.email_confirm = true
    }
    if (phone) {
      createPayload.phone = phone
      createPayload.phone_confirm = true
    }
    const metaName = composeName(firstName, lastName, null)
    if (metaName) {
      createPayload.user_metadata.full_name = metaName
    }
    if (firstName) createPayload.user_metadata.first_name = firstName
    if (lastName) createPayload.user_metadata.last_name = lastName

    const { data: created, error: createError } = await admin.auth.admin.createUser(createPayload)
    if (createError || !created?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'create_user_failed',
          details: createError?.message
        },
        { status: 500 }
      )
    }

    userId = created.user.id
    resolvedEmail = created.user.email ?? resolvedEmail
    resolvedPhone = created.user.phone ?? resolvedPhone
    resolvedName = composeName(
      created.user.user_metadata?.first_name,
      created.user.user_metadata?.last_name,
      created.user.user_metadata?.full_name || resolvedName || email || phone || 'Cliente'
    )
    existingUser = false
  } else {
    // If user exists but we received new contact data, prefer the non-null values provided
    if (email && !resolvedEmail) resolvedEmail = email
    if (phone && !resolvedPhone) resolvedPhone = phone
    const providedName = composeName(firstName, lastName, resolvedName || email || phone)
    if (providedName) resolvedName = providedName
  }

  if (!userId) {
    return NextResponse.json({ success: false, error: 'user_resolution_failed' }, { status: 500 })
  }

  const profileUpsert = {
    id: userId,
    email: resolvedEmail,
    phone: resolvedPhone,
    name: resolvedName || null,
    user_type: 'customer'
  }

  const { error: profileUpsertError } = await admin
    .from('profiles')
    .upsert(profileUpsert, { onConflict: 'id' })
  if (profileUpsertError) {
    return NextResponse.json({ success: false, error: 'profile_upsert_failed' }, { status: 500 })
  }

  const { data: ensureResult, error: ensureError } = await admin.rpc(
    'ensure_customer_card_and_pass_for_promotion',
    {
      p_business_id: businessUuid,
      p_customer_id: userId,
      p_promotion_id: promotion.id
    }
  )

  if (ensureError) {
    return NextResponse.json({ success: false, error: 'ensure_failed', details: ensureError.message }, { status: 500 })
  }

  if (!ensureResult?.success) {
    return NextResponse.json(
      { success: false, error: ensureResult?.error || 'ensure_failed' },
      { status: 500 }
    )
  }

  const customerCard = ensureResult.customer_card
  if (!customerCard?.id) {
    return NextResponse.json({ success: false, error: 'card_not_created' }, { status: 500 })
  }

  const { data: cardDetail, error: cardDetailError } = await admin
    .from('customer_cards')
    .select(`
      id,
      current_stamps,
      total_rewards_earned,
      last_stamp_at,
      loyalty_cards (
        id,
        name,
        description,
        stamps_required,
        reward_description,
        businesses (
          id,
          name,
          logo_url,
          settings
        )
      )
    `)
    .eq('id', customerCard.id)
    .single()

  if (cardDetailError || !cardDetail) {
    return NextResponse.json(
      {
        success: false,
        error: 'card_lookup_failed',
        details: cardDetailError?.message || null
      },
      { status: 500 }
    )
  }

  const { data: rewardsData } = await admin
    .from('rewards')
    .select('id,reward_description,reward_type,is_redeemed,is_claimed,created_at,redeemed_at')
    .eq('customer_card_id', customerCard.id)
    .order('created_at', { ascending: false })

  const pendingRewards: PendingReward[] = (rewardsData || []).filter((reward: PendingReward) => reward.is_redeemed !== true)

  const loyaltyCardDetailRaw = (cardDetail as any).loyalty_cards
  const loyaltyCardDetail = Array.isArray(loyaltyCardDetailRaw)
    ? loyaltyCardDetailRaw[0]
    : loyaltyCardDetailRaw

  const walletPassEnvelope = ensureResult.wallet_pass || {}
  const walletPassRow = walletPassEnvelope.wallet_pass || {}
  const qrToken: string | null = walletPassEnvelope.qr_token || walletPassRow.qr_token || null
  const downloadUrl = qrToken ? `${siteUrl}/api/wallet/download?token=${encodeURIComponent(qrToken)}` : null

  const stampsRequired = loyaltyCardDetail?.stamps_required ?? 0
  const currentStamps = cardDetail.current_stamps ?? 0
  const remainingStamps = stampsRequired > 0 ? Math.max(stampsRequired - currentStamps, 0) : 0

  const { data: usageRow } = await admin
    .from('promotion_usages')
    .select('usage_count,last_used_at')
    .eq('promotion_id', promotion.id)
    .eq('customer_id', userId)
    .maybeSingle()

  const promotionUsageCount = usageRow?.usage_count ?? 0

  const businessSettings = (business?.settings ?? {}) as Record<string, any>
  const businessResponse = {
    id: business.id,
    name: business.name,
    logo_url: business.logo_url,
    primary_color: businessSettings.primary_color ?? null,
    secondary_color: businessSettings.secondary_color ?? null,
    background_color: businessSettings.background_color ?? null,
    text_color: businessSettings.text_color ?? null
  }

  let loyaltyCardBusiness = loyaltyCardDetail?.businesses
  if (loyaltyCardBusiness) {
    const nestedSettings = (loyaltyCardBusiness.settings ?? {}) as Record<string, any>
    loyaltyCardBusiness = {
      id: loyaltyCardBusiness.id,
      name: loyaltyCardBusiness.name,
      logo_url: loyaltyCardBusiness.logo_url,
      primary_color: nestedSettings.primary_color ?? null,
      secondary_color: nestedSettings.secondary_color ?? null,
      background_color: nestedSettings.background_color ?? null,
      text_color: nestedSettings.text_color ?? null
    }
  }

  if (loyaltyCardDetail) {
    loyaltyCardDetail.businesses = loyaltyCardBusiness
  }

  return NextResponse.json({
    success: true,
    data: {
      userId,
      existingUser,
      profile: {
        name: resolvedName,
        email: resolvedEmail,
        phone: resolvedPhone
      },
      promotion: {
        id: promotion.id,
        name: promotion.name,
        description: promotion.description,
        reward_description: promotion.reward_description,
        ends_at: promotion.ends_at
      },
      business: businessResponse,
      loyaltyCard,
      promotionId,
      customerCard: {
        id: cardDetail.id,
        current_stamps: currentStamps,
        total_rewards_earned: cardDetail.total_rewards_earned ?? 0,
        last_stamp_at: cardDetail.last_stamp_at,
        loyalty_card: loyaltyCardDetail
      },
      walletPass: {
        id: walletPassRow.id ?? null,
        qr_token: qrToken,
        reused: Boolean(walletPassEnvelope.reused),
        pass_type: walletPassRow.pass_type ?? 'generic',
        usage_count: walletPassRow.usage_count ?? 0,
        last_used_at: walletPassRow.last_used_at ?? null,
        promotion_id: walletPassRow.promotion_id ?? promotion.id
      },
      downloadUrl,
      metrics: {
        currentStamps,
        stampsRequired,
        remainingStamps,
        totalRewardsEarned: cardDetail.total_rewards_earned ?? 0,
        pendingRewards: pendingRewards.length,
        promotionUsageCount
      },
      pendingRewards
    }
  })
}

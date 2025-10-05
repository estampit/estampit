import { createClient } from '@supabase/supabase-js'

export type PromotionPublicRecord = {
  id: string
  name: string
  description: string | null
  promo_type: string
  ends_at: string | null
  reward_description: string | null
  config: Record<string, any> | null
}

export type BusinessPublicRecord = {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  settings: Record<string, any> | null
}

export type LoyaltyCardPublicRecord = {
  id: string
  name: string | null
  description: string | null
  stamps_required: number | null
  reward_description: string | null
}

export type JoinPageData = {
  business: BusinessPublicRecord
  loyaltyCard: LoyaltyCardPublicRecord | null
  promotions: PromotionPublicRecord[]
  focusedPromotion: PromotionPublicRecord | null
}

export type BrandingConfig = {
  primary?: string
  onPrimary?: string
  accent?: string
  accentMuted?: string
  background?: string
  surface?: string
  surfaceMuted?: string
  border?: string
  text?: string
  textMuted?: string
  heroImage?: string | null
}

type BrandingSource = Record<string, any> | null | undefined

function pickBranding(source: BrandingSource): BrandingConfig {
  if (!source) return {}
  const root = typeof source.branding === 'object' && source.branding !== null ? source.branding : source
  return {
    primary: root.primary_color ?? root.primaryColor ?? root.primary,
    onPrimary: root.on_primary_color ?? root.onPrimary ?? root.on_primary,
    accent: root.accent_color ?? root.accentColor ?? root.accent,
    accentMuted: root.accent_muted_color ?? root.accentMuted ?? root.accent_muted,
    background: root.background_color ?? root.backgroundColor ?? root.background,
    surface: root.surface_color ?? root.surfaceColor ?? root.surface,
    surfaceMuted: root.surface_muted_color ?? root.surfaceMuted ?? root.surface_muted,
    border: root.border_color ?? root.borderColor ?? root.border,
    text: root.text_color ?? root.textColor ?? root.text,
    textMuted: root.text_muted_color ?? root.textMuted ?? root.text_muted,
    heroImage: root.hero_image ?? root.heroImage ?? source.hero_image ?? source.heroImage ?? null
  }
}

export function composeBrandingTheme(
  businessSettings: Record<string, any> | null,
  promotionConfig?: Record<string, any> | null
): BrandingConfig {
  const businessBranding = pickBranding(businessSettings)
  const promotionBranding = pickBranding(promotionConfig)

  return {
    primary: promotionBranding.primary ?? businessBranding.primary,
    onPrimary: promotionBranding.onPrimary ?? businessBranding.onPrimary,
    accent: promotionBranding.accent ?? promotionBranding.primary ?? businessBranding.accent ?? businessBranding.primary,
    accentMuted: promotionBranding.accentMuted ?? businessBranding.accentMuted,
    background: promotionBranding.background ?? businessBranding.background,
    surface: promotionBranding.surface ?? businessBranding.surface,
    surfaceMuted: promotionBranding.surfaceMuted ?? businessBranding.surfaceMuted,
    border: promotionBranding.border ?? businessBranding.border,
    text: promotionBranding.text ?? businessBranding.text,
    textMuted: promotionBranding.textMuted ?? businessBranding.textMuted,
    heroImage: promotionBranding.heroImage ?? businessBranding.heroImage ?? null
  }
}

export async function loadJoinData(
  businessId: string,
  options: { focusPromotionId?: string } = {}
): Promise<JoinPageData> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase credentials are missing')
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const { data: business, error: businessErr } = await admin
    .from('businesses')
    .select('id,name,description,logo_url,settings')
    .eq('id', businessId)
    .maybeSingle()

  if (businessErr || !business) {
    throw new Error('business_not_found')
  }

  const { data: loyaltyCard } = await admin
    .from('loyalty_cards')
    .select('id,name,description,stamps_required,reward_description')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  let promotions: PromotionPublicRecord[] = []
  const { data: promotionsData } = await admin.rpc('get_public_active_promotions', {
    p_business_id: businessId
  })

  if (Array.isArray(promotionsData)) {
    promotions = (promotionsData as any[]).map((promo) => ({
      id: promo.id,
      name: promo.name,
      description: typeof promo.description === 'string' ? promo.description : null,
      promo_type: promo.promo_type,
      ends_at: promo.ends_at ?? null,
      reward_description: typeof promo.reward_description === 'string' ? promo.reward_description : null,
      config: promo.config ?? null
    }))
  }

  let focusedPromotion: PromotionPublicRecord | null = null
  if (options.focusPromotionId) {
    focusedPromotion = promotions.find((promo) => promo.id === options.focusPromotionId) ?? null
    if (!focusedPromotion) {
      const { data: singlePromotion } = await admin
        .from('promotions')
        .select('id,name,description,promo_type,ends_at,reward_description,config,business_id')
        .eq('id', options.focusPromotionId)
        .eq('business_id', businessId)
        .maybeSingle()

      if (singlePromotion) {
        focusedPromotion = {
          id: singlePromotion.id,
          name: singlePromotion.name,
          description: singlePromotion.description,
          promo_type: singlePromotion.promo_type,
          ends_at: singlePromotion.ends_at,
           reward_description: singlePromotion.reward_description ?? null,
          config: singlePromotion.config as Record<string, any> | null
        }
        promotions = [focusedPromotion, ...promotions.filter((promo) => promo.id !== focusedPromotion!.id)]
      } else {
        throw new Error('promotion_not_found')
      }
    }
  }

  return {
    business: business as BusinessPublicRecord,
    loyaltyCard: loyaltyCard as LoyaltyCardPublicRecord | null,
    promotions,
    focusedPromotion
  }
}

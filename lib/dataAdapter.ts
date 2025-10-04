import { getSupabaseClient } from './supabaseClient'

export interface CustomerSummary {
  customer_id: string
  customer_email: string
  current_stamps: number
  total_rewards: number
  last_stamp_at: string | null
  loyalty_card_id: string
  customer_card_id: string
}

export async function fetchCustomerDashboardData(businessId: string): Promise<CustomerSummary[]> {
  const supabase = getSupabaseClient()
  // We call the SQL function that returns JSONB array
  const { data, error } = await supabase.rpc('get_customer_dashboard_data', { p_business_id: businessId, p_limit: 100 })
  if (error) throw error
  return (data as any[]) as CustomerSummary[]
}

export async function addStampWithPromotions(customerCardId: string, businessId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('add_stamp_with_promotions', {
    p_customer_card_id: customerCardId,
    p_business_id: businessId,
    p_stamp_method: 'manual'
  })
  if (error) throw error
  return data
}

export interface LoyaltyCard {
  id: string
  business_id: string
  name: string
  description: string | null
  stamps_required: number
  reward_description: string
  card_color: string | null
}

export async function fetchFirstLoyaltyCard(businessId: string): Promise<LoyaltyCard | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('loyalty_cards')
    .select('id,business_id,name,description,stamps_required,reward_description,card_color')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as LoyaltyCard | null
}

export async function fetchBusinessAnalytics(businessId: string, days: number = 30) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_business_analytics', { p_business_id: businessId, p_days: days })
  if (error) throw error
  return data
}

export interface Promotion {
  id: string
  name: string
  description: string | null
  promo_type: string
  is_active: boolean
  starts_at: string
  ends_at: string | null
  loyalty_card_id: string | null
  priority: number
  config: any
}

export async function fetchPromotions(businessId: string): Promise<Promotion[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('business_id', businessId)
    .order('priority', { ascending: true })
  if (error) throw error
  return data as Promotion[]
}

export async function togglePromotionActive(id: string, newState: boolean) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('promotions')
    .update({ is_active: newState })
    .eq('id', id)
  if (error) throw error
}

export async function createPromotion(params: { businessId: string; loyaltyCardId?: string; name: string; type: string; config: any; priority?: number; startsAt?: string; endsAt?: string | null; description?: string }) {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('promotions')
    .insert({
      business_id: params.businessId,
      loyalty_card_id: params.loyaltyCardId || null,
      name: params.name,
      description: params.description || null,
      promo_type: params.type,
      config: params.config,
      priority: params.priority ?? 100,
      starts_at: params.startsAt || new Date().toISOString(),
      ends_at: params.endsAt || null,
      is_active: true
    })
  if (error) throw error
}

export interface PurchaseRecord {
  id: string
  business_id: string
  customer_id: string
  loyalty_card_id: string | null
  amount: number
  currency: string
  items: any[]
  stamps_awarded: number
  created_at: string
}

export async function fetchRecentPurchases(businessId: string, limit: number = 25): Promise<PurchaseRecord[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as PurchaseRecord[]
}

export async function addPurchaseWithStamp(params: { businessId: string; customerCardId: string; amount: number; currency?: string; items?: any[] }) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('add_purchase_with_stamp', {
    p_business_id: params.businessId,
    p_customer_card_id: params.customerCardId,
    p_amount: params.amount,
    p_currency: params.currency || 'EUR',
    p_items: (params.items || []),
    p_metadata: {}
  })
  if (error) throw error
  return data
}

// Wallet passes
export async function generateWalletPass(businessId: string, customerCardId: string, passType: string = 'generic') {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('generate_wallet_pass', {
    p_business_id: businessId,
    p_customer_card_id: customerCardId,
    p_pass_type: passType
  })
  if (error) throw error
  return data
}

export async function redeemWalletPassToken(businessId: string, token: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('redeem_wallet_pass_token', {
    p_business_id: businessId,
    p_qr_token: token
  })
  if (error) throw error
  return data
}

export async function revokeWalletPass(businessId: string, walletPassId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('revoke_wallet_pass', {
    p_business_id: businessId,
    p_wallet_pass_id: walletPassId
  })
  if (error) throw error
  return data
}

export async function regenerateWalletPass(businessId: string, customerCardId: string, passType: string = 'generic') {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('regenerate_wallet_pass', {
    p_business_id: businessId,
    p_customer_card_id: customerCardId,
    p_pass_type: passType
  })
  if (error) throw error
  return data
}

// Feature gating
export async function fetchBusinessFeatures(businessId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_business_features', { p_business_id: businessId })
  if (error) throw error
  return data
}

// Platform verification helper
export async function fetchPlatformObjects() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_platform_objects')
  if (error) throw error
  return data
}

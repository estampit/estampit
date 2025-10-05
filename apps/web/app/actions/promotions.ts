'use server'

import { getServerSupabase } from '@/lib/supabaseServer'
import { ensureBusinessAccess } from './authz'
import type { Database } from '@/types/database.types'
import { revalidatePath } from 'next/cache'

export async function createPromotion(input: {
  businessId: string
  loyaltyCardId?: string
  name: string
  promoType: string
  config?: Record<string, any>
  priority?: number
  endsAt?: string | null
  startsAt?: string | null
}) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'auth_required' }
  const authz = await ensureBusinessAccess(input.businessId)
  if (!authz.ok) return { success: false, error: authz.error }
  const { data, error } = await (supabase.from('promotions') as any).insert({
    business_id: input.businessId,
    loyalty_card_id: input.loyaltyCardId ?? null,
    name: input.name,
    promo_type: input.promoType,
    config: input.config ?? {},
    priority: input.priority ?? 100,
    starts_at: input.startsAt ?? new Date().toISOString(),
    ends_at: input.endsAt ?? null
  }).select('*').single()
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/owner')
  return { success: true, data }
}

export async function togglePromotion(promotionId: string, active: boolean) {
  const supabase = await getServerSupabase()
  // Fetch business id for promotion to authz
  const { data: promoRow } = await (supabase.from('promotions') as any).select('business_id').eq('id', promotionId).single()
  if (!promoRow) return { success: false, error: 'not_found' }
  const authz = await ensureBusinessAccess(promoRow.business_id)
  if (!authz.ok) return { success: false, error: authz.error }
  const { data, error } = await (supabase.from('promotions') as any).update({ is_active: active }).eq('id', promotionId).select('*').single()
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/owner')
  return { success: true, data }
}

export async function updatePromotion(promotionId: string, patch: {
  name?: string
  promoType?: string
  config?: Record<string, any>
  priority?: number
  endsAt?: string | null
  isActive?: boolean
}) {
  const supabase = await getServerSupabase()
  const { data: promoRow } = await (supabase.from('promotions') as any).select('business_id').eq('id', promotionId).single()
  if (!promoRow) return { success: false, error: 'not_found' }
  const authz = await ensureBusinessAccess(promoRow.business_id)
  if (!authz.ok) return { success: false, error: authz.error }
  const updates: any = {}
  if (patch.name !== undefined) updates.name = patch.name
  if (patch.promoType !== undefined) updates.promo_type = patch.promoType
  if (patch.config !== undefined) updates.config = patch.config
  if (patch.priority !== undefined) updates.priority = patch.priority
  if (patch.endsAt !== undefined) updates.ends_at = patch.endsAt
  if (patch.isActive !== undefined) updates.is_active = patch.isActive
  if (Object.keys(updates).length === 0) return { success: false, error: 'no_fields' }
  const { data, error } = await (supabase.from('promotions') as any).update(updates).eq('id', promotionId).select('*').single()
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/owner')
  return { success: true, data }
}

export async function deletePromotion(promotionId: string) {
  const supabase = await getServerSupabase()
  const { data: promoRow } = await (supabase.from('promotions') as any).select('business_id').eq('id', promotionId).single()
  if (!promoRow) return { success: false, error: 'not_found' }
  const authz = await ensureBusinessAccess(promoRow.business_id)
  if (!authz.ok) return { success: false, error: authz.error }
  const { error } = await supabase.from('promotions').delete().eq('id', promotionId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/owner')
  return { success: true }
}

export interface PromotionListFilters {
  status?: 'active' | 'inactive' | 'expired' | 'upcoming'
  type?: string
  search?: string
}

export async function listPromotions(params: {
  businessId: string
  page?: number
  pageSize?: number
  filters?: PromotionListFilters
  orderBy?: 'created_at' | 'priority' | 'ends_at'
  orderDir?: 'asc' | 'desc'
}) {
  const supabase = await getServerSupabase()
  const authz = await ensureBusinessAccess(params.businessId)
  if (!authz.ok) return { success: false, error: authz.error }
  let query = supabase.from('promotions').select('*', { count: 'exact' }).eq('business_id', params.businessId)
  const { filters } = params
  if (filters?.type) query = query.eq('promo_type', filters.type)
  if (filters?.search) query = query.ilike('name', `%${filters.search}%`)
  if (filters?.status) {
    const nowIso = new Date().toISOString()
    switch (filters.status) {
      case 'active':
        query = query.eq('is_active', true).lte('starts_at', nowIso).or(`ends_at.is.null,ends_at.gte.${nowIso}`)
        break
      case 'inactive':
        query = query.eq('is_active', false)
        break
      case 'expired':
        query = query.not('ends_at', 'is', null).lt('ends_at', nowIso)
        break
      case 'upcoming':
        query = query.gt('starts_at', nowIso)
        break
    }
  }
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)
  if (params.orderBy) query = query.order(params.orderBy, { ascending: (params.orderDir ?? 'desc') === 'asc' })
  const { data, error, count } = await query
  if (error) return { success: false, error: error.message }
  return { success: true, data, count, page, pageSize }
}

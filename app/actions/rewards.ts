'use server'
import { getServerSupabase } from '@/lib/supabaseServer'
import { ensureBusinessAccess } from './authz'

export async function generateRewardClaimToken(rewardId: string) {
  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success:false, error:'auth_required' }
  const { data: rewardRow, error: rErr } = await (supabase.from('rewards') as any).select('id,business_id,customer_card_id').eq('id', rewardId).single()
  if (rErr || !rewardRow) return { success:false, error:'not_found' }
  // Ensure user is owner/staff OR the customer who owns it
  const { data: cardRow } = await (supabase.from('customer_cards') as any).select('customer_id').eq('id', rewardRow.customer_card_id).single()
  if (!cardRow) return { success:false, error:'card_missing' }
  if (cardRow.customer_id !== user.id) {
    const authz = await ensureBusinessAccess(rewardRow.business_id)
    if (!authz.ok) return { success:false, error:'forbidden' }
  }
  const { data, error } = await (supabase as any).rpc('generate_reward_claim_token', { p_reward_id: rewardId })
  if (error) return { success:false, error: error.message }
  return { success:true, data }
}

export async function redeemRewardClaimToken(businessId: string, token: string) {
  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success:false, error:'auth_required' }
  // Only staff/owner can redeem
  const authz = await ensureBusinessAccess(businessId)
  if (!authz.ok) return { success:false, error: authz.error }
  const { data, error } = await (supabase as any).rpc('redeem_reward_claim_token', { p_business_id: businessId, p_qr_token: token })
  if (error) return { success:false, error: error.message }
  return { success:true, data }
}

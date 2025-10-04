'use server'
import { getServerSupabase } from '@/lib/supabaseServer'

export async function getPublicPromotions(businessId: string) {
  const supabase = await getServerSupabase()
  const { data, error } = await (supabase as any).rpc('get_public_active_promotions', { p_business_id: businessId })
  if (error) return { success:false, error: error.message }
  return { success:true, data }
}

export async function ensureCustomerCardAndPass(businessId: string) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success:false, error: 'auth_required' }
  const { data, error } = await (supabase as any).rpc('ensure_customer_card_and_pass', { p_business_id: businessId })
  if (error) return { success:false, error: error.message }
  return { success:true, data }
}

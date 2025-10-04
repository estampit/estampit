'use server'

import { getServerSupabase } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/database.types'

export async function ensureCustomerCard(loyaltyCardId: string) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'auth_required' }
  const { data, error } = await (supabase.rpc as any)('ensure_customer_and_card', {
    p_customer_id: user.id,
    p_loyalty_card_id: loyaltyCardId
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/me')
  return { success: true, data }
}

export async function generateWalletPass(customerCardId: string, businessId: string) {
  const supabase = await getServerSupabase()
  const { data, error } = await (supabase.rpc as any)('generate_wallet_pass', {
    p_business_id: businessId,
    p_customer_card_id: customerCardId
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/me')
  return { success: true, data }
}

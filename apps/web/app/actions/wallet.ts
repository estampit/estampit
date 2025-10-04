'use server'

import { getServerSupabase } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export async function redeemWalletPassToken(businessId: string, qrToken: string) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'auth_required' }

  // Check ownership
  const { data: ownerRow, error: ownerErr } = await supabase
    .from('businesses')
    .select('id, owner_id')
    .eq('id', businessId)
    .limit(1)
    .single()
  if (ownerErr || !ownerRow) return { success: false, error: 'business_not_found' }

  let allowed = (ownerRow as any).owner_id === user.id
  if (!allowed) {
    const { data: staffRow } = await supabase.from('business_staff')
      .select('id')
      .eq('business_id', businessId)
      .eq('staff_id', user.id)
      .eq('is_active', true)
      .limit(1)
    allowed = !!staffRow && staffRow.length > 0
  }
  if (!allowed) return { success: false, error: 'forbidden' }

  const { data, error } = await (supabase.rpc as any)('redeem_wallet_pass_token', {
    p_business_id: businessId,
    p_qr_token: qrToken
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/dashboard/me')
  revalidatePath('/dashboard/owner')
  return { success: true, data }
}

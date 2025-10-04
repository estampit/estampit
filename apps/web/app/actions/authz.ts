'use server'

import { getServerSupabase } from '@/lib/supabaseServer'

/**
 * Ensures the current authenticated user is owner (or staff) of the business.
 * Uses DB helper assert_business_owner plus fallback check on business_staff.
 */
export async function ensureBusinessAccess(businessId: string) {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'auth_required' }
  // Try fast path via SQL helper
  try {
    const { data: okFunc } = await (supabase as any).rpc('assert_business_owner', { p_business_id: businessId })
    if (okFunc === true) return { ok: true, role: 'owner' as const }
  } catch { /* ignore and fallback */ }
  // Fallback: check staff membership
  const { data: staff, error } = await (supabase.from('business_staff') as any).select('role').eq('business_id', businessId).eq('user_id', user.id).maybeSingle()
  if (error) return { ok: false, error: error.message }
  if (!staff) return { ok: false, error: 'forbidden' }
  return { ok: true, role: (staff as any).role || 'staff' }
}

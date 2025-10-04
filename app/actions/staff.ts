'use server'
import { getServerSupabase } from '@/lib/supabaseServer'
import { ensureBusinessAccess } from './authz'

export interface StaffRecord {
  id: string
  user_id: string
  business_id: string
  role: string
  is_active: boolean
  created_at: string
  user_email?: string | null
}

export async function listStaff(businessId: string) {
  const supabase = getServerSupabase()
  const authz = await ensureBusinessAccess(businessId)
  if (!authz.ok) return { success:false, error: authz.error }
  const { data, error } = await (supabase.from('business_staff') as any)
    .select('id,user_id,business_id,role,is_active,created_at')
    .eq('business_id', businessId)
    .order('created_at')
  if (error) return { success:false, error: error.message }
  return { success:true, data }
}

export async function addStaff(businessId: string, email: string, role: string = 'staff') {
  // Placeholder: In real scenario we would look up user by email (auth.users) via service key.
  // For now, return an error to indicate manual process.
  const authz = await ensureBusinessAccess(businessId)
  if (!authz.ok) return { success:false, error: authz.error }
  return { success:false, error: 'not_implemented', detail: 'Necesita clave de servicio para invitar usuarios por email.' }
}

export async function updateStaffRole(staffId: string, role: string) {
  const supabase = getServerSupabase()
  const { data: row, error: fetchErr } = await (supabase.from('business_staff') as any).select('business_id').eq('id', staffId).single()
  if (fetchErr) return { success:false, error: fetchErr.message }
  const authz = await ensureBusinessAccess(row.business_id)
  if (!authz.ok) return { success:false, error: authz.error }
  const { data, error } = await (supabase.from('business_staff') as any).update({ role }).eq('id', staffId).select('*').single()
  if (error) return { success:false, error: error.message }
  return { success:true, data }
}

export async function setStaffActive(staffId: string, isActive: boolean) {
  const supabase = getServerSupabase()
  const { data: row, error: fetchErr } = await (supabase.from('business_staff') as any).select('business_id').eq('id', staffId).single()
  if (fetchErr) return { success:false, error: fetchErr.message }
  const authz = await ensureBusinessAccess(row.business_id)
  if (!authz.ok) return { success:false, error: authz.error }
  const { data, error } = await (supabase.from('business_staff') as any).update({ is_active: isActive }).eq('id', staffId).select('*').single()
  if (error) return { success:false, error: error.message }
  return { success:true, data }
}

"use server"

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function initBusiness() {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'not_authenticated' }
  }

  const { data, error } = await supabase.rpc('ensure_business_and_default_card')
  if (error) return { error: error.message }
  // Intentar seed de promoción demo (ignorar error si ya existe)
  await supabase.rpc('seed_demo_promotion')
  return { data }
}

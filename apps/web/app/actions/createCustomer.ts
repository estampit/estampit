"use server"

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface CreateCustomerArgs {
  email: string
  name?: string
  businessId: string
  loyaltyCardId: string
}

export async function createCustomerAction(args: CreateCustomerArgs) {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'not_authenticated' }

  const { data, error } = await supabase.rpc('ensure_customer_and_card', {
    p_business_id: args.businessId,
    p_loyalty_card_id: args.loyaltyCardId,
    p_customer_email: args.email,
    p_customer_name: args.name || null
  })
  if (error) return { error: error.message }
  return { data }
}

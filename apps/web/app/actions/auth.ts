'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export async function loginAction(email: string, password: string) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {
            console.error('Error setting cookie:', error)
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            console.error('Error removing cookie:', error)
          }
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data.user || !data.session) {
    return { success: false, error: 'Sesión inválida' }
  }

  return { 
    success: true, 
    user: { 
      id: data.user.id, 
      email: data.user.email 
    } 
  }
}

export async function signUpAction(email: string, password: string) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {
            console.error('Error setting cookie:', error)
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            console.error('Error removing cookie:', error)
          }
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/dashboard/owner`,
    }
  })

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data.user) {
    return { success: false, error: 'No se pudo crear el usuario' }
  }

  return { 
    success: true, 
    hasSession: !!data.session,
    needsConfirmation: !data.user.confirmed_at,
    user: { 
      id: data.user.id, 
      email: data.user.email 
    } 
  }
}

export async function registerCustomer({
  email,
  password,
  name,
  phone,
  businessId
}: {
  email: string
  password: string
  name: string
  phone?: string
  businessId?: string
}) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {
            console.error('Error setting cookie:', error)
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            console.error('Error removing cookie:', error)
          }
        },
      },
    }
  )

  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  if (!authData.user) {
    return { success: false, error: 'No se pudo crear el usuario' }
  }

  // Create customer profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      name,
      phone,
      email,
      user_type: 'customer'
    })

  if (profileError) {
    console.error('Error creating customer profile:', profileError)
    // Don't fail the registration if profile creation fails
  }

  // If businessId is provided, create the customer card and wallet pass
  if (businessId) {
    try {
      // Get the first active loyalty card for this business
      const { data: loyaltyCard, error: cardError } = await supabase
        .from('loyalty_cards')
        .select('id')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .limit(1)
        .single()

      if (cardError || !loyaltyCard) {
        console.error('No active loyalty card found for business:', businessId, cardError)
        // Don't fail registration if no loyalty card exists
      } else {
        const { data, error } = await supabase.rpc('ensure_customer_and_card', {
          p_business_id: businessId,
          p_customer_email: email,
          p_customer_name: name,
          p_loyalty_card_id: loyaltyCard.id
        })

        if (error) {
          console.error('Error creating customer card:', error)
          // Don't fail registration if card creation fails
        }
      }
    } catch (error) {
      console.error('Error in business card creation:', error)
      // Don't fail registration if business logic fails
    }
  }

  return {
    success: true,
    hasSession: !!authData.session,
    needsConfirmation: !authData.user.confirmed_at,
    user: {
      id: authData.user.id,
      email: authData.user.email
    }
  }
}

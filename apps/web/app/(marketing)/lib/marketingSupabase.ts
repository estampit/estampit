import { cache } from 'react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Lightweight Supabase client for marketing data fetching.
 * Avoids using `cookies()` so landing pages can stay statically optimized.
 */
export const getMarketingSupabase = cache(async (): Promise<SupabaseClient<Database> | null> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    console.warn('⚠️ Missing Supabase credentials for marketing data fetch')
    return null
  }

  try {
    return createClient<Database>(url, anonKey, {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  } catch (error) {
    console.warn('⚠️ Unable to create marketing Supabase client', error)
    return null
  }
})

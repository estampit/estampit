import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

// Helper to build a server-side supabase client with cookie persist compatible with Next 15
export function getServerSupabase() {
  return createServerComponentClient<Database>({ cookies })
}

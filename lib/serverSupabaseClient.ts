// serverSupabaseClient.ts
// Uso exclusivo en Server Actions / Route Handlers / RSC (NO en el cliente)
// Usa la service role key para operaciones privilegiadas (bypass RLS) cuando sea estrictamente necesario.
// IMPORTANTE: No exportar este cliente a código que llegue al browser.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let serverClient: SupabaseClient | null = null

export function getServerSupabaseClient() {
  if (serverClient) return serverClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRole) {
    throw new Error('Faltan variables para server client: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  }
  serverClient = createClient(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  return serverClient
}

export type { SupabaseClient }

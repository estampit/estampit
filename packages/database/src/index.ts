import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getClient(url?: string, anonKey?: string) {
  if (!client) {
    const supabaseUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anon = anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    client = createClient(supabaseUrl, anon, {
      auth: { persistSession: true }
    });
  }
  return client;
}

export * from '@supabase/supabase-js';

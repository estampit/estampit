#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('🏪 Actualizando nombre del negocio...\n')

const userId = '14b7874f-9a69-4d9e-9087-f5f300557757'

const { data: biz, error } = await supabase
  .from('businesses')
  .update({ name: 'Mi Negocio' })
  .eq('owner_id', userId)
  .select()
  .single()

if (error) {
  console.error('❌ Error:', error.message)
} else {
  console.log('✅ Negocio actualizado:')
  console.log('  - Nombre:', biz.name)
  console.log('  - ID:', biz.id)
  console.log('\n💡 Ahora recarga el dashboard y verás "Mi Negocio" en vez del email')
}

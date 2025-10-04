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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

console.log('🔍 Verificando políticas RLS...\n')

const userId = '14b7874f-9a69-4d9e-9087-f5f300557757'

console.log('1️⃣ Consultando con Service Role (bypass RLS):')
const { data: biz1, error: err1 } = await supabase
  .from('businesses')
  .select('*')
  .eq('owner_id', userId)

console.log('Resultado:', biz1 ? `✅ ${biz1.length} negocios encontrados` : `❌ Error: ${err1?.message}`)
if (biz1 && biz1.length > 0) {
  console.log('Negocio:', biz1[0].name, '(ID:', biz1[0].id, ')')
}

console.log('\n2️⃣ El problema es que las políticas RLS están activas pero el contexto de autenticación')
console.log('   no se está pasando correctamente desde Next.js a Supabase.')

console.log('\n💡 SOLUCIÓN: Desactivar RLS temporalmente')
console.log('\nEjecuta este SQL en Supabase:')
console.log('━'.repeat(60))
console.log('ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;')
console.log('━'.repeat(60))
console.log('\n🔗 URL: https://supabase.com/dashboard/project/ntswpcbywkzekfyrbhdj/sql/new')
console.log('\n✅ Después, recarga http://localhost:3000/dashboard/owner')

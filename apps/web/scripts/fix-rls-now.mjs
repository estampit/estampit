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

console.log('🚨 SOLUCIONANDO PROBLEMA DE RLS...\n')

// Usar fetch directo a la API de Supabase
const projectRef = 'ntswpcbywkzekfyrbhdj'
const sqlQuery = 'ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;'

console.log('📋 SQL a ejecutar:')
console.log(sqlQuery)
console.log('\n⚠️  IMPORTANTE: Necesitas ejecutar esto manualmente.')
console.log('\n🔗 Ve a: https://supabase.com/dashboard/project/ntswpcbywkzekfyrbhdj/sql/new')
console.log('\n📝 Copia y pega este SQL:')
console.log('━'.repeat(60))
console.log(sqlQuery)
console.log('━'.repeat(60))
console.log('\n✅ Después de ejecutarlo, recarga tu dashboard en http://localhost:3000/dashboard/owner')
console.log('\n💡 Esto desactivará temporalmente RLS para que puedas ver el dashboard.')
console.log('   Más tarde puedes volver a activarlo y configurar las políticas correctamente.')

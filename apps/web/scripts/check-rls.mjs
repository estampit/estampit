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
const projectRef = 'ntswpcbywkzekfyrbhdj' // Extract from URL

console.log('🔧 Arreglando políticas RLS usando API REST...\n')

// Necesitamos usar la API de gestión de Supabase o ejecutar SQL raw
// Por ahora, voy a usar un hack: desactivar RLS temporalmente y crear el negocio

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Verificar que el usuario pueda acceder a su negocio
const userId = '14b7874f-9a69-4d9e-9087-f5f300557757'

console.log('1️⃣ Verificando acceso con Service Role...')
const { data: biz1, error: err1 } = await supabase
  .from('businesses')
  .select('*')
  .eq('owner_id', userId)

console.log('Con Service Role:', biz1 ? '✅ OK' : '❌ Error', err1?.message || '')

console.log('\n2️⃣ Verificando políticas actuales...')
const { data: policies, error: polErr } = await supabase
  .from('pg_policies')
  .select('*')
  .eq('tablename', 'businesses')

if (policies) {
  console.log(`Políticas existentes: ${policies.length}`)
  policies.forEach(p => {
    console.log(`  - ${p.policyname}: ${p.cmd}`)
  })
} else {
  console.log('❌ No se pueden consultar políticas:', polErr?.message)
}

console.log('\n📋 SOLUCIÓN MANUAL NECESARIA:')
console.log('Ve a: https://supabase.com/dashboard/project/ntswpcbywkzekfyrbhdj/sql/new')
console.log('Y ejecuta el siguiente SQL:\n')

const sql = `
-- Drop ALL existing policies on businesses table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'businesses') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON businesses';
    END LOOP;
END $$;

-- Disable and re-enable RLS
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
CREATE POLICY "Enable read for authenticated users on own businesses"
ON businesses FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Enable insert for authenticated users"
ON businesses FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Enable update for authenticated users on own businesses"
ON businesses FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'businesses';
`

console.log(sql)

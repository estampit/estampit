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

console.log('🔧 Arreglando políticas RLS...\n')

// SQL para arreglar las políticas
const fixPoliciesSQL = `
-- Drop existing policies
DROP POLICY IF EXISTS "businesses_select_owner" ON businesses;
DROP POLICY IF EXISTS "businesses_insert_owner" ON businesses;
DROP POLICY IF EXISTS "businesses_update_owner" ON businesses;
DROP POLICY IF EXISTS "businesses_delete_owner" ON businesses;
DROP POLICY IF EXISTS "businesses_select_staff" ON businesses;

-- Ensure RLS is enabled
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Simple SELECT policy for owners
CREATE POLICY "businesses_select_owner" 
ON businesses FOR SELECT 
TO authenticated
USING (owner_id = auth.uid());

-- INSERT policy
CREATE POLICY "businesses_insert_owner" 
ON businesses FOR INSERT 
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- UPDATE policy
CREATE POLICY "businesses_update_owner" 
ON businesses FOR UPDATE 
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- DELETE policy
CREATE POLICY "businesses_delete_owner" 
ON businesses FOR DELETE 
TO authenticated
USING (owner_id = auth.uid());

-- Staff can read business info
CREATE POLICY "businesses_select_staff" 
ON businesses FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM business_staff 
    WHERE business_staff.business_id = businesses.id 
    AND business_staff.staff_id = auth.uid()
    AND business_staff.is_active = true
  )
);
`

try {
  const { data, error } = await supabase.rpc('exec_sql', { sql: fixPoliciesSQL })
  
  if (error) {
    console.error('❌ Error ejecutando SQL:', error.message)
    console.log('\n📋 Copia y pega este SQL en Supabase SQL Editor:')
    console.log('https://supabase.com/dashboard/project/ntswpcbywkzekfyrbhdj/sql/new')
    console.log('\n' + fixPoliciesSQL)
  } else {
    console.log('✅ Políticas RLS actualizadas correctamente')
  }
} catch (err) {
  console.error('❌ Error:', err.message)
  console.log('\n📋 Copia y pega este SQL en Supabase SQL Editor:')
  console.log('https://supabase.com/dashboard/project/ntswpcbywkzekfyrbhdj/sql/new')
  console.log('\n' + fixPoliciesSQL)
}

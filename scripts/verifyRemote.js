#!/usr/bin/env node
/**
 * verifyRemote.js
 * Verifica que el remoto Supabase tenga tablas, funciones y RLS esperados.
 * Usa la función RPC get_platform_objects() creada en migración 013.
 * Carga automáticamente variables de .env.local (si existe) usando dotenv.
 * Variables esperadas:
 *  - NEXT_PUBLIC_SUPABASE_URL
 *  - NEXT_PUBLIC_SUPABASE_ANON_KEY (preferido para verificación)
 *  - SUPABASE_SERVICE_ROLE_KEY (opcional fallback SOLO para CI privado)
 */

try {
  // Carga perezosa; si no existe el archivo no falla.
  require('dotenv').config({ path: '.env.local' })
} catch (_) {
  // ignorar
}

const { createClient } = require('@supabase/supabase-js')

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const rawAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const rawService = process.env.SUPABASE_SERVICE_ROLE_KEY

const url = rawUrl && rawUrl.trim()
let anon = rawAnon && rawAnon.trim()
const service = rawService && rawService.trim()

if (!url) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL en el entorno.')
  process.exit(1)
}

if (!anon && service) {
  console.warn('[WARN] No hay ANON_KEY, usando SERVICE_ROLE_KEY solo para verificación privada.')
  anon = service
}

if (!anon) {
  console.error('Faltan claves: provee NEXT_PUBLIC_SUPABASE_ANON_KEY (o SERVICE_ROLE_KEY como fallback).')
  process.exit(1)
}

const supabase = createClient(url, anon)

const EXPECTED_TABLES = [
  'businesses','business_subscriptions','customer_cards','events','loyalty_cards',
  'promotion_usages','promotions','purchases','rewards','stamps','subscription_plans',
  'wallet_passes','profiles','business_stats'
].sort()

const EXPECTED_FUNCTIONS = [
  'add_purchase_with_stamp','add_stamp_with_promotions','ensure_business_and_default_card',
  'ensure_business_subscription','ensure_customer_and_card','evaluate_and_apply_promotions',
  'generate_wallet_pass','get_business_analytics','get_business_features','get_customer_dashboard_data',
  'get_platform_objects','log_event','redeem_wallet_pass_token','regenerate_wallet_pass','revoke_wallet_pass'
].sort()

async function main() {
  const { data, error } = await supabase.rpc('get_platform_objects')
  if (error) {
    console.error('Error RPC get_platform_objects:', error.message)
    process.exit(1)
  }

  const tables = (data.tables || []).map(t => t.table_name).sort()
  const functions = (data.functions || []).map(f => f.function_name).sort()
  const rls = data.rls || []

  let ok = true

  function diff(expected, got) {
    return {
      missing: expected.filter(e => !got.includes(e)),
      unexpected: got.filter(g => !expected.includes(g))
    }
  }

  const tableDiff = diff(EXPECTED_TABLES, tables)
  const funcDiff = diff(EXPECTED_FUNCTIONS, functions)

  if (tableDiff.missing.length || tableDiff.unexpected.length) {
    ok = false
    console.log('Tablas - diferencias:')
    console.table(tableDiff)
  } else {
    console.log('Tablas OK (' + tables.length + ')')
  }

  if (funcDiff.missing.length || funcDiff.unexpected.length) {
    ok = false
    console.log('Funciones - diferencias:')
    console.table(funcDiff)
  } else {
    console.log('Funciones OK (' + functions.length + ')')
  }

  // RLS check (solo aseguramos que las tablas sensibles estén listadas y rls_enabled true)
  const sensitive = ['purchases','promotions','wallet_passes','customer_cards','stamps']
  const rlsMap = Object.fromEntries(rls.map(r => [r.table, r.rls_enabled]))
  const rlsIssues = sensitive.filter(t => rlsMap[t] !== true)
  if (rlsIssues.length) {
    ok = false
    console.log('RLS faltante o desactivada en:', rlsIssues)
  } else {
    console.log('RLS OK en tablas sensibles')
  }

  console.log('\nResumen:')
  console.log(JSON.stringify({ tables, functions, rls: rls.slice(0,5), generated_at: data.generated_at }, null, 2))

  if (!ok) {
    console.error('\nVerificación: FALLÓ')
    process.exit(2)
  }
  console.log('\nVerificación: TODO CORRECTO')
}

main().catch(e => {
  console.error('Error inesperado:', e)
  process.exit(1)
})

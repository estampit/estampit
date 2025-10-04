#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('🔍 Diagnóstico de la base de datos...\n')

// 1. Verificar estructura de la tabla businesses
console.log('1️⃣ Verificando tabla businesses...')
const { data: businesses, error: bizError } = await supabase
  .from('businesses')
  .select('*')
  .limit(1)

if (bizError) {
  console.error('❌ Error consultando businesses:', bizError.message)
  console.error('Detalles:', JSON.stringify(bizError, null, 2))
} else {
  console.log('✅ Tabla businesses existe')
  console.log('Columnas:', businesses?.[0] ? Object.keys(businesses[0]) : 'tabla vacía')
}

// 2. Verificar usuario
console.log('\n2️⃣ Verificando usuario luis@suatfuels.com...')
const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()

if (userError) {
  console.error('❌ Error listando usuarios:', userError.message)
} else {
  const user = users.find(u => u.email === 'luis@suatfuels.com')
  if (user) {
    console.log('✅ Usuario encontrado:')
    console.log('  - ID:', user.id)
    console.log('  - Email:', user.email)
    console.log('  - Email confirmado:', user.email_confirmed_at ? '✅ Sí' : '❌ No')
    console.log('  - Creado:', user.created_at)

    // 3. Verificar si el usuario tiene negocios
    console.log('\n3️⃣ Verificando negocios del usuario...')
    const { data: userBusinesses, error: userBizError } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id)

    if (userBizError) {
      console.error('❌ Error consultando negocios del usuario:', userBizError.message)
      console.error('Detalles:', JSON.stringify(userBizError, null, 2))
    } else {
      console.log(`✅ Usuario tiene ${userBusinesses?.length || 0} negocios`)
      if (userBusinesses && userBusinesses.length > 0) {
        userBusinesses.forEach(biz => {
          console.log(`  - ${biz.name} (ID: ${biz.id})`)
        })
      }
    }

    // 4. Si no tiene negocios, intentar crear uno
    if (!userBusinesses || userBusinesses.length === 0) {
      console.log('\n4️⃣ Usuario no tiene negocios, intentando crear uno...')
      
      // Primero intentar con RPC
      const { data: rpcResult, error: rpcError } = await supabase.rpc('ensure_business_and_default_card')
      
      if (rpcError) {
        console.error('❌ Error llamando RPC ensure_business_and_default_card:', rpcError.message)
        console.error('Detalles:', JSON.stringify(rpcError, null, 2))
        
        // Intentar crear manualmente
        console.log('\n5️⃣ Intentando crear negocio manualmente...')
        const { data: newBiz, error: insertError } = await supabase
          .from('businesses')
          .insert({
            owner_id: user.id,
            name: 'Mi Negocio',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (insertError) {
          console.error('❌ Error insertando negocio:', insertError.message)
          console.error('Detalles:', JSON.stringify(insertError, null, 2))
        } else {
          console.log('✅ Negocio creado exitosamente:', newBiz)
        }
      } else {
        console.log('✅ RPC ejecutado exitosamente:', rpcResult)
      }
    }

  } else {
    console.log('❌ Usuario luis@suatfuels.com no encontrado')
    console.log('Usuarios disponibles:')
    users.forEach(u => console.log(`  - ${u.email} (${u.id})`))
  }
}

console.log('\n✅ Diagnóstico completado')

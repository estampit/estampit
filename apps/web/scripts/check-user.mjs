import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno desde el archivo .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'exists' : 'missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('🔍 Buscando usuario: luis@suatfuels.com\n')

try {
  // Listar todos los usuarios
  const { data: { users }, error } = await supabase.auth.admin.listUsers()
  
  if (error) {
    console.error('❌ Error listando usuarios:', error)
    process.exit(1)
  }
  
  console.log(`📊 Total de usuarios en el sistema: ${users.length}\n`)
  
  // Buscar el usuario específico
  const targetUser = users.find(u => u.email === 'luis@suatfuels.com')
  
  if (targetUser) {
    console.log('✅ Usuario encontrado:')
    console.log('  - ID:', targetUser.id)
    console.log('  - Email:', targetUser.email)
    console.log('  - Email confirmado:', targetUser.email_confirmed_at ? 'Sí' : 'No')
    console.log('  - Creado:', new Date(targetUser.created_at).toLocaleString())
    console.log('  - Última sesión:', targetUser.last_sign_in_at ? new Date(targetUser.last_sign_in_at).toLocaleString() : 'Nunca')
    
    // Buscar negocios asociados
    console.log('\n🏢 Buscando negocios...')
    const { data: businesses, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', targetUser.id)
    
    if (bizError) {
      console.error('❌ Error buscando negocios:', bizError)
    } else if (businesses && businesses.length > 0) {
      console.log(`✅ ${businesses.length} negocio(s) encontrado(s):`)
      businesses.forEach(biz => {
        console.log(`  - ${biz.name} (ID: ${biz.id})`)
      })
    } else {
      console.log('⚠️ No hay negocios asociados')
    }
  } else {
    console.log('❌ Usuario NO encontrado: luis@suatfuels.com')
    console.log('\n📋 Usuarios disponibles:')
    users.forEach(u => {
      console.log(`  - ${u.email} (ID: ${u.id})`)
    })
  }
  
} catch (err) {
  console.error('💥 Error:', err)
  process.exit(1)
}

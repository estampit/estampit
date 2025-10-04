#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
if(!url||!key){ console.error('Missing env vars'); process.exit(1) }
const supabase = createClient(url, key)
;(async()=>{
  const tables = ['businesses','loyalty_cards','promotions','purchases','wallet_passes']
  for(const t of tables){
    const { data, error, status } = await supabase.from(t).select('*').limit(1)
    if(error){
      console.log(`${t}: ERROR (${error.code || status}) ${error.message}`)
    } else {
      console.log(`${t}: OK (${data.length} rows sample)`)  
    }
  }
})()
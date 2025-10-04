#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
if(!url||!anon){
  console.error('Missing URL or key');
  process.exit(1)
}
;(async()=>{
  const client = createClient(url, anon)
  // Use catalog query through postgres exposed function? Not directly accessible.
  // Fallback: attempt calling each expected function with empty params to see which error surfaces.
  const expected = [
    'get_platform_objects','get_business_analytics','get_business_features','add_purchase_with_stamp'
  ]
  for(const fn of expected){
    const { data, error } = await client.rpc(fn, {})
    if(error){
      console.log(fn, 'ERROR:', error.message)
    } else {
      console.log(fn, 'OK')
    }
  }
})()
'use server'

import { getServerSupabase } from '@/lib/supabaseServer'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'
type Tables = Database['public']['Tables']
type BusinessRow = Tables['businesses']['Row']
type LoyaltyCardRow = Tables['loyalty_cards']['Row']

export async function createBusinessWithCard(params: { name: string; description?: string }) {
  const demoStore = await cookies()
  const demo = demoStore.get('demo_user')?.value
  const supabase = await getServerSupabase()
  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) {
      if (!demo) return { success: false, error: 'auth_required' }
      return {
        success: true,
        data: {
          business_id: 'demo-biz-1',
          business: { id: 'demo-biz-1', name: params.name || 'Demo Negocio' },
          loyalty_card_id: 'demo-card-1'
        }
      }
    }

    // Llamar RPC sin parámetros (crea si no existe y devuelve JSONB o null)
    const { error: rpcError } = await (supabase as any).rpc('ensure_business_and_default_card')
    if (rpcError) return { success: false, error: rpcError.message }

    // Leer negocio más reciente del owner
    const { data: businessList, error: bizErr } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
    if (bizErr || !businessList?.length) return { success: false, error: bizErr?.message || 'business_not_found' }
  let business: BusinessRow = businessList[0] as BusinessRow

    // Actualizar nombre si difiere
    if (params.name && params.name.trim() && business.name !== params.name.trim()) {
      const { data: updated, error: updErr } = await (supabase as any)
        .from('businesses')
        .update({ name: params.name.trim() })
        .eq('id', business.id)
        .select()
        .single()
      if (!updErr && updated) business = updated
    }

    const { data: cardList, error: cardErr } = await supabase
      .from('loyalty_cards')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: true })
      .limit(1)
    if (cardErr || !cardList?.length) return { success: false, error: cardErr?.message || 'card_not_found' }
  const loyalty_card: LoyaltyCardRow = cardList[0] as LoyaltyCardRow

    return {
      success: true,
      data: {
        business_id: business.id,
        business,
        loyalty_card_id: loyalty_card.id
      }
    }
  } catch (e: any) {
    if (demo) {
      return {
        success: true,
        data: {
          business_id: 'demo-biz-1',
          business: { id: 'demo-biz-1', name: params.name || 'Demo Negocio' },
          loyalty_card_id: 'demo-card-1'
        }
      }
    }
    return { success: false, error: e?.message || 'unknown_error' }
  }
}

export async function uploadBusinessLogo(businessId: string, file: File) {
  const demoStore = await cookies()
  const demo = demoStore.get('demo_user')?.value
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    if (demo) {
      return { success: true, logo_url: 'https://placehold.co/96x96?text=Logo' }
    }
    return { success: false, error: 'auth_required' }
  }
  const ext = file.name.split('.').pop() || 'png'
  const path = `business-logos/${businessId}.${ext}`
  const { error: upErr } = await supabase.storage.from('public').upload(path, file, { upsert: true })
  if (upErr) return { success: false, error: upErr.message }
  const { data: publicUrlData } = supabase.storage.from('public').getPublicUrl(path)
  const { error: updErr } = await (supabase as any).from('businesses').update({ logo_url: publicUrlData.publicUrl }).eq('id', businessId)
  if (updErr) return { success: false, error: updErr.message }
  return { success: true, logo_url: publicUrlData.publicUrl }
}

export async function updateBusinessAppearance(businessId: string, appearance: {
  primary_color?: string
  secondary_color?: string
  background_color?: string
  text_color?: string
  card_title?: string
  card_description?: string
}) {
  const demoStore = await cookies()
  const demo = demoStore.get('demo_user')?.value
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    if (demo) {
      return { success: true, appearance }
    }
    return { success: false, error: 'auth_required' }
  }
  
  const { error } = await (supabase as any).from('businesses').update({
    primary_color: appearance.primary_color,
    secondary_color: appearance.secondary_color,
    background_color: appearance.background_color,
    text_color: appearance.text_color,
    card_title: appearance.card_title,
    card_description: appearance.card_description
  }).eq('id', businessId)
  
  if (error) return { success: false, error: error.message }
  return { success: true, appearance }
}

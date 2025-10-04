import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 400 }
      )
    }

    // Simple token validation (replace with JWT.verify in production)
    if (!token.startsWith('token_')) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Extract IDs from token (format: token_customerId_storeId_timestamp)
    const parts = token.split('_')
    if (parts.length !== 4) {
      return NextResponse.json(
        { error: 'Token malformado' },
        { status: 401 }
      )
    }

    const customerId = parts[1]
    const storeId = parts[2]

    const supabase = await createClient()

    // Get membership
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('*, stores(*)')
      .eq('customer_id', customerId)
      .eq('store_id', storeId)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Membresía no encontrada' },
        { status: 404 }
      )
    }

    // Record scan
    const { error: scanError } = await supabase
      .from('scans')
      .insert({
        membership_id: membership.id,
        store_id: storeId,
        source: 'pass_scan'
      })

    if (scanError) {
      console.error('Error recording scan:', scanError)
    }

    // Update stamps and check for reward
    let newStamps = membership.stamps + 1
    let newCoupons = membership.coupons_available

    if (newStamps >= membership.stores.reward_goal) {
      newCoupons += 1
      newStamps = 0 // Reset stamps after reward
    }

    // Update membership
    const { error: updateError } = await supabase
      .from('memberships')
      .update({
        stamps: newStamps,
        coupons_available: newCoupons,
        last_scan_at: new Date().toISOString()
      })
      .eq('id', membership.id)

    if (updateError) {
      console.error('Error updating membership:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar membresía' },
        { status: 500 }
      )
    }

    // Return updated status
    return NextResponse.json({
      success: true,
      customer: `${membership.customers?.first_name} ${membership.customers?.last_name}`,
      store: membership.stores?.name,
      stamps: newStamps,
      remaining: Math.max(0, membership.stores.reward_goal - newStamps),
      coupons: newCoupons,
      scannedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('store')

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID requerido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', userId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Get store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single()

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      )
    }

    // Get membership
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('*')
      .eq('customer_id', userId)
      .eq('store_id', storeId)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Membresía no encontrada' },
        { status: 404 }
      )
    }

    // Calculate remaining stamps
    const remaining = Math.max(0, store.reward_goal - membership.stamps)

    // For development, return JSON instead of .pkpass
    // In production, use passkit-generator to create actual .pkpass

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    const verifyUrl = `${baseUrl}/api/verify?token=token_${userId}_${storeId}_${Date.now()}`

    const passData = {
      formatVersion: 1,
      passTypeIdentifier: "pass.com.mystamp.loyalty",
      serialNumber: `${userId}-${storeId}`,
      teamIdentifier: "DEVTEAM",
      organizationName: store.name,
      description: `Tarjeta de fidelización - ${store.name}`,
      foregroundColor: "#ffffff",
      backgroundColor: store.brand_color || "#000000",
      generic: {
        primaryFields: [
          {
            key: "store",
            label: "Tienda",
            value: store.name
          }
        ],
        secondaryFields: [
          {
            key: "remaining",
            label: "Sellos restantes",
            value: remaining.toString()
          },
          {
            key: "coupons",
            label: "Cupones disponibles",
            value: membership.coupons_available.toString()
          },
          {
            key: "last",
            label: "Último escaneo",
            value: membership.last_scan_at
              ? new Date(membership.last_scan_at).toLocaleString('es-ES')
              : "Nunca"
          }
        ]
      },
      barcodes: [{
        message: verifyUrl,
        format: "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1"
      }]
    }

    // Return JSON for development (in production, generate .pkpass)
    return NextResponse.json(passData, {
      headers: {
        'Content-Disposition': `attachment; filename="${store.name.replace(/\s+/g, '_')}.json"`,
      },
    })
  } catch (error) {
    console.error('Pass generation error:', error)
    return NextResponse.json(
      { error: 'Error al generar la tarjeta' },
      { status: 500 }
    )
  }
}
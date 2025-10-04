'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabaseServer'

type WalletPassWithDetails = {
  id: string
  qr_token: string
  customer_cards: {
    current_stamps: number
    loyalty_cards: {
      stamps_required: number
      reward_description: string
      businesses: {
        name: string
      }
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
  }

  try {
    const supabase = await getServerSupabase()

    // Verificar que el token existe y obtener datos completos con joins
    const { data: passData, error } = await supabase
      .from('wallet_passes')
      .select(`
        *,
        customer_cards!inner (
          current_stamps,
          loyalty_cards!inner (
            stamps_required,
            reward_description,
            businesses!inner (
              name
            )
          )
        )
      `)
      .eq('qr_token', token)
      .single()

    if (error || !passData) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
    }

    const data = passData as WalletPassWithDetails

    // Para testing local, vamos a crear un archivo .pkpass simulado
    // En producción esto sería generado por el backend con certificados de Apple

    // Crear contenido simulado de un wallet pass (JSON + estructura básica)
    const passContent = {
      formatVersion: 1,
      passTypeIdentifier: "pass.com.mystamp.loyalty",
      serialNumber: data.id,
      teamIdentifier: "TEAM123456", // Simulado para testing
      organizationName: "MyStamp",
      description: "Tarjeta de Fidelización",
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(0, 123, 255)",
      generic: {
        primaryFields: [
          {
            key: "stamps",
            label: "Sellos",
            value: `${data.customer_cards.current_stamps || 0}/${data.customer_cards.loyalty_cards.stamps_required || 10}`
          }
        ],
        secondaryFields: [
          {
            key: "business",
            label: "Negocio",
            value: data.customer_cards.loyalty_cards.businesses.name || "Negocio"
          }
        ],
        auxiliaryFields: [
          {
            key: "reward",
            label: "Recompensa",
            value: data.customer_cards.loyalty_cards.reward_description || "Descuento especial"
          }
        ]
      },
      barcodes: [
        {
          format: "PKBarcodeFormatQR",
          message: token,
          messageEncoding: "iso-8859-1"
        }
      ]
    }

    // Crear un archivo ZIP simulado (en producción sería un .pkpass real)
    // Para testing, devolveremos el JSON que se puede usar para crear un pass manualmente

    return new NextResponse(JSON.stringify(passContent, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="wallet-pass.json"'
      }
    })

  } catch (error) {
    console.error('Error generando wallet pass:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
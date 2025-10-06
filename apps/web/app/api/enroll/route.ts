import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, phone, email, birthdate, storeCode } = await request.json()

    if (!firstName || !lastName || !phone || !email || !birthdate || !storeCode) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find store by code
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('code', storeCode)
      .single()

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      )
    }

    // Create or find customer
    let customer
    const { data: existingCustomer, error: _customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single()

    if (existingCustomer) {
      customer = existingCustomer
    } else {
      const { data: newCustomer, error: newCustomerError } = await supabase
        .from('customers')
        .insert({
          first_name: firstName,
          last_name: lastName,
          phone,
          email,
          birthdate,
        })
        .select()
        .single()

      if (newCustomerError) {
        console.error('Error creating customer:', newCustomerError)
        return NextResponse.json(
          { error: 'Error al crear cliente' },
          { status: 500 }
        )
      }
      customer = newCustomer
    }

    // Create or find membership
    const { data: existingMembership } = await supabase
      .from('memberships')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('store_id', store.id)
      .single()

    let membership = existingMembership
    if (!membership) {
      const { data: newMembership, error: membershipError } = await supabase
        .from('memberships')
        .insert({
          customer_id: customer.id,
          store_id: store.id,
        })
        .select()
        .single()

      if (membershipError) {
        console.error('Error creating membership:', membershipError)
        return NextResponse.json(
          { error: 'Error al crear membresía' },
          { status: 500 }
        )
      }
      membership = newMembership
    }

    // Generate simple token for pass (replace with JWT in production)
    const userToken = `token_${customer.id}_${store.id}_${Date.now()}`

    // Record pass issuance
    const { error: issuanceError } = await supabase
      .from('pass_issuances')
      .insert({
        customer_id: customer.id,
        store_id: store.id,
        user_token: userToken,
      })

    if (issuanceError) {
      console.error('Error recording pass issuance:', issuanceError)
      // Don't fail the enrollment for this
    }

    // Generate URLs
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    const passUrl = `${baseUrl}/api/pass/${customer.id}.pkpass?store=${store.id}`
    const verifyUrl = `${baseUrl}/api/verify?token=${userToken}`

    return NextResponse.json({
      success: true,
      customerId: customer.id,
      passUrl,
      verifyUrl,
    })
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
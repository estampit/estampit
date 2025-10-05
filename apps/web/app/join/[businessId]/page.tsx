import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { QuickJoinForm } from '../components/QuickJoinForm'

type SearchParams = {
  promo?: string | string[]
}

type Promotion = {
  id: string
  name: string
  promo_type: string
  ends_at: string | null
}

type BusinessRow = {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  settings: Record<string, any> | null
}

function normalizeParam(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) return param[0]
  return typeof param === 'string' ? param : undefined
}

export default async function JoinBusinessPage({
  params,
  searchParams = Promise.resolve({} as SearchParams)
}: {
  params: Promise<{ businessId: string }>
  searchParams?: Promise<SearchParams>
}) {
  const { businessId } = await params
  const resolvedSearchParams = await searchParams
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return (
      <div className="p-10 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Configuración incompleta</h1>
        <p className="text-sm text-gray-600">
          Falta configurar las claves de Supabase en el entorno (.env.local). Añade
          <code className="px-2 py-1 bg-gray-100 rounded text-xs ml-1">NEXT_PUBLIC_SUPABASE_URL</code>
          y
          <code className="px-2 py-1 bg-gray-100 rounded text-xs ml-1">SUPABASE_SERVICE_ROLE_KEY</code>
          para habilitar el flujo de unión público.
        </p>
      </div>
    )
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const promoParam = normalizeParam(resolvedSearchParams?.promo)

  const { data: business, error: businessErr } = await admin
    .from('businesses')
    .select('id,name,description,logo_url,settings')
    .eq('id', businessId)
    .maybeSingle()

  if (businessErr || !business) {
    return (
      <div className="p-10 text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Negocio no encontrado</h1>
        <p className="text-sm text-gray-500">No pudimos localizar el comercio solicitado.</p>
        <Link href="/" className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded">
          Volver al inicio
        </Link>
      </div>
    )
  }

  const { data: loyaltyCard } = await admin
    .from('loyalty_cards')
    .select('id,name,description,stamps_required,reward_description')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  let promotions: Promotion[] = []
  const { data: promotionsData } = await admin.rpc('get_public_active_promotions', {
    p_business_id: businessId
  })
  if (Array.isArray(promotionsData)) {
    promotions = promotionsData as Promotion[]
  }

  const initialPromotion = promotions.find((promo) => promo.id === promoParam)?.id ?? null

  const businessRecord = business as BusinessRow
  const businessSettings = (businessRecord.settings ?? {}) as Record<string, any>
  const cardTitle = typeof businessSettings.card_title === 'string' && businessSettings.card_title.trim().length > 0
    ? businessSettings.card_title.trim()
    : businessRecord.name
  const cardDescription = typeof businessSettings.card_description === 'string' && businessSettings.card_description.trim().length > 0
    ? businessSettings.card_description.trim()
    : businessRecord.description ?? 'Activa tu tarjeta digital y acumula recompensas sin volver a rellenar formularios.'

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
      <header className="space-y-3 text-center">
        {businessRecord.logo_url && (
          <div className="flex justify-center">
            <img
              src={businessRecord.logo_url}
              alt={`Logo de ${businessRecord.name}`}
              className="h-16 w-16 rounded-lg object-cover shadow"
            />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{cardTitle}</h1>
          <p className="text-sm text-gray-600 mt-2">{cardDescription}</p>
        </div>
      </header>

      <QuickJoinForm
        businessId={businessId}
        businessName={businessRecord.name}
        promotions={promotions}
        loyaltyCard={loyaltyCard}
        initialPromotionId={initialPromotion}
      />

      <section className="border rounded-lg bg-gray-50 px-4 py-5 text-sm text-gray-600 space-y-2">
        <h2 className="text-base font-semibold text-gray-800">¿Qué ocurre ahora?</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>La primera vez guardamos tus datos de contacto y te entregamos la tarjeta digital de esta tienda.</li>
          <li>Si ya estabas registrado, solo necesitamos tu email o teléfono para añadir la nueva tarjeta automáticamente.</li>
          <li>Podrás mostrar el código QR desde tu wallet para sumar sellos o canjear recompensas en el punto de venta.</li>
        </ul>
      </section>

      <section className="border rounded-lg bg-white shadow-sm px-4 py-5 text-sm text-gray-600 space-y-2">
        <h3 className="text-base font-semibold text-gray-800">Fase 2 · App de gestión</h3>
        <p>
          Estamos preparando una aplicación donde podrás consultar todas tus tarjetas, ver el progreso de cada promoción
          y administrar las recompensas obtenidas. Esta app será opcional: en la fase actual puedes usar el sistema solo con tu Wallet.
        </p>
      </section>
    </div>
  )
}

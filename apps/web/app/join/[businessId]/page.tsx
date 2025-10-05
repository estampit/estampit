import Link from 'next/link'
import { redirect } from 'next/navigation'
import { loadJoinData } from '../lib/loadJoinData'

type SearchParams = {
  promo?: string | string[]
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
  const promoParam = normalizeParam(resolvedSearchParams?.promo)

  let joinData
  try {
    joinData = await loadJoinData(businessId, { focusPromotionId: promoParam })
  } catch (error) {
    if ((error as Error).message === 'business_not_found') {
      return (
        <div className="p-10 text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Negocio no encontrado</h1>
          <p className="text-sm text-gray-500">No pudimos localizar el comercio solicitado.</p>
          <Link href="/" className="inline-flex items-center justify-center rounded bg-indigo-600 px-4 py-2 text-white">
            Volver al inicio
          </Link>
        </div>
      )
    }

    throw error
  }

  const targetPromotionId = joinData.focusedPromotion?.id ?? joinData.promotions[0]?.id ?? null

  if (targetPromotionId) {
    redirect(`/join/${businessId}/${targetPromotionId}`)
  }

  const business = joinData.business as BusinessRow

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-10 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Sin promociones disponibles</h1>
      <p className="text-sm text-gray-600">
        {business.name} no tiene promociones activas en este momento. Pide al comercio que active una campaña para que puedas obtener tu tarjeta.
      </p>
      <Link href="/" className="inline-flex items-center justify-center rounded bg-indigo-600 px-4 py-2 text-white">
        Volver al inicio
      </Link>
    </div>
  )
}

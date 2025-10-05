import Link from 'next/link'
import { QuickJoinForm } from '../../components/QuickJoinForm'
import { composeBrandingTheme, loadJoinData } from '../../lib/loadJoinData'

type BusinessRow = {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  settings: Record<string, any> | null
}

export default async function JoinBusinessPromotionPage({
  params
}: {
  params: Promise<{ businessId: string; promotionId: string }>
}) {
  const { businessId, promotionId } = await params
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

  let joinData
  try {
    joinData = await loadJoinData(businessId, { focusPromotionId: promotionId })
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
    if ((error as Error).message === 'promotion_not_found') {
      return (
        <div className="p-10 text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Promoción no encontrada</h1>
          <p className="text-sm text-gray-500">La promoción solicitada no existe o no está activa.</p>
        </div>
      )
    }
    throw error
  }

  const { business, loyaltyCard } = joinData
  const focusedPromotion = joinData.focusedPromotion
  if (!focusedPromotion) {
    return (
      <div className="p-10 text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Promoción no encontrada</h1>
        <p className="text-sm text-gray-500">La promoción solicitada no existe o no está activa.</p>
      </div>
    )
  }

  const businessRecord = business as BusinessRow
  const businessSettings = (businessRecord.settings ?? {}) as Record<string, any>
  const cardTitle = typeof businessSettings.card_title === 'string' && businessSettings.card_title.trim().length > 0
    ? businessSettings.card_title.trim()
    : businessRecord.name
  const cardDescription = typeof businessSettings.card_description === 'string' && businessSettings.card_description.trim().length > 0
    ? businessSettings.card_description.trim()
    : businessRecord.description ?? 'Activa tu tarjeta digital y acumula recompensas sin volver a rellenar formularios.'

  const theme = composeBrandingTheme(businessSettings, focusedPromotion.config)
  const headerBackground = theme.background ?? '#f8fafc'
  const headerText = theme.text ?? '#0f172a'
  const headerMuted = theme.textMuted ?? '#475569'
  const heroImage = theme.heroImage

  return (
    <div
      className="mx-auto max-w-3xl space-y-10 px-6 py-10"
      style={{ background: `radial-gradient(circle at top, ${headerBackground} 0%, #ffffff 80%)` }}
    >
      <header className="space-y-4 text-center">
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
          <h1 className="text-3xl font-bold" style={{ color: headerText }}>{cardTitle}</h1>
          <p className="mt-2 text-sm" style={{ color: headerMuted }}>{cardDescription}</p>
        </div>
        {heroImage && (
          <div className="mx-auto max-w-xl overflow-hidden rounded-xl shadow-sm">
            <img src={heroImage} alt="Imagen promocional" className="h-48 w-full object-cover" />
          </div>
        )}
      </header>

      <QuickJoinForm
        businessId={businessId}
        businessName={businessRecord.name}
        promotion={focusedPromotion}
        loyaltyCard={loyaltyCard}
        theme={theme}
      />
    </div>
  )
}
"use client"

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PromotionSelector } from './PromotionSelector'
import { WalletPassCard } from './WalletPassCard'

type Promotion = {
  id: string
  name: string
  promo_type: string
  ends_at?: string | null
}

type JoinSuccessPayload = {
  userId: string
  existingUser: boolean
  profile: {
    name?: string | null
    email?: string | null
    phone?: string | null
  }
  business: {
    id: string
    name: string
    logo_url: string | null
    primary_color: string | null
    secondary_color: string | null
    background_color: string | null
    text_color: string | null
  }
  loyaltyCard: {
    id: string
    name: string | null
    description: string | null
    stamps_required: number | null
    reward_description: string | null
  }
  promotionId: string | null
  customerCard: {
    id: string
    current_stamps: number
    total_rewards_earned: number
    last_stamp_at: string | null
    loyalty_card: any
  }
  walletPass: {
    id: string | null
    qr_token: string | null
    reused: boolean
    pass_type: string
    usage_count: number
    last_used_at: string | null
  }
  downloadUrl: string | null
  metrics: {
    currentStamps: number
    stampsRequired: number
    remainingStamps: number
    totalRewardsEarned: number
    pendingRewards: number
  }
  pendingRewards: Array<{
    id: string
    reward_description: string | null
    reward_type: string
    is_redeemed: boolean | null
    is_claimed: boolean | null
    created_at: string
    redeemed_at: string | null
  }>
}

type JoinResponse =
  | { success: true; data: JoinSuccessPayload }
  | { success: false; error: string; details?: string }

interface QuickJoinFormProps {
  businessId: string
  businessName: string
  promotions: Promotion[]
  loyaltyCard?: {
    name: string | null
    description: string | null
    stamps_required: number | null
    reward_description: string | null
  } | null
  initialPromotionId?: string | null
}

function humanizeError(code: string) {
  switch (code) {
    case 'identifier_required':
      return 'Necesitamos tu email o teléfono para encontrarte.'
    case 'business_not_found':
      return 'No encontramos el negocio, revisa el enlace.'
    case 'no_loyalty_card':
      return 'Este comercio aún no tiene tarjeta configurada.'
    case 'create_user_failed':
      return 'No pudimos crear tu perfil. Inténtalo de nuevo en unos segundos.'
    case 'ensure_failed':
    case 'card_not_created':
      return 'No se pudo generar tu tarjeta. Intenta de nuevo.'
    default:
      return code
  }
}

export function QuickJoinForm({
  businessId,
  businessName,
  promotions,
  loyaltyCard,
  initialPromotionId
}: QuickJoinFormProps) {
  const router = useRouter()
  const [selectedPromotion, setSelectedPromotion] = useState<string | null>(initialPromotionId ?? null)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<JoinSuccessPayload | null>(null)

  const disabled = useMemo(() => {
    return loading
  }, [loading])

  const handlePromotionSelect = useCallback((promoId: string | null) => {
    setSelectedPromotion(promoId)
    setResult(null)
    setError(null)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!email.trim() && !phone.trim()) {
      setError('Necesitas indicar al menos tu email o teléfono')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/join/${businessId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          promotionId: selectedPromotion || undefined
        })
      })

      const json: JoinResponse = await response.json()

      if (!response.ok) {
        if (!json.success && 'error' in json) {
          setError(humanizeError(json.error))
        } else {
          setError('No pudimos completar la solicitud. Inténtalo nuevamente.')
        }
        console.warn('Join error', json)
        return
      }

      if (!json.success && 'error' in json) {
        setError(humanizeError(json.error))
        return
      }

      setResult(json.data)
      router.prefetch(`/join/${businessId}`)
    } catch (err: any) {
      console.error('Join request failed', err)
      setError('No pudimos completar la solicitud. Comprueba tu conexión e inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [
    businessId,
    email,
    phone,
    firstName,
    lastName,
    selectedPromotion,
    router
  ])

  const loyaltyInfo = useMemo(() => {
    if (!loyaltyCard) return null
    const total = loyaltyCard.stamps_required ?? null
    return {
      title: loyaltyCard.name || 'Programa de fidelización',
      description: loyaltyCard.description,
      reward: loyaltyCard.reward_description || 'Acumula sellos para obtener recompensas',
      totalStamps: total
    }
  }, [loyaltyCard])

  return (
    <div className="space-y-6">
      {loyaltyInfo && (
        <div className="border border-dashed border-indigo-300 rounded-lg bg-indigo-50/60 px-4 py-3 text-xs text-indigo-700">
          <p className="font-semibold">{loyaltyInfo.title}</p>
          {loyaltyInfo.description && <p className="mt-1">{loyaltyInfo.description}</p>}
          <p className="mt-2 text-indigo-600">
            {loyaltyInfo.reward}
            {loyaltyInfo.totalStamps ? ` · ${loyaltyInfo.totalStamps} sellos para cada recompensa` : ''}
          </p>
        </div>
      )}

      <PromotionSelector
        promotions={promotions}
        selectedId={selectedPromotion}
        onSelect={handlePromotionSelect}
      />

      <div className="border rounded-lg p-5 bg-white shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Tus datos</h2>
          <p className="text-sm text-gray-500">
            Introduce tu email o teléfono para buscar tu perfil. Si es la primera vez, añade tu nombre para personalizar tu tarjeta.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="customer-email">Email</label>
            <input
              id="customer-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="customer-phone">Teléfono</label>
            <input
              id="customer-phone"
              type="tel"
              placeholder="+34 600 000 000"
              value={phone}
              autoComplete="tel"
              onChange={(event) => setPhone(event.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="customer-first-name">Nombre</label>
            <input
              id="customer-first-name"
              type="text"
              placeholder="María"
              value={firstName}
              autoComplete="given-name"
              onChange={(event) => setFirstName(event.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor="customer-last-name">Apellidos</label>
            <input
              id="customer-last-name"
              type="text"
              placeholder="García"
              value={lastName}
              autoComplete="family-name"
              onChange={(event) => setLastName(event.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              disabled={disabled}
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-gray-500">
            {"Guardaremos tu perfil para que no tengas que volver a rellenar este formulario en otras tiendas."}
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled}
            className="inline-flex items-center justify-center px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium disabled:opacity-60 hover:bg-indigo-700 transition"
          >
            {loading ? 'Generando tarjeta…' : 'Obtener mi tarjeta' }
          </button>
        </div>
      </div>

      {result && (
        <WalletPassCard
          businessName={businessName}
          profileName={result.profile?.name}
          downloadUrl={result.downloadUrl}
          qrToken={result.walletPass.qr_token}
          metrics={result.metrics}
          loyaltyCard={result.customerCard.loyalty_card}
          pendingRewards={result.pendingRewards}
          existingUser={result.existingUser}
        />
      )}
    </div>
  )
}

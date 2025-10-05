"use client"

import { useMemo } from 'react'

type Metrics = {
  currentStamps: number
  stampsRequired: number
  remainingStamps: number
  totalRewardsEarned: number
  pendingRewards: number
}

type LoyaltyCardInfo = {
  id?: string
  name?: string | null
  description?: string | null
  stamps_required?: number | null
  reward_description?: string | null
  businesses?: {
    id: string
    name: string
    logo_url: string | null
    primary_color: string | null
    secondary_color: string | null
    background_color: string | null
    text_color: string | null
  }
}

type PendingReward = {
  id: string
  reward_description: string | null
  reward_type: string
  is_redeemed: boolean | null
  is_claimed: boolean | null
  created_at: string
  redeemed_at: string | null
}

interface WalletPassCardProps {
  businessName: string
  profileName?: string | null
  downloadUrl: string | null
  qrToken: string | null
  metrics: Metrics
  loyaltyCard?: LoyaltyCardInfo | null
  pendingRewards?: PendingReward[]
  existingUser: boolean
}

function formatDate(value: string | null) {
  if (!value) return null
  try {
    return new Date(value).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return null
  }
}

export function WalletPassCard({
  businessName,
  profileName,
  downloadUrl,
  qrToken,
  metrics,
  loyaltyCard,
  pendingRewards,
  existingUser
}: WalletPassCardProps) {
  const progress = useMemo(() => {
    if (!metrics.stampsRequired) return 0
    return Math.min(100, Math.round((metrics.currentStamps / metrics.stampsRequired) * 100))
  }, [metrics.currentStamps, metrics.stampsRequired])

  const rewardMessage = loyaltyCard?.reward_description || 'Sigue acumulando sellos para desbloquear tu recompensa.'

  return (
    <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide opacity-80">Tarjeta de fidelización</p>
            <h3 className="text-lg font-semibold">{businessName}</h3>
            {profileName && <p className="text-xs opacity-80 mt-1">Cliente: {profileName}</p>}
          </div>
          <div className="text-right text-xs">
            <p>{metrics.currentStamps} / {metrics.stampsRequired} sellos</p>
            <p className="opacity-80">Restan {metrics.remainingStamps}</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">{rewardMessage}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-indigo-50 border border-indigo-100 rounded p-3">
            <p className="text-indigo-600 font-semibold">{metrics.currentStamps}</p>
            <p className="text-gray-600">Sellos actuales</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded p-3">
            <p className="text-blue-600 font-semibold">{metrics.remainingStamps}</p>
            <p className="text-gray-600">Sellos para recompensa</p>
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded p-3">
            <p className="text-purple-600 font-semibold">{metrics.totalRewardsEarned}</p>
            <p className="text-gray-600">Recompensas ganadas</p>
          </div>
          <div className="bg-teal-50 border border-teal-100 rounded p-3">
            <p className="text-teal-600 font-semibold">{metrics.pendingRewards}</p>
            <p className="text-gray-600">Recompensas pendientes</p>
          </div>
        </div>

        {pendingRewards && pendingRewards.length > 0 && (
          <div className="border rounded p-3 bg-gray-50 text-xs space-y-2">
            <p className="font-medium text-gray-700">Recompensas por canjear:</p>
            <ul className="space-y-1">
              {pendingRewards.slice(0, 3).map((reward) => {
                const created = formatDate(reward.created_at)
                return (
                  <li key={reward.id} className="flex items-center justify-between gap-2">
                    <span className="text-gray-600 truncate">{reward.reward_description || 'Recompensa disponible'}</span>
                    {created && <span className="text-[10px] text-gray-500">{created}</span>}
                  </li>
                )
              })}
            </ul>
            {pendingRewards.length > 3 && (
              <p className="text-[10px] text-gray-400">y {pendingRewards.length - 3} más…</p>
            )}
          </div>
        )}

        <div className="border rounded p-3 text-xs">
          <p className="font-medium text-gray-700 mb-1">Tu token QR</p>
          {qrToken ? (
            <>
              <p className="text-[10px] break-words font-mono text-gray-600">{qrToken}</p>
              <p className="text-[10px] text-gray-500 mt-1">Muéstralo en la tienda para sumar sellos o canjear recompensas.</p>
            </>
          ) : (
            <p className="text-gray-500">No se pudo generar el token del pass. Inténtalo de nuevo en unos instantes.</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-gray-500">
            {existingUser ? 'Hemos reutilizado tu perfil existente y actualizado el pass.' : 'Hemos creado tu perfil y activado el pass.'}
          </div>
          {downloadUrl && (
            <a
              href={downloadUrl}
              className="inline-flex items-center justify-center px-4 py-2 rounded bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition"
              rel="noopener noreferrer"
              target="_blank"
            >
              Añadir a mi Wallet
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

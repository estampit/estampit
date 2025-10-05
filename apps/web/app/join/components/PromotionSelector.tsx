"use client"

import { useMemo } from 'react'

type Promotion = {
  id: string
  name: string
  promo_type: string
  ends_at?: string | null
}

interface PromotionSelectorProps {
  promotions: Promotion[]
  selectedId?: string | null
  onSelect: (promotionId: string | null) => void
}

function formatDate(value?: string | null) {
  if (!value) return null
  try {
    return new Date(value).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    })
  } catch (e) {
    return null
  }
}

export function PromotionSelector({ promotions, selectedId, onSelect }: PromotionSelectorProps) {
  const sortedPromotions = useMemo(() => {
    return [...promotions].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [promotions])

  if (!sortedPromotions.length) {
    return (
      <div className="text-sm text-gray-500 border rounded p-3 bg-gray-50">
        No hay promociones activas ahora mismo. ¡Sigue acumulando sellos para desbloquear recompensas!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">Selecciona la promoción que quieres activar:</p>
      <div className="grid gap-2">
        {sortedPromotions.map((promo) => {
          const isSelected = selectedId === promo.id
          const ends = formatDate(promo.ends_at)
          return (
            <button
              key={promo.id}
              type="button"
              onClick={() => onSelect(isSelected ? null : promo.id)}
              className={`text-left border rounded px-4 py-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-sm text-gray-900">{promo.name}</p>
                  <p className="text-xs text-gray-500 capitalize">Tipo: {promo.promo_type}</p>
                </div>
                {ends && (
                  <span className="text-xs text-indigo-600 font-medium">Hasta {ends}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

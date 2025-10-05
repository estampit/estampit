"use client"

import { useMemo } from 'react'

type Promotion = {
  id: string
  name: string
  promo_type: string
  ends_at?: string | null
  description?: string | null
  config?: Record<string, any> | null
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
      <div
        className="rounded border p-3 text-sm"
        style={{
          color: 'var(--join-text-muted)',
          backgroundColor: 'var(--join-surface-muted)',
          borderColor: 'var(--join-border)'
        }}
      >
        No hay promociones activas ahora mismo. ¡Sigue acumulando sellos para desbloquear recompensas!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-[color:var(--join-text-muted)]">Selecciona la promoción que quieres activar:</p>
      <div className="grid gap-2">
        {sortedPromotions.map((promo) => {
          const isSelected = selectedId === promo.id
          const ends = formatDate(promo.ends_at)
          return (
            <button
              key={promo.id}
              type="button"
              onClick={() => onSelect(isSelected ? null : promo.id)}
              className="text-left rounded border px-4 py-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--join-primary)] hover:border-[var(--join-primary)]"
              style={{
                borderColor: isSelected ? 'var(--join-primary)' : 'var(--join-border)',
                backgroundColor: isSelected ? 'var(--join-surface-muted)' : 'var(--join-surface)',
                color: 'var(--join-text)'
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[color:var(--join-text)]">{promo.name}</p>
                  {promo.description && (
                    <p className="text-xs leading-5 text-[color:var(--join-text-muted)]">{promo.description}</p>
                  )}
                  <p className="text-xs text-[color:var(--join-text-muted)] capitalize">
                    Tipo: <span className="font-semibold text-[color:var(--join-text)]">{promo.promo_type}</span>
                  </p>
                </div>
                {ends && (
                  <span className="text-xs font-medium text-[color:var(--join-primary)]">Hasta {ends}</span>
                )}
              </div>
              {isSelected && (
                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[color:var(--join-primary)]">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[color:var(--join-primary)]" />
                  Seleccionada
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

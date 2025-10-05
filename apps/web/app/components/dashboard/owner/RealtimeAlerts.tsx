'use client'

import { BellRing, X } from 'lucide-react'
import type { LiveAlert } from '@/app/components/OwnerDashboardClient'

interface RealtimeAlertsProps {
  alerts: LiveAlert[]
  onDismiss(id: string): void
}

export function RealtimeAlerts({ alerts, onDismiss }: RealtimeAlertsProps) {
  if (!alerts.length) return null

  return (
    <div className="mb-6 space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 px-4 py-3 shadow-sm"
        >
          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <BellRing className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">{alert.message}</p>
            <p className="text-xs text-blue-700/70">
              {formatAlertType(alert.type)} · {formatRelativeTime(alert.occurredAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(alert.id)}
            className="rounded-full p-1 text-blue-600 transition hover:bg-blue-100"
            aria-label="Descartar alerta"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

function formatAlertType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const diff = Date.now() - date.getTime()
  const minutes = Math.round(diff / (1000 * 60))
  if (minutes < 1) return 'hace instantes'
  if (minutes === 1) return 'hace 1 minuto'
  if (minutes < 60) return `hace ${minutes} minutos`
  const hours = Math.round(minutes / 60)
  if (hours === 1) return 'hace 1 hora'
  if (hours < 24) return `hace ${hours} horas`
  return date.toLocaleString()
}

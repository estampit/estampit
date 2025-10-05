'use client'

import { useEffect } from 'react'
import { Award, Clock3, Mail, Sparkles, X } from 'lucide-react'
import type {
  CustomerActivityEntry,
  CustomerSummary,
} from '@/app/components/OwnerDashboardClient'

interface CustomerDetailDrawerProps {
  open: boolean
  customer: CustomerSummary | null
  activity: CustomerActivityEntry[]
  loading: boolean
  onClose(): void
}

export function CustomerDetailDrawer({ open, customer, activity, loading, onClose }: CustomerDetailDrawerProps) {
  useEffect(() => {
    if (!open) return
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open || !customer) {
    return null
  }

  const displayName = customer.customer_name || customer.customer_email || 'Cliente sin nombre'
  const email = customer.customer_email || '—'

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label="Cerrar panel"
        className="absolute inset-0 cursor-pointer bg-black/30 backdrop-blur-sm focus:outline-none"
        onClick={onClose}
      />
      <aside className="relative ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Cliente</p>
            <h2 className="mt-2 text-xl font-semibold text-gray-900">{displayName}</h2>
            {customer.customer_email && (
              <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                <Mail className="h-3 w-3" />
                {email}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar panel"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid grid-cols-2 gap-4 border-b border-gray-200 px-6 py-4 text-sm">
          <Metric label="Sellos actuales" value={customer.current_stamps} />
          <Metric label="Recompensas" value={customer.total_rewards} icon={<Award className="h-3.5 w-3.5" />} />
          <Metric label="Última visita" value={formatDetailedDate(customer.last_stamp_at)} icon={<Clock3 className="h-3.5 w-3.5" />} />
          {typeof customer.total_spent === 'number' && (
            <Metric label="Gasto estimado" value={`€${customer.total_spent.toFixed(2)}`} icon={<Sparkles className="h-3.5 w-3.5" />} />
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Actividad reciente</h3>
          <div className="mt-3 space-y-3">
            {loading && <p className="text-sm text-gray-500">Cargando actividad…</p>}
            {!loading && activity.length === 0 && (
              <p className="text-sm text-gray-500">Aún no registramos eventos para este cliente.</p>
            )}
            {!loading &&
              activity.map((entry) => {
                const isPurchase = entry.type === 'purchase'
                return (
                  <div key={`${entry.id}-${entry.occurredAt}`} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                            isPurchase ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {isPurchase ? <Sparkles className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{entry.label}</p>
                          {entry.description && <p className="text-xs text-gray-500">{entry.description}</p>}
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400">{formatTimelineTimestamp(entry.occurredAt)}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                      {typeof entry.amount === 'number' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                          <Sparkles className="h-3 w-3" /> €{entry.amount.toFixed(2)} {entry.currency || ''}
                        </span>
                      )}
                      {typeof entry.stamps === 'number' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                          <Award className="h-3 w-3" /> {entry.stamps} sellos
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </aside>
    </div>
  )
}

function Metric({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
      <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
        {icon} {label}
      </span>
      <span className="text-base font-semibold text-gray-900">{value}</span>
    </div>
  )
}

function formatDetailedDate(iso: string | null): string {
  if (!iso) return 'Sin actividad'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Sin actividad'
  return `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

function formatTimelineTimestamp(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const datePart = date.toLocaleDateString()
  const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${datePart} · ${timePart}`
}

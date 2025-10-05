'use client'

import { useMemo, type ReactNode } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ArrowUpRight, Sparkles, Users, TrendingUp, Wand2 } from 'lucide-react'
import { UniversalScanner } from '@/app/components/UniversalScanner'
import { RedeemWalletPass } from '@/app/components/RedeemWalletPass'
import { EventsFeedClient, type BusinessEventRow } from '@/app/components/EventsFeedClient'
import type {
  BusinessSummary,
  DashboardMetrics,
  PromotionUsage,
  TrendDatum,
  CustomerSegment,
  TabId,
} from '@/app/components/OwnerDashboardClient'

interface OverviewSectionProps {
  business: BusinessSummary
  metrics: DashboardMetrics | null
  promoUsage: PromotionUsage[]
  trendData: TrendDatum[]
  customerAnalytics: any | null
  customerSegments: CustomerSegment[]
  businessId: string
  events: BusinessEventRow[]
  onNavigateTab(tab: TabId): void
}

interface SuggestedTask {
  id: string
  title: string
  description: string
  actionLabel?: string
  actionTab?: TabId
}

type HeaderMetricKey = 'customers' | 'stampsToday' | 'stampsWeek' | 'redemptionsWeek'

const metricCards: Array<{ id: HeaderMetricKey; label: string; icon: ReactNode }> = [
  { id: 'customers', label: 'Clientes totales', icon: <Users className="h-4 w-4 text-primary-500" /> },
  { id: 'stampsToday', label: 'Sellos hoy', icon: <Sparkles className="h-4 w-4 text-success-500" /> },
  { id: 'stampsWeek', label: 'Sellos (7d)', icon: <TrendingUp className="h-4 w-4 text-primary-500" /> },
  { id: 'redemptionsWeek', label: 'Canjes (7d)', icon: <Wand2 className="h-4 w-4 text-danger-500" /> },
]

const quickActions: Array<{ id: string; title: string; description: string; tab: TabId }> = [
  {
    id: 'new-promo',
    title: 'Crear promoción',
    description: 'Lanza un beneficio en minutos con plantillas preaprobadas.',
    tab: 'promotions',
  },
  {
    id: 'segment-clients',
    title: 'Explorar clientes',
    description: 'Segmenta por frecuencia, ticket medio o última visita.',
    tab: 'customers',
  },
  {
    id: 'refresh-branding',
    title: 'Actualizar apariencia',
    description: 'Ajusta colores, logo y copia del wallet pass.',
    tab: 'appearance',
  },
]

export function OverviewSection({
  business,
  metrics,
  promoUsage,
  trendData,
  customerAnalytics,
  customerSegments,
  businessId,
  onNavigateTab,
  events,
}: OverviewSectionProps) {
  const totalCustomers = business.total_customers ?? customerAnalytics?.summary?.total_active ?? 0

  const suggestions = useMemo<SuggestedTask[]>(() => {
    const tasks: SuggestedTask[] = []
    const stampsToday = metrics?.stampsToday ?? 0
    const activePromos = business.active_promotions ?? 0
    const riskSegment = customerSegments.find((segment) =>
      segment.segment?.toLowerCase().includes('riesgo')
    )

    if (stampsToday < 5) {
      tasks.push({
        id: 'boost-today',
        title: 'Impulsa los sellos de hoy',
        description: 'Activa un recordatorio flash o ofrece un sello doble en horas valle.',
        actionLabel: 'Configurar promo express',
        actionTab: 'promotions',
      })
    }

    if (activePromos === 0) {
      tasks.push({
        id: 'launch-first-promo',
        title: 'Lanza tu primera promoción',
        description: 'Las campañas automatizadas multiplican los canjes hasta 3x.',
        actionLabel: 'Crear promoción',
        actionTab: 'promotions',
      })
    }

    if (riskSegment && riskSegment.customers > 0) {
      tasks.push({
        id: 'recover-risk',
        title: `${riskSegment.customers} clientes en riesgo`,
        description: 'Envía un incentivo personalizado antes de que abandonen.',
        actionLabel: 'Ver segmento',
        actionTab: 'customers',
      })
    }

    if (!tasks.length) {
      tasks.push({
        id: 'review-metrics',
        title: 'Todo en orden',
        description: 'Revisa tus métricas y prepara la próxima campaña semanal.',
      })
    }

    return tasks
  }, [metrics, business, customerSegments])

  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
        <div className="relative overflow-hidden rounded-[32px] bg-neutral-900 text-white">
          <div className="absolute inset-0 opacity-80 mystamp-gradient" aria-hidden />
          <div className="relative flex flex-col gap-8 p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">Panel del negocio</p>
                <h2 className="mt-3 font-display text-3xl font-semibold leading-tight">
                  {business.name}
                </h2>
                <p className="mt-3 max-w-xl text-sm text-white/70">
                  Consulta el pulso diario, detecta segmentos clave y acciona campañas sin salir del panel.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('promotions')}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-900 shadow-lg shadow-white/10 transition hover:-translate-y-0.5"
              >
                Crear campaña rápida
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metricCards.map((metric) => {
                const value = metric.id === 'customers'
                  ? totalCustomers
                  : metrics?.[metric.id] ?? 0

                return (
                  <div
                    key={metric.id}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
                  >
                    <div className="flex items-center justify-between">
                      <div className="rounded-full bg-white/10 p-2 text-white">{metric.icon}</div>
                      <span className="text-xs uppercase tracking-wide text-white/60">{metric.label}</span>
                    </div>
                    <p className="mt-4 text-2xl font-semibold">{value}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">Acciones rápidas</h3>
            <div className="mt-4 space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onNavigateTab(action.tab)}
                  className="w-full rounded-2xl border border-neutral-200/60 px-4 py-3 text-left transition hover:border-primary-200 hover:bg-primary-50/40"
                >
                  <p className="text-sm font-semibold text-neutral-900">{action.title}</p>
                  <p className="text-xs text-neutral-500">{action.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">Tareas recomendadas</h3>
            <ul className="mt-4 space-y-3">
              {suggestions.map((task) => (
                <li key={task.id} className="rounded-2xl border border-neutral-200/70 p-4">
                  <p className="text-sm font-semibold text-neutral-900">{task.title}</p>
                  <p className="mt-1 text-xs text-neutral-500">{task.description}</p>
                  {task.actionLabel && task.actionTab && (
                    <button
                      onClick={() => onNavigateTab(task.actionTab!)}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                    >
                      {task.actionLabel}
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Clientes activos</p>
          <p className="mt-4 text-2xl font-semibold text-neutral-900">{totalCustomers}</p>
          <p className="mt-2 text-sm text-neutral-500">
            {customerAnalytics?.summary?.new_customers ?? 0} nuevos clientes en los últimos 30 días.
          </p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Sellos promedio</p>
          <p className="mt-4 text-2xl font-semibold text-neutral-900">
            {customerAnalytics?.summary?.avg_stamps_per_active
              ? Number(customerAnalytics.summary.avg_stamps_per_active).toFixed(1)
              : '—'}
          </p>
          <p className="mt-2 text-sm text-neutral-500">Promedio por cliente activo en 30 días.</p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Promociones activas</p>
          <p className="mt-4 text-2xl font-semibold text-neutral-900">{business.active_promotions ?? 0}</p>
          <p className="mt-2 text-sm text-neutral-500">Campañas en curso ahora mismo.</p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Recompensas</p>
          <p className="mt-4 text-2xl font-semibold text-neutral-900">{business.total_rewards ?? 0}</p>
          <p className="mt-2 text-sm text-neutral-500">Canjes acumulados desde tu lanzamiento.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">Uso de promociones (Top 8)</h3>
            <span className="text-xs text-neutral-500">Actualizado cada minuto</span>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={promoUsage.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} height={50} angle={-20} textAnchor="end" />
                <YAxis allowDecimals={false} width={32} tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ fill: 'rgba(59,130,246,0.08)' }} />
                <Bar dataKey="usage_count" fill="url(#promoBarGradient)" radius={[8, 8, 4, 4]} />
                <defs>
                  <linearGradient id="promoBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
            {promoUsage.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-sm text-neutral-500">
                Aún no hay datos de uso. Lanza una promoción para empezar a medir.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">Sellos vs Canjes (14 días)</h3>
            <span className="text-xs text-neutral-500">Tendencia reciente</span>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} width={32} tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ stroke: '#94a3b8' }} />
                <Line type="monotone" dataKey="stamps" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="redemptions" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            {trendData.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-sm text-neutral-500">
                Recolecta sellos y recompensas para visualizar la evolución.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">Segmentos clave</h3>
            <button
              onClick={() => onNavigateTab('customers')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              Ver clientes
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {customerSegments.length > 0 ? (
              customerSegments.slice(0, 6).map((segment, index) => (
                <div
                  key={`${segment.segment}-${index}`}
                  className="rounded-2xl border border-neutral-200/80 bg-neutral-50 p-4"
                >
                  <p className="text-sm font-semibold text-neutral-900">{segment.segment}</p>
                  <p className="mt-2 text-2xl font-semibold text-neutral-900">{segment.customers}</p>
                  <p className="text-xs text-neutral-500">clientes · {segment.avg_stamps ?? 0} sellos promedio</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-500">
                Aún no tenemos segmentos suficientes. Obtén más actividad para ver recomendaciones.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-neutral-900">Herramientas rápidas</h3>
            <div className="mt-4 space-y-4">
              <UniversalScanner businessId={businessId} />
              <RedeemWalletPass businessId={businessId} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
          <h3 className="text-base font-semibold text-neutral-900">Actividad reciente</h3>
          <span className="text-xs text-neutral-500">Eventos en tiempo real del equipo</span>
        </div>
        <div className="p-6">
          <EventsFeedClient businessId={businessId} initial={events} />
        </div>
      </div>
    </section>
  )
}

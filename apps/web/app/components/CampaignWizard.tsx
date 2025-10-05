'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, ChevronRight, Sparkles, Target, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { createPromotion } from '@/actions/promotions'

type WizardStep = 0 | 1 | 2 | 3

type PromotionType =
  | 'extra_stamp'
  | 'multiplier'
  | 'reward_boost'
  | 'birthday'
  | 'happy_hour'
  | 'custom'

type SegmentOption = 'all' | 'loyal' | 'at-risk' | 'inactive' | 'new'

type ChannelOption = 'email' | 'sms' | 'wallet_push'

interface CampaignWizardProps {
  businessId: string
  loyaltyCardId?: string
}

interface WizardState {
  type: PromotionType | null
  name: string
  summary: string
  targetSegments: SegmentOption[]
  channels: ChannelOption[]
  stampsRequired: number
  rewardDescription: string
  productName: string
  priority: number
  startsAt: string
  endsAt: string
}

const typeOptions: Array<{
  id: PromotionType
  title: string
  description: string
  badge: string
  defaultName: string
  defaultReward?: string
}> = [
  {
    id: 'extra_stamp',
    title: 'Sello extra',
    description: 'Regala un sello adicional a los clientes que completen una compra clave.',
    badge: '+1 sello',
    defaultName: 'Boost de sellos',
  },
  {
    id: 'multiplier',
    title: 'Multiplicador',
    description: 'Duplica los sellos durante una franja horaria o campaña especial.',
    badge: 'x2',
    defaultName: 'Multiplicador express',
  },
  {
    id: 'reward_boost',
    title: 'Recompensa especial',
    description: 'Ofrece un premio personalizado al completar los sellos necesarios.',
    badge: 'Reward',
    defaultName: 'Campaña VIP',
    defaultReward: 'Recompensa exclusiva',
  },
  {
    id: 'birthday',
    title: 'Cumpleaños',
    description: 'Celebra a tus clientes con un regalo automático en su cumpleaños.',
    badge: '🎂',
    defaultName: 'Cumpleaños feliz',
    defaultReward: 'Detalle de cumpleaños',
  },
  {
    id: 'happy_hour',
    title: 'Happy Hour',
    description: 'Activa promociones en horarios valle para dinamizar el flujo.',
    badge: '⌛',
    defaultName: 'Happy hour',
    defaultReward: 'Descuento especial',
  },
  {
    id: 'custom',
    title: 'Personalizada',
    description: 'Diseña tu propia campaña con reglas a medida.',
    badge: '✨',
    defaultName: 'Campaña personalizada',
  },
]

const segmentOptions: Array<{
  id: SegmentOption
  title: string
  description: string
}> = [
  { id: 'all', title: 'Todos los clientes', description: 'Campaña abierta para todo tu público.' },
  { id: 'loyal', title: 'Clientes leales', description: 'Clientes con ≥8 sellos acumulados.' },
  { id: 'at-risk', title: 'En riesgo', description: 'Clientes sin visitas en 30 días.' },
  { id: 'inactive', title: 'Inactivos', description: 'Clientes inactivos desde hace más de 60 días.' },
  { id: 'new', title: 'Nuevos', description: 'Clientes registrados en las últimas 2 semanas.' },
]

const channelOptions: Array<{
  id: ChannelOption
  title: string
  description: string
}> = [
  { id: 'email', title: 'Email', description: 'Mensaje automático vía correo electrónico.' },
  { id: 'sms', title: 'SMS', description: 'Impacto inmediato a móviles.' },
  { id: 'wallet_push', title: 'Wallet push', description: 'Notificación en Apple / Google Wallet.' },
]

const initialState: WizardState = {
  type: null,
  name: '',
  summary: '',
  targetSegments: ['all'],
  channels: ['email'],
  stampsRequired: 10,
  rewardDescription: '',
  productName: '',
  priority: 100,
  startsAt: '',
  endsAt: '',
}

export function CampaignWizard({ businessId, loyaltyCardId }: CampaignWizardProps) {
  const [stepIndex, setStepIndex] = useState<WizardStep>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [state, setState] = useState<WizardState>(initialState)

  const canContinue = useMemo(() => {
    switch (stepIndex) {
      case 0:
        return state.type !== null
      case 1:
        return state.targetSegments.length > 0
      case 2:
        if (!state.name.trim()) return false
        if (['reward_boost', 'birthday', 'happy_hour', 'custom'].includes(state.type ?? '')) {
          return Boolean(state.rewardDescription.trim())
        }
        return true
      case 3:
        return !isSubmitting
      default:
        return false
    }
  }, [stepIndex, state, isSubmitting])

  const isLastStep = stepIndex === 3

  function nextStep() {
    if (!canContinue) {
      toast.error('Completa los campos obligatorios para continuar.')
      return
    }
    setStepIndex((prev) => {
      const next = Math.min(3, prev + 1) as WizardStep
      return next
    })
  }

  function prevStep() {
    setStepIndex((prev) => {
      const next = Math.max(0, prev - 1) as WizardStep
      return next
    })
  }

  async function handleSubmit() {
    if (!state.type) {
      toast.error('Selecciona un tipo de campaña')
      return
    }
    if (!state.name.trim()) {
      toast.error('Define un nombre para la campaña')
      return
    }

    const config: Record<string, any> = {
      target_segments: state.targetSegments,
      channels: state.channels,
      summary: state.summary,
      stamps_required: state.stampsRequired,
    }

    switch (state.type) {
      case 'extra_stamp':
        config.extra_stamps = 1
        break
      case 'multiplier':
        config.multiplier = 2
        break
      case 'reward_boost':
      case 'birthday':
      case 'happy_hour':
      case 'custom':
        config.reward_description = state.rewardDescription
        if (state.productName) config.product_name = state.productName
        break
      default:
        break
    }

    setIsSubmitting(true)
    try {
      const result = await createPromotion({
        businessId,
        loyaltyCardId,
        name: state.name.trim(),
        promoType: state.type,
        priority: state.priority,
        startsAt: state.startsAt || null,
        endsAt: state.endsAt || null,
        config,
      })

      if (!result.success) {
        toast.error(result.error || 'No se pudo crear la campaña')
        return
      }

      toast.success('Campaña creada correctamente')
      setState(initialState)
      setStepIndex(0)
    } catch (error) {
      console.error('Error creating promotion', error)
      toast.error('Ocurrió un error al crear la campaña')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-2 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-gray-400">
          <Sparkles className="h-4 w-4" />
          Asistente de campañas
        </div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Lanza una campaña en minutos</h2>
          <span className="text-xs text-gray-500">Paso {stepIndex + 1} de 4</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {['Tipo', 'Segmento', 'Mensaje', 'Revisión'].map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  index <= stepIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </span>
              <span className={`text-sm ${index === stepIndex ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                {label}
              </span>
              {index < 3 && <ChevronRight className="h-4 w-4 text-gray-300" />}
            </div>
          ))}
        </div>
      </header>

      <div className="mt-6">
        {stepIndex === 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {typeOptions.map((option) => {
              const selected = state.type === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      type: option.id,
                      name: prev.name || option.defaultName,
                      rewardDescription: prev.rewardDescription || option.defaultReward || '',
                    }))
                  }
                  className={`rounded-2xl border p-4 text-left transition ${
                    selected
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{option.title}</p>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                      {option.badge}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{option.description}</p>
                  {selected && (
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-blue-600/10 px-3 py-1 text-[11px] text-blue-700">
                      <CheckCircle2 className="h-3 w-3" /> Seleccionado
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {stepIndex === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Elige a quién impactará esta campaña.</p>
            <div className="grid gap-3 md:grid-cols-2">
              {segmentOptions.map((segment) => {
                const selected = state.targetSegments.includes(segment.id)
                return (
                  <button
                    key={segment.id}
                    type="button"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        targetSegments: selected
                          ? prev.targetSegments.filter((item) => item !== segment.id)
                          : [...prev.targetSegments, segment.id],
                      }))
                    }
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900">{segment.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{segment.description}</p>
                  </button>
                )
              })}
            </div>
            {state.targetSegments.length === 0 && (
              <p className="text-xs text-red-500">Selecciona al menos un segmento.</p>
            )}
          </div>
        )}

        {stepIndex === 2 && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Nombre de la campaña
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={state.name}
                  onChange={(e) => setState((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. Multiplicador brunch"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Sellos necesarios
                </label>
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={state.stampsRequired}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, stampsRequired: Number(e.target.value) || 1 }))
                  }
                />
              </div>
            </div>

            {['reward_boost', 'birthday', 'happy_hour', 'custom'].includes(state.type ?? '') && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Descripción de la recompensa
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    value={state.rewardDescription}
                    onChange={(e) => setState((prev) => ({ ...prev, rewardDescription: e.target.value }))}
                    placeholder="Ej. Café gratis o 50% descuento"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Producto específico (opcional)
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    value={state.productName}
                    onChange={(e) => setState((prev) => ({ ...prev, productName: e.target.value }))}
                    placeholder="Ej. Capuccino doble"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Mensaje o nota interna
              </label>
              <textarea
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                rows={3}
                value={state.summary}
                onChange={(e) => setState((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="Describe el mensaje para clientes o tu equipo."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={state.startsAt}
                  onChange={(e) => setState((prev) => ({ ...prev, startsAt: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Fecha de fin (opcional)
                </label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={state.endsAt}
                  onChange={(e) => setState((prev) => ({ ...prev, endsAt: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Prioridad
                </label>
                <input
                  type="number"
                  min={1}
                  max={999}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={state.priority}
                  onChange={(e) => setState((prev) => ({ ...prev, priority: Number(e.target.value) || 1 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Canales</p>
              <div className="flex flex-wrap gap-2">
                {channelOptions.map((channel) => {
                  const active = state.channels.includes(channel.id)
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          channels: active
                            ? prev.channels.filter((item) => item !== channel.id)
                            : [...prev.channels, channel.id],
                        }))
                      }
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        active
                          ? 'border-blue-500 bg-blue-100 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-blue-200'
                      }`}
                    >
                      {channel.title}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {stepIndex === 3 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Resumen</h3>
              <dl className="mt-3 space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-gray-500">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Tipo
                  </dt>
                  <dd className="font-semibold text-gray-900">
                    {typeOptions.find((option) => option.id === state.type)?.title ?? '—'}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-gray-500">
                    <Users className="h-4 w-4 text-blue-500" />
                    Segmentos
                  </dt>
                  <dd className="font-semibold text-gray-900">
                    {state.targetSegments.map((segment) => segmentOptions.find((opt) => opt.id === segment)?.title ?? segment).join(', ')}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-gray-500">
                    <CalendarDays className="h-4 w-4 text-green-500" />
                    Calendario
                  </dt>
                  <dd className="text-right text-gray-900">
                    {state.startsAt ? new Date(state.startsAt).toLocaleDateString() : 'Inicio inmediato'}
                    {state.endsAt && ` → ${new Date(state.endsAt).toLocaleDateString()}`}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-gray-500">
                    <Target className="h-4 w-4 text-purple-500" />
                    Mensaje
                  </dt>
                  <dd className="mt-1 whitespace-pre-line text-gray-900">{state.summary || 'Sin mensaje definido.'}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={prevStep}
          disabled={stepIndex === 0 || isSubmitting}
          className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-400 disabled:opacity-40"
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={isLastStep ? handleSubmit : nextStep}
          disabled={!canContinue || isSubmitting}
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-700 disabled:opacity-60"
        >
          {isLastStep ? 'Lanzar campaña' : 'Siguiente'}
          {!isLastStep && <ChevronRight className="h-4 w-4" />}
        </button>
      </footer>
    </div>
  )
}

import * as LucideIcons from 'lucide-react'
import clsx from 'clsx'
import { SectionHeading, SectionBadge, PrimaryButton } from './primitives'
import type {
  FeatureHighlight,
  AnalyticsCallout,
  AutomationStep,
} from '../lib/data'

interface FeatureStorySectionProps {
  highlights: FeatureHighlight[]
  callouts: AnalyticsCallout[]
  steps: AutomationStep[]
}

const positionClasses: Record<AnalyticsCallout['position'], string> = {
  'top-left': 'top-8 left-8',
  'top-right': 'top-8 right-8',
  'bottom-left': 'bottom-8 left-8',
  'bottom-right': 'bottom-8 right-8',
}

function IconFromName({ icon }: { icon: string }) {
  const IconComponent = (LucideIcons as Record<string, any>)[icon] ?? LucideIcons.Sparkles
  return <IconComponent className="h-6 w-6 text-primary-500" />
}

export function FeatureStorySection({ highlights, callouts, steps }: FeatureStorySectionProps) {
  return (
    <section id="features" className="relative overflow-hidden bg-white py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_50%)]" aria-hidden />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-20 px-5 md:px-8">
        <div className="space-y-12">
          <SectionHeading
            eyebrow="Sellos digitales sin fricción"
            title="Configura tu programa de fidelización en minutos"
            description="Cada punto de contacto está diseñado para que tus clientes acumulen sellos sin esfuerzo, tanto en el local como online."
            align="left"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="inline-flex items-center justify-center rounded-2xl bg-primary-50 p-3 text-primary-600">
                  <IconFromName icon={item.icon} />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-neutral-900">{item.title}</h3>
                <p className="mt-3 text-sm text-neutral-600">{item.description}</p>
                <div className="absolute -right-12 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-primary-100/40 blur-3xl transition group-hover:scale-125" aria-hidden />
              </div>
            ))}
          </div>
        </div>

        <div className="grid items-center gap-12 rounded-[36px] border border-neutral-200 bg-neutral-50/70 p-10 shadow-inner md:grid-cols-[minmax(0,0.65fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <SectionBadge>Dashboard inteligente</SectionBadge>
            <h3 className="text-3xl font-semibold text-neutral-900">Datos accionables sin hojas de cálculo</h3>
            <p className="text-sm text-neutral-600 md:text-base">
              Visualiza qué campañas generan más visitas, quiénes están a punto de abandonar y cómo evoluciona el ticket medio.
              Tus métricas se actualizan en tiempo real gracias a la integración nativa con Supabase.
            </p>
            <ul className="space-y-4">
              {callouts.map((callout) => (
                <li key={callout.id} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-600">
                    {callout.position.includes('top') ? '▲' : '▼'}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{callout.title}</p>
                    <p className="text-sm text-neutral-600">{callout.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-[32px] border border-neutral-200 bg-white p-8 shadow-xl">
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600" aria-hidden />
            <div className="relative mt-10 rounded-2xl border border-neutral-200 bg-neutral-900/95 p-6 text-white shadow-[0_30px_80px_-40px_rgba(8,9,31,0.6)]">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Sellos hoy</span>
                <span>324</span>
              </div>
              <div className="mt-6 flex items-end justify-between text-white">
                <div>
                  <p className="text-4xl font-semibold">+18%</p>
                  <p className="text-xs text-success-300">vs semana pasada</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(8)].map((_, index) => (
                    <span
                      key={index}
                      className={clsx(
                        'h-16 w-2 rounded-full bg-white/20',
                        index > 4 && 'bg-white/40'
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-8 grid gap-4 text-xs text-white/70 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p>Clientes en riesgo</p>
                  <p className="mt-2 text-lg font-semibold text-white">24</p>
                  <p className="text-[11px] text-white/60">Activa campaña de recuperación</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p>ROI estimado</p>
                  <p className="mt-2 text-lg font-semibold text-white">6.4x</p>
                  <p className="text-[11px] text-white/60">Comparado con tarjetas físicas</p>
                </div>
              </div>
              {callouts.map((callout) => (
                <div
                  key={`${callout.id}-badge`}
                  className={clsx(
                    'absolute hidden rounded-full bg-white/90 px-4 py-2 text-[11px] font-medium text-neutral-700 shadow-lg lg:flex',
                    positionClasses[callout.position]
                  )}
                >
                  {callout.title}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[36px] border border-neutral-200 bg-white/90 p-10 shadow-sm">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <SectionHeading
              eyebrow="Automatiza promociones"
              title="Campañas en piloto automático"
              description="Define el disparador, escoge el segmento y deja que la plataforma envíe recompensas personalizadas en el canal ideal."
              align="left"
              className="max-w-xl"
            />
            <PrimaryButton href="/demo">Ver flujo completo</PrimaryButton>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.id} className="relative rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white shadow-glow">
                  {step.step}
                </div>
                <h4 className="mt-4 text-lg font-semibold text-neutral-900">{step.title}</h4>
                <p className="mt-2 text-sm text-neutral-600">{step.description}</p>
                <p className="mt-3 text-xs text-neutral-500">{step.detail}</p>
                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary-100/40 blur-xl" aria-hidden />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

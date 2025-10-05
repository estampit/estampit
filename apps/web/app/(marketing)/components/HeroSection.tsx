import { SectionBadge, PrimaryButton, SecondaryButton, MetricPill } from './primitives'
import type { LandingStat } from '../lib/data'

interface HeroSectionProps {
  stats: LandingStat[]
  trustLogos?: string[]
}

export function HeroSection({ stats, trustLogos = [] }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-neutral-900 text-white">
      <div className="absolute inset-0 mystamp-gradient opacity-70" aria-hidden />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-14 px-5 py-20 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:items-center md:px-8 md:py-28">
        <div className="space-y-8">
          <SectionBadge className="bg-white/10 text-white">Loyalty CRM para retail & hospitality</SectionBadge>
          <div className="space-y-6">
            <h1 className="font-display text-4xl leading-tight tracking-tight md:text-5xl">
              Convierte cada visita en un cliente fiel con la plataforma de sellos digitales más completa.
            </h1>
            <p className="text-base text-white/70 md:text-lg">
              Automatiza sellos, promociones y campañas personalizadas en minutos. Descubre qué clientes vuelven, quiénes están en riesgo y cómo recompensarlos antes de que se vayan con la competencia.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <PrimaryButton href="/register" className="justify-center sm:justify-start">
              Comenzar prueba gratuita de 14 días
            </PrimaryButton>
            <SecondaryButton href="/demo" className="justify-center sm:justify-start">
              Ver demo interactiva
            </SecondaryButton>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.slice(0, 3).map((stat) => (
              <MetricPill
                key={stat.metric}
                stat={stat.value}
                label={stat.label}
                trend={stat.trend ? `+${stat.trend}% ${stat.trendLabel ?? ''}` : stat.trendLabel}
              />
            ))}
          </div>
          {trustLogos.length > 0 && (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Confiado por equipos en</p>
              <div className="mt-4 flex flex-wrap items-center gap-6 opacity-80">
                {trustLogos.map((logo) => (
                  <span key={logo} className="text-sm font-medium text-white/60">
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_-40px_rgba(8,9,31,0.8)] backdrop-blur">
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Panel diario</span>
                <span>Hoy</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-white/60">Sellos hoy</p>
                  <p className="mt-2 text-2xl font-semibold text-white">324</p>
                  <p className="text-xs text-success-300">▲ 18% vs ayer</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-white/60">Canjes semana</p>
                  <p className="mt-2 text-2xl font-semibold text-white">81</p>
                  <p className="text-xs text-success-300">▲ 12% vs semana pasada</p>
                </div>
                <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-white/60">
                    <span>Clientes en riesgo</span>
                    <span className="rounded-full bg-danger-400/20 px-2 py-0.5 text-xs text-danger-300">Alerta</span>
                  </div>
                  <p className="mt-3 text-lg font-semibold text-white">24 clientes</p>
                  <p className="text-xs text-white/50">Programa una campaña para recuperarlos con un beneficio personalizado.</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <h3 className="text-white">Escenario de ROI</h3>
              <p className="mt-2 text-xs text-white/60">
                Con 800 clientes activos y un ticket medio de 12€, recuperarías la inversión mensual en <span className="font-semibold text-success-200">12 días</span>.
              </p>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-white/50">Impacto estimado</p>
                  <p className="text-lg font-semibold text-white">+32% visitas repetidas</p>
                </div>
                <div className="rounded-full bg-primary-500 px-4 py-2 text-xs font-semibold text-white shadow-glow">
                  Basado en datos reales
                </div>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -inset-12 -z-10 rounded-[48px] bg-primary-500/40 blur-3xl" aria-hidden />
        </div>
      </div>
    </section>
  )
}

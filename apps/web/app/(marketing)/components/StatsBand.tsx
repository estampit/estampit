import type { LandingStat } from '../lib/data'

export function StatsBand({ stats }: { stats: LandingStat[] }) {
  if (!stats.length) return null

  return (
    <section className="border-y border-neutral-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-8 md:px-8">
        {stats.map((stat) => (
          <div key={stat.metric} className="min-w-[160px] flex-1">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">{stat.label}</p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-neutral-900">{stat.value}</span>
              {stat.trend && (
                <span className="text-xs font-medium text-success-600">+{stat.trend}%</span>
              )}
            </div>
            {stat.trendLabel && <p className="text-xs text-neutral-500">{stat.trendLabel}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

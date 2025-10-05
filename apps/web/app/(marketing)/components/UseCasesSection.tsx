'use client'

import { useMemo, useState } from 'react'
import clsx from 'clsx'
import type { UseCaseContent } from '../lib/data'
import { SectionHeading, SecondaryButton } from './primitives'

export function UseCasesSection({ useCases }: { useCases: UseCaseContent[] }) {
  const sortedCases = useMemo(() => useCases, [useCases])
  const [activeId, setActiveId] = useState(sortedCases[0]?.id)

  const activeCase = useMemo(
    () => sortedCases.find((item) => item.id === activeId) ?? sortedCases[0],
    [sortedCases, activeId]
  )

  if (!activeCase) return null

  return (
    <section id="use-cases" className="bg-surface-subtle py-20">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Casos de uso"
          title="Historias de crecimiento real para cada vertical"
          description="Inspírate en cómo cafeterías, restaurantes, salones de belleza y gimnasios usan MYSTAMP para aumentar la retención y el ticket medio."
        />
        <div className="mt-12 grid gap-10 md:grid-cols-[320px_minmax(0,1fr)] md:gap-14">
          <div className="flex flex-col gap-3">
            {sortedCases.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={clsx(
                  'rounded-2xl border px-5 py-4 text-left transition',
                  item.id === activeId
                    ? 'border-primary-200 bg-white shadow-card'
                    : 'border-transparent bg-white/40 hover:border-neutral-200'
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{item.vertical}</p>
                <p className="mt-2 text-base font-semibold text-neutral-900">{item.headline}</p>
                <p className="mt-1 text-sm text-neutral-600">{item.statHighlight}</p>
              </button>
            ))}
          </div>
          <div className="relative overflow-hidden rounded-[32px] border border-neutral-200 bg-white p-8 shadow-lg">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary-100" aria-hidden />
            <div className="relative space-y-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary-500">{activeCase.vertical}</p>
              <h3 className="text-2xl font-semibold text-neutral-900">{activeCase.headline}</h3>
              <p className="text-neutral-600">{activeCase.description}</p>
              <ul className="grid gap-3 text-sm text-neutral-700 md:grid-cols-2">
                {activeCase.benefits.map((benefit) => (
                  <li key={benefit} className="rounded-xl bg-neutral-50 px-4 py-3">
                    <span className="mr-2 text-primary-500">●</span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-3">
                <SecondaryButton href="/demo" className="border border-neutral-200 bg-white">
                  Ver guía completa
                </SecondaryButton>
                <span className="rounded-full bg-success-100 px-3 py-1 text-xs font-medium text-success-600">
                  {activeCase.statHighlight}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

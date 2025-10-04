'use client'
import { useTransition } from 'react'
import { togglePromotion } from '@/actions/promotions'
import { isDemoMode, demoTogglePromotion } from '../lib/demoApi'
import toast from 'react-hot-toast'

export function PromotionsList({ promotions }: { promotions: any[] }) {
  const [pending, startTransition] = useTransition()
  function doToggle(id: string, active: boolean) {
    startTransition(() => {
      ;(async () => {
        const t = toast.loading('Actualizando...')
  const demo = isDemoMode()
  const res = demo ? await demoTogglePromotion(id, active) : await togglePromotion(id, active)
        toast.dismiss(t)
  if (!res.success && 'error' in res) toast.error(res.error || 'Error')
        else toast.success('Guardado')
      })()
    })
  }
  return (
    <ul className="text-sm space-y-1">
      {promotions.map(p => (
        <li key={p.id} className="flex items-center gap-2">
          <span className={p.is_active ? '' : 'opacity-60'}>{p.name}</span>
          <button
            disabled={pending}
            onClick={() => doToggle(p.id, !p.is_active)}
            className={`text-xs px-2 py-0.5 rounded border transition ${p.is_active ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >{p.is_active ? 'Activo' : 'Inactivo'}</button>
        </li>
      ))}
      {promotions.length === 0 && <li>No hay promociones.</li>}
    </ul>
  )
}

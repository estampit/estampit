'use client'
import { useState, FormEvent } from 'react'
import { createPromotion } from '@/actions/promotions'

export function PromotionForm({ businessId, loyaltyCardId }: { businessId: string; loyaltyCardId?: string }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('extra_stamp')
  const [status, setStatus] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('Creando...')
    const res = await createPromotion({ businessId, loyaltyCardId, name, promoType: type })
    setStatus(res.success ? 'OK' : 'Error: ' + res.error)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border p-3 rounded">
      <h4 className="font-medium">Nueva Promoción</h4>
      <input className="border px-2 py-1 w-full" placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} />
      <select className="border px-2 py-1 w-full" value={type} onChange={e=>setType(e.target.value)}>
        <option value="extra_stamp">Extra Stamp</option>
        <option value="multiplier">Multiplier</option>
        <option value="reward_boost">Reward Boost</option>
        <option value="birthday">Birthday</option>
        <option value="happy_hour">Happy Hour</option>
        <option value="custom">Custom</option>
      </select>
      <button className="bg-green-600 text-white px-3 py-1 rounded" disabled={!name}>Crear</button>
      <div className="text-xs">{status}</div>
    </form>
  )
}

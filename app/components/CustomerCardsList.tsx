'use client'
import { useTransition, useState, useEffect } from 'react'
import { ensureCustomerCard, generateWalletPass } from '@/actions/customer'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import dynamic from 'next/dynamic'
const WalletPassQR = dynamic(()=>import('./WalletPassQR').then(m=>m.WalletPassQR), { ssr: false })

interface Card {
  id: string
  name: string
  business_name?: string
  business_id: string
  current_stamps?: number
  stamps_required?: number
  reward_description?: string
  customer_card_id?: string
}

export function CustomerCardsList({ available }: { available: Card[] }) {
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState<string>('')
  const [passes, setPasses] = useState<Record<string, any>>({})
  const [cards, setCards] = useState<Card[]>(available)

  function join(card: Card) {
    startTransition(async () => {
      setStatus('Uniendo...')
      const res = await ensureCustomerCard(card.id)
      if (!res.success) { setStatus('Error: ' + res.error); return }
      // Intentar tomar id retornada
      const newId = (res.data?.customer_card_id) || res.data?.id || res.data?.customer_card_id
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, customer_card_id: newId, current_stamps: 0 } : c))
      setStatus('Asociado.')
    })
  }

  function genPass(card: Card) {
    if (!card.customer_card_id) return
    startTransition(async () => {
      setStatus('Generando pass...')
      const res = await generateWalletPass(card.customer_card_id, card.business_id)
      if (!res.success) { setStatus('Error: ' + res.error); return }
      setPasses(p => ({ ...p, [card.customer_card_id!]: res.data }))
      setStatus('Pass generado')
    })
  }

  // Realtime listener con cleanup
  useEffect(() => {
    const supabase = createClientComponentClient()
    const channel = supabase
      .channel('realtime-stamps')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stamps' }, (payload: any) => {
        setCards(prev => prev.map(c => c.customer_card_id === payload.new.customer_card_id ? { ...c, current_stamps: (c.current_stamps || 0) + 1 } : c))
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Tarjetas de Fidelización</h3>
      <ul className="space-y-2">
  {cards.map(c => {
          const pass = c.customer_card_id ? passes[c.customer_card_id] : null
          return (
            <li key={c.id} className="border rounded p-3 text-sm flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-gray-500">{c.business_name}</span>
              </div>
              {c.customer_card_id ? (
                <div className="flex flex-col gap-1">
                  <div className="flex flex-col gap-1">
                    <div>Stamps: {c.current_stamps ?? 0} / {c.stamps_required ?? '?'} - Recompensa: {c.reward_description}</div>
                    <div className="flex gap-0.5 flex-wrap">
                      {Array.from({ length: c.stamps_required || 0 }).map((_, i) => {
                        const filled = (c.current_stamps || 0) > i
                        return <span key={i} className={`h-2 w-2 rounded-full ${filled ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                      })}
                    </div>
                  </div>
                  <button disabled={pending} onClick={() => genPass(c)} className="bg-indigo-600 text-white px-2 py-1 rounded text-xs w-fit">Wallet Pass</button>
                  {pass && (
                    <div className="flex flex-col gap-1 mt-1">
                      <WalletPassQR token={pass.qr_token} />
                      <div className="text-[10px]">Reused: {String(pass.reused)}</div>
                    </div>
                  )}
                </div>
              ) : (
                <button disabled={pending} onClick={() => join(c)} className="bg-blue-600 text-white px-2 py-1 rounded text-xs w-fit">Unirme</button>
              )}
            </li>
          )
        })}
      </ul>
      <div className="text-xs opacity-70">{pending ? 'Procesando...' : status}</div>
    </div>
  )
}

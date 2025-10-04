"use client"
import { useEffect, useState } from 'react'
import { generateRewardClaimToken } from '@/actions/rewards'
import { getSupabaseClient } from '@/lib/supabaseClient'
import QRCode from 'qrcode.react'

interface RewardRow { id: string; reward_type: string; reward_description: string; is_claimed?: boolean; created_at: string }

export function MyRewards({ businessId }: { businessId: string }) {
  const supabase = getSupabaseClient()
  const [rewards, setRewards] = useState<RewardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [claimTokens, setClaimTokens] = useState<Record<string,string>>({})
  const [error, setError] = useState<string|null>(null)

  useEffect(()=> {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      // fetch rewards of current user for this business
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('auth'); setLoading(false); return }
      const { data, error } = await supabase.from('rewards').select('id,reward_type,reward_description,is_claimed,created_at,customer_card_id,business_id').eq('business_id', businessId).order('created_at', { ascending:false }).limit(25)
      if (!cancelled) {
        if (error) setError(error.message)
        else setRewards((data||[]) as any)
        setLoading(false)
      }
    }
    load();
    return ()=> { cancelled = true }
  }, [businessId, supabase])

  async function handleGenerate(rewardId: string) {
    const res = await generateRewardClaimToken(rewardId)
    if (!res.success) { setError(res.error || 'error'); return }
    const token = (res.data as any)?.token
    if (token) setClaimTokens(t=> ({ ...t, [rewardId]: token }))
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Mis Recompensas</h3>
      {loading && <div className="text-xs text-gray-500">Cargando...</div>}
      {!loading && rewards.length===0 && <div className="text-xs text-gray-500">No tienes recompensas aún.</div>}
      {error && <div className="text-xs text-red-600">{error}</div>}
      <div className="space-y-3">
        {rewards.map(r=> (
          <div key={r.id} className="border rounded p-3 text-xs space-y-2 bg-white">
            <div className="flex justify-between items-center">
              <span className="font-medium">{r.reward_description}</span>
              <span className={`px-2 py-0.5 rounded ${r.is_claimed? 'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-800'}`}>{r.is_claimed? 'Reclamada':'Pendiente'}</span>
            </div>
            {!r.is_claimed && (
              <div className="flex flex-col gap-2">
                {claimTokens[r.id] ? (
                  <div className="flex flex-col items-center gap-1">
                    <QRCode value={claimTokens[r.id]} size={120} includeMargin={false} />
                    <code className="text-[10px] break-all bg-gray-100 px-1 py-0.5 rounded">{claimTokens[r.id]}</code>
                    <p className="text-[10px] text-gray-500">Muestra este QR al comercio para canjear.</p>
                  </div>
                ) : (
                  <button onClick={()=> handleGenerate(r.id)} className="text-[11px] border rounded px-2 py-1 bg-indigo-600 text-white">Generar QR Claim</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

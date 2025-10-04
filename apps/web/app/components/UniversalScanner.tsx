"use client"
import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import toast from 'react-hot-toast'
import { redeemWalletPassToken } from '@/actions/wallet'
import { redeemRewardClaimToken } from '@/actions/rewards'

interface Props { businessId: string }

export function UniversalScanner({ businessId }: Props) {
  const [mode, setMode] = useState<'auto'|'pass'|'reward'>('auto')
  const [lastResult, setLastResult] = useState<any>(null)
  const [lastError, setLastError] = useState<string|null>(null)
  const [manual, setManual] = useState('')
  const [busy, setBusy] = useState(false)

  async function processToken(raw: string) {
    const token = raw.trim()
    if (!token) return
    if (busy) return
    setBusy(true)
    setLastError(null)

    // Heurística simple: reward tokens (claim) suelen ser longitud ~40 (gen_random_bytes(20) hex) y pass tokens ~48
    const guess: 'reward'|'pass' = mode === 'auto'
      ? (token.length <= 44 ? 'reward' : 'pass')
      : (mode === 'reward' ? 'reward' : 'pass')

    try {
      if (guess === 'pass') {
        const res = await redeemWalletPassToken(businessId, token)
        if (!res.success) throw new Error(res.error || 'Error pass')
        setLastResult({ kind:'stamp', data: res.data })
        toast.success('Sello añadido')
      } else {
        const res = await redeemRewardClaimToken(businessId, token)
        if (!res.success) throw new Error(res.error || 'Error reward')
        setLastResult({ kind:'reward_claim', data: res.data })
        toast.success('Recompensa canjeada')
      }
    } catch (e:any) {
      setLastError(e.message)
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border rounded p-4 space-y-3 bg-white">
      <div className="flex items-center gap-3">
        <h4 className="font-semibold text-sm">Escáner QR</h4>
        <select className="text-xs border rounded px-1 py-0.5" value={mode} onChange={e=> setMode(e.target.value as any)}>
          <option value="auto">Auto</option>
          <option value="pass">Pass</option>
            <option value="reward">Reward</option>
        </select>
      </div>
      <div className="relative aspect-square w-full max-w-xs mx-auto overflow-hidden rounded bg-black">
        <Scanner
          onScan={(results) => { const text = results?.[0]?.rawValue; if (text) processToken(text) }}
          onError={() => { /* ignore */ }}
          constraints={{ facingMode: 'environment' }}
        />
        {busy && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">Procesando...</div>}
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex gap-2">
          <input className="border px-2 py-1 rounded flex-1" placeholder="Pegue token manual" value={manual} onChange={e=> setManual(e.target.value)} />
          <button disabled={!manual || busy} onClick={()=> processToken(manual)} className="border rounded px-2 py-1 bg-indigo-600 text-white disabled:opacity-40">OK</button>
        </div>
        {lastError && <div className="text-red-600">{lastError}</div>}
        {lastResult && (
          <div className="bg-gray-50 p-2 rounded border max-h-48 overflow-auto text-[10px] whitespace-pre-wrap">
            {JSON.stringify(lastResult, null, 2)}
          </div>
        )}
        <p className="text-[10px] text-gray-500 leading-snug">Modo Auto intenta adivinar el tipo de token por longitud. Cambia manualmente si es necesario.</p>
      </div>
    </div>
  )
}

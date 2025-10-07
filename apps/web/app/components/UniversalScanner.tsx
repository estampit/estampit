"use client"
import { useMemo, useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import toast from 'react-hot-toast'
import { redeemWalletPassToken } from '@/actions/wallet'
import { redeemRewardClaimToken } from '@/actions/rewards'

interface Props { businessId: string }

type ScanSummary = {
  kind: 'stamp' | 'reward'
  customerName?: string | null
  customerEmail?: string | null
  loyaltyCardName?: string | null
  promotionName?: string | null
  progressText?: string | null
  currentStamps?: number | null
  stampsRequired?: number | null
  pointsAwarded?: number | null
  pendingRewards?: number | null
  rewardIssued?: boolean
  downloadUrl?: string | null
  scanCount?: number | null
  passVersion?: number | null
  raw?: any
}

export function UniversalScanner({ businessId }: Props) {
  const [mode, setMode] = useState<'auto'|'pass'|'reward'>('auto')
  const [scanSummary, setScanSummary] = useState<ScanSummary | null>(null)
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
        const payload = res.data || {}
        const summary: ScanSummary = {
          kind: 'stamp',
          customerName: payload.customer_name ?? payload.customer_email ?? null,
          customerEmail: payload.customer_email ?? null,
          loyaltyCardName: payload.loyalty_card_name ?? null,
          promotionName: payload.promotion_name ?? null,
          progressText: payload.progress_text ?? null,
          currentStamps: payload.current_stamps ?? payload.stamp_result?.current_stamps ?? null,
          stampsRequired: payload.stamps_required ?? null,
          pointsAwarded: payload.points_awarded ?? payload.stamp_result?.final_stamps_added ?? null,
          pendingRewards: payload.pending_rewards ?? payload.stamp_result?.pending_rewards ?? null,
          rewardIssued: payload.reward_issued ?? false,
          downloadUrl: payload.downloadUrl ?? null,
          scanCount: payload.pass_usage_total ?? payload.usage_count ?? null,
          passVersion: payload.pass_version ?? null,
          raw: payload,
        }
        setScanSummary(summary)
        toast.success('Sello añadido')
      } else {
        const res = await redeemRewardClaimToken(businessId, token)
        if (!res.success) throw new Error(res.error || 'Error reward')
        setScanSummary({ kind: 'reward', raw: res.data })
        toast.success('Recompensa canjeada')
      }
    } catch (e:any) {
      setLastError(e.message)
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  const progressPercent = useMemo(() => {
    if (!scanSummary || scanSummary.kind !== 'stamp') return null
    const current = Number.isFinite(scanSummary.currentStamps) ? Math.max(0, scanSummary.currentStamps ?? 0) : null
    const required = Number.isFinite(scanSummary.stampsRequired) ? Math.max(0, scanSummary.stampsRequired ?? 0) : null
    if (current === null) return null
    if (!required || required <= 0) return Math.min(100, current)
    return Math.min(100, Math.round((Math.min(current, required) / required) * 100))
  }, [scanSummary])

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
        {scanSummary && (
          <div className="space-y-3 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 text-[11px] text-indigo-900">
            {scanSummary.kind === 'stamp' ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">
                      {scanSummary.customerName || 'Cliente identificado'}
                    </p>
                    <p className="text-[10px] text-indigo-700/70">
                      {scanSummary.promotionName || scanSummary.loyaltyCardName || 'Programa de fidelización'}
                    </p>
                  </div>
                  <div className="text-right text-indigo-800">
                    <p className="text-xs font-semibold">+{scanSummary.pointsAwarded ?? 1} sello(s)</p>
                    {typeof scanSummary.scanCount === 'number' && (
                      <p className="text-[10px] text-indigo-700/70">Escaneos totales: {scanSummary.scanCount}</p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[10px] text-indigo-800/80">
                    <span>{scanSummary.progressText ?? 'Progreso actualizado'}</span>
                    {typeof scanSummary.stampsRequired === 'number' && typeof scanSummary.currentStamps === 'number' && (
                      <span>{Math.min(scanSummary.currentStamps, scanSummary.stampsRequired)}/{scanSummary.stampsRequired}</span>
                    )}
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-indigo-100">
                    <div
                      className="h-2 rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${progressPercent ?? 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-indigo-800/80">
                  {scanSummary.pendingRewards !== null && scanSummary.pendingRewards !== undefined && (
                    <span>Recompensas pendientes: {scanSummary.pendingRewards}</span>
                  )}
                  {scanSummary.rewardIssued && <span className="text-emerald-600 font-semibold">¡Recompensa desbloqueada!</span>}
                  {typeof scanSummary.passVersion === 'number' && (
                    <span>Versión pass #{scanSummary.passVersion}</span>
                  )}
                </div>
                {scanSummary.downloadUrl && (
                  <a
                    href={scanSummary.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded border border-indigo-400 bg-white px-3 py-1 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-50"
                  >
                    Descargar/actualizar pass
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-indigo-900">Recompensa canjeada</p>
                <p className="text-[10px] text-indigo-800/80">Consulta la actividad reciente para más detalles.</p>
              </div>
            )}
          </div>
        )}
        <p className="text-[10px] text-gray-500 leading-snug">Modo Auto intenta adivinar el tipo de token por longitud. Cambia manualmente si es necesario.</p>
      </div>
    </div>
  )
}

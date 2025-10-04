'use client'
import { useState, useTransition } from 'react'
import { redeemWalletPassToken } from '@/actions/wallet'

export function RedeemWalletPass({ businessId }: { businessId: string }) {
  const [token, setToken] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleRedeem() {
    if (!token) return
    startTransition(async () => {
      setError(null)
      setResult(null)
      const res = await redeemWalletPassToken(businessId, token.trim())
      if (!res.success) { setError(res.error || 'Error desconocido'); return }
      setResult(res.data)
    })
  }

  return (
    <div className="border rounded p-4 space-y-3">
      <h4 className="font-semibold text-sm">Canjear Wallet Pass (QR Token)</h4>
      <input
        className="border px-2 py-1 w-full text-sm"
        placeholder="Pega aquí el qr_token"
        value={token}
        onChange={e=>setToken(e.target.value)}
      />
      <button
        onClick={handleRedeem}
        disabled={pending || !token}
        className="bg-purple-600 disabled:opacity-50 text-white text-xs px-3 py-1 rounded"
      >{pending ? 'Canjeando...' : 'Canjear'}</button>
      {error && <div className="text-xs text-red-600">{error}</div>}
      {result && (
        <div className="bg-gray-50 border rounded p-2 max-h-56 overflow-auto text-[10px] whitespace-pre-wrap">
          {JSON.stringify(result, null, 2)}
        </div>
      )}
      <p className="text-[10px] text-gray-500 leading-snug">
        Este canje invoca la función <code>redeem_wallet_pass_token</code> que añade un stamp (con promociones) y actualiza usage_count del pass.
      </p>
    </div>
  )
}

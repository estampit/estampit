'use client'
import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

export function WalletPassQR({ token }: { token: string }) {
  const [showRaw, setShowRaw] = useState(false)
  return (
    <div className="border rounded p-3 space-y-2 inline-flex flex-col items-center">
      <QRCodeCanvas value={token} size={140} includeMargin className="border bg-white p-1" />
      <button onClick={()=>setShowRaw(s=>!s)} className="text-xs text-blue-600 underline">
        {showRaw ? 'Ocultar token' : 'Ver token' }
      </button>
      {showRaw && <code className="text-[10px] break-all max-w-[180px]">{token}</code>}
    </div>
  )}

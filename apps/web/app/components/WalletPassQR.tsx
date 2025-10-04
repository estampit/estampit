'use client'
import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

export function WalletPassQR({ token }: { token: string }) {
  const [showRaw, setShowRaw] = useState(false)

  const downloadPass = () => {
    // Para testing local, abrimos el endpoint que devuelve JSON
    // En un dispositivo real con Wallet app, esto sería un archivo .pkpass
    window.open(`/api/wallet/download?token=${encodeURIComponent(token)}`, '_blank')
  }

  return (
    <div className="border rounded p-3 space-y-2 inline-flex flex-col items-center">
      <QRCodeCanvas value={token} size={140} includeMargin className="border bg-white p-1" />
      <button onClick={()=>setShowRaw(s=>!s)} className="text-xs text-blue-600 underline">
        {showRaw ? 'Ocultar token' : 'Ver token' }
      </button>
      {showRaw && <code className="text-[10px] break-all max-w-[180px]">{token}</code>}
      <button
        onClick={downloadPass}
        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
      >
        📱 Descargar Pass
      </button>
      <div className="text-[10px] text-center text-gray-500 max-w-[180px]">
        Para testing local: descarga el JSON y úsalo con herramientas de desarrollo de Wallet
      </div>
    </div>
  )}

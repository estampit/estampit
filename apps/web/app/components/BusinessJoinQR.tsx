"use client"
import { useMemo } from 'react'
import QRCode from 'qrcode.react'
import toast from 'react-hot-toast'

export function BusinessJoinQR({ businessId, businessName }: { businessId: string; businessName?: string }) {
  const joinUrl = useMemo(()=> `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${businessId}`, [businessId])
  function handleCopy() {
    navigator.clipboard.writeText(joinUrl).then(()=> toast.success('Link copiado'))
  }
  function handleDownload() {
    try {
      const canvas = document.getElementById(`joinqr-${businessId}`) as HTMLCanvasElement | null
      if (!canvas) return
      const link = document.createElement('a')
      link.download = `join-${businessId}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {}
  }
  return (
    <div className="border rounded p-4 space-y-3 bg-white">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-sm">QR Captación</h4>
        {businessName && <span className="text-[11px] text-gray-500 truncate max-w-[140px]" title={businessName}>{businessName}</span>}
      </div>
      <div className="flex flex-col items-center gap-2">
        <QRCode id={`joinqr-${businessId}`} value={joinUrl} size={140} includeMargin={false} />
        <code className="text-[10px] break-all bg-gray-100 px-2 py-1 rounded max-w-full">{joinUrl}</code>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="text-[11px] px-2 py-1 border rounded bg-indigo-600 text-white">Copiar</button>
          <button onClick={handleDownload} className="text-[11px] px-2 py-1 border rounded">Descargar</button>
        </div>
        <p className="text-[10px] text-gray-500 text-center leading-snug">Imprime este QR y colócalo en tu local. Los clientes lo escanean para ver promociones y generar su tarjeta.</p>
      </div>
    </div>
  )
}

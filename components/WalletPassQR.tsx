"use client"
import { QRCodeCanvas } from 'qrcode.react'

interface WalletPassQRProps {
  token: string
  size?: number
  label?: string
}

export function WalletPassQR({ token, size = 160, label }: WalletPassQRProps) {
  if (!token) return null
  const qrData = JSON.stringify({ t: token })
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-3 bg-white rounded-lg shadow border">
        <QRCodeCanvas value={qrData} size={size} level="M" includeMargin={false} />
      </div>
      {label && <span className="text-xs text-gray-500">{label}</span>}
      <button
        onClick={() => navigator.clipboard.writeText(token)}
        className="text-[11px] px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
      >Copiar token</button>
    </div>
  )
}
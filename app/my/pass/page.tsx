import { getServerSupabase } from '@/lib/supabaseServer'
import Link from 'next/link'
import QRCode from 'qrcode'
import { MyRewards } from '../../components/MyRewards'

async function generateQR(data: string) {
  try {
    return await QRCode.toDataURL(data, { margin: 1, scale: 4 })
  } catch {
    return null
  }
}

export default async function MyPassPage({ searchParams }: { searchParams: { business?: string } }) {
  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div className="p-8 text-sm">Necesitas iniciar sesión.</div>
  const businessId = searchParams.business
  if (!businessId) return <div className="p-8 text-sm">Falta business param (?business=...)</div>
  // Find customer card
  const { data: cardRow } = await (supabase.from('customer_cards') as any).select('id, loyalty_card_id').eq('customer_id', user.id).limit(1).single()
  if (!cardRow) return <div className="p-8 text-sm">No tienes card aún. Ve a <Link className="underline" href={`/join/${businessId}`}>/join/{businessId}</Link></div>
  // Find wallet pass for this business
  const { data: passRows } = await (supabase.from('wallet_passes') as any).select('qr_token,updated_at,usage_count').eq('business_id', businessId).eq('customer_card_id', (cardRow as any).id).eq('is_revoked', false).limit(1)
  if (!passRows || passRows.length === 0) return <div className="p-8 text-sm">No se encontró pass. Regresa a <Link className="underline" href={`/join/${businessId}`}>join</Link>.</div>
  const token = passRows[0].qr_token
  const dataUrl = await generateQR(token)
  return (
    <div className="max-w-sm mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Mi Pass</h1>
      <p className="text-sm text-gray-600">Muestra este QR al comercio para añadir sellos.</p>
      <div className="border rounded p-4 bg-white flex flex-col items-center gap-3">
        {dataUrl ? <img src={dataUrl} alt="QR" className="w-48 h-48" /> : <div className="text-xs">QR no disponible</div>}
        <code className="text-[10px] break-all bg-gray-100 px-2 py-1 rounded">{token}</code>
        <div className="text-[11px] text-gray-500">Actualizado: {new Date(passRows[0].updated_at).toLocaleString()} • Usos: {passRows[0].usage_count}</div>
      </div>
      <Link href={`/join/${businessId}`} className="text-xs underline">Volver a promociones</Link>
      <div className="pt-4 border-t">
        <MyRewards businessId={businessId} />
      </div>
    </div>
  )
}

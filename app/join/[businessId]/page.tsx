import { getServerSupabase } from '@/lib/supabaseServer'
import { getPublicPromotions, ensureCustomerCardAndPass } from '@/actions/publicJoin'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function JoinBusinessPage({ params }: { params: { businessId: string } }) {
  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const businessId = params.businessId
  // Basic business lookup
  const { data: biz, error: bizErr } = await supabase.from('businesses').select('id,name').eq('id', businessId).single()
  if (bizErr || !biz) {
    return <div className="p-10 text-sm">Negocio no encontrado.</div>
  }
  let promotions: any[] = []
  try {
    const res = await getPublicPromotions(businessId)
    if (res.success) promotions = res.data || []
  } catch {}

  async function handleEnsure() {
    'use server'
    const res = await ensureCustomerCardAndPass(businessId)
    if (!res.success) {
      return redirect(`/join/${businessId}?error=${res.error}`)
    }
    return redirect(`/join/${businessId}?ready=1`)
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
  <h1 className="text-2xl font-semibold">{(biz as any).name}</h1>
      <p className="text-sm text-gray-600">Únete al programa de lealtad. Inicia sesión o crea cuenta para guardar tus sellos.</p>
      {!user && (
        <div className="flex gap-2 text-sm">
          <Link className="underline" href={`/login?next=/join/${businessId}`}>Iniciar sesión</Link>
          <Link className="underline" href={`/register?next=/join/${businessId}`}>Crear cuenta</Link>
        </div>
      )}
      <section className="space-y-3">
        <h2 className="font-medium">Promociones activas</h2>
        <div className="space-y-2">
          {promotions.length === 0 && <div className="text-sm text-gray-500">No hay promociones activas ahora.</div>}
          {promotions.map(p=> (
            <div key={p.id} className="border rounded p-3 text-sm flex justify-between gap-4">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-500">Tipo: {p.promo_type}{p.ends_at && ` • Fin: ${new Date(p.ends_at).toLocaleDateString()}`}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {user && (
        <form action={handleEnsure} className="space-y-2">
          <button className="bg-indigo-600 text-white text-sm px-4 py-2 rounded">Obtener mi tarjeta y pass</button>
          <p className="text-[11px] text-gray-500">Creará (o reutilizará) tu customer card y un wallet pass QR reutilizable.</p>
        </form>
      )}
      <div className="text-[10px] text-gray-400">Al continuar aceptas los términos del programa de lealtad de este comercio.</div>
    </div>
  )
}

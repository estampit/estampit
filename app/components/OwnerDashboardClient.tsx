"use client"
import { useEffect, useState, useTransition } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { PromotionForm } from './PromotionForm'
import { PromotionsList } from './PromotionsList'
import { RedeemWalletPass } from './RedeemWalletPass'
import { EventsFeedClient } from './EventsFeedClient'
import { StaffManagement } from './StaffManagement'
import { BusinessJoinQR } from './BusinessJoinQR'
import { UniversalScanner } from './UniversalScanner'
import { getSupabaseClient } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

interface Promotion {
  id: string
  name: string
  promo_type: string
  is_active: boolean
  created_at: string
  ends_at: string | null
  usage_count?: number
}

interface BusinessSummary {
  id: string
  name: string
  logo_url?: string | null
  total_customers?: number
  total_stamps?: number
  total_rewards?: number
  active_promotions?: number
}

export function OwnerDashboardClient() {
  const supabase = getSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState<BusinessSummary | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [metrics, setMetrics] = useState<{ stampsToday: number; stampsWeek: number; redemptionsWeek: number; topPromo?: string } | null>(null)
  const [promoUsage, setPromoUsage] = useState<{ promotion_id: string; usage_count: number; name?: string}[]>([])
  const [trendData, setTrendData] = useState<any[]>([])
  const [loyaltyCardId, setLoyaltyCardId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [customerAnalytics, setCustomerAnalytics] = useState<any|null>(null)
  const [customerSegments, setCustomerSegments] = useState<any[]>([])
  const [promoPage, setPromoPage] = useState(1)
  const [promoFilters, setPromoFilters] = useState<{ status?: string; type?: string; search?: string }>({})
  const pageSize = 25
  const [promoTotal, setPromoTotal] = useState<number|undefined>(undefined)
  const [editingPromoId, setEditingPromoId] = useState<string|null>(null)
  const [editDraft, setEditDraft] = useState<{ name?: string; priority?: number; ends_at?: string | null}>({})
  const [orderBy, setOrderBy] = useState<'created_at' | 'priority' | 'ends_at'>('created_at')
  const [orderDir, setOrderDir] = useState<'asc'|'desc'>('desc')

  async function loadAll() {
    setLoading(true)
    // Fetch current user businesses (first one)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      toast.error('No autenticado')
      return
    }
    const { data: businesses, error: bizErr } = await supabase.from('businesses').select('*').eq('owner_id', user.id).order('created_at')
    if (bizErr) toast.error(bizErr.message)
    if (businesses && businesses.length) {
      const b = businesses[0]
      setBusiness({ id: b.id, name: b.name, logo_url: (b as any).logo_url })
      const { data: cards } = await supabase.from('loyalty_cards').select('id').eq('business_id', b.id).limit(1)
      setLoyaltyCardId(cards?.[0]?.id || null)
      // Use server action listPromotions for extended filtering/pagination (fallback to direct if fails)
      try {
        const { listPromotions } = await import('@/actions/promotions')
        const resp = await listPromotions({ businessId: b.id, page: promoPage, pageSize, filters: promoFilters as any, orderBy, orderDir })
        if (resp.success) {
          setPromotions((resp.data||[]).map((p:any)=> ({ ...p, usage_count: (p as any).usage_count || 0 })))
          setPromoTotal(resp.count)
        } else {
          const { data: fallback, count } = await supabase.from('promotions').select('*', { count:'exact'}).eq('business_id', b.id).order(orderBy, { ascending: orderDir==='asc'})
          setPromotions((fallback||[]).map(p => ({ ...p, usage_count: (p as any).usage_count || 0 })))
          setPromoTotal(count||undefined)
        }
      } catch {
        const { data: fallback, count } = await supabase.from('promotions').select('*', { count:'exact'}).eq('business_id', b.id).order(orderBy, { ascending: orderDir==='asc'})
        setPromotions((fallback||[]).map(p => ({ ...p, usage_count: (p as any).usage_count || 0 })))
        setPromoTotal(count||undefined)
      }
      // Simple metrics aggregate (could be replaced by function call)
      let stampsTodayData: any = null, stampsWeekData: any = null, redemptionsWeekData: any = null
      try { const { data } = await supabase.rpc('get_stamps_stats', { p_business_id: b.id, p_range: 'today' } as any); stampsTodayData = data } catch {}
      try { const { data } = await supabase.rpc('get_stamps_stats', { p_business_id: b.id, p_range: '7d' } as any); stampsWeekData = data } catch {}
      try { const { data } = await supabase.rpc('get_redemptions_stats', { p_business_id: b.id, p_range: '7d' } as any); redemptionsWeekData = data } catch {}
      // Promotion usage
      try {
        const { data: usage } = await supabase.rpc('get_promotion_usage', { p_business_id: b.id } as any)
        if (usage) {
          const nameMap: Record<string,string> = {}
          promotions.forEach(p=> { nameMap[(p as any).id]= (p as any).name })
          setPromoUsage(usage.map((u:any)=> ({ ...u, name: nameMap[u.promotion_id] || u.promotion_id })))
        }
      } catch {}
      // Trend real data
      try {
        const { data: series } = await supabase.rpc('get_stamps_timeseries', { p_business_id: b.id, p_days: 14 } as any)
        if (series) {
          setTrendData(series.map((row:any)=> ({ day: new Date(row.day).toLocaleDateString('es-ES',{ day:'2-digit'}), stamps: row.stamps_count, redemptions: row.redemptions_count })))
        }
      } catch {}
      // Customer analytics & segments
      try {
        const { data: ca } = await supabase.rpc('get_customer_analytics', { p_business_id: b.id, p_days: 30 } as any)
        if (ca) setCustomerAnalytics(ca)
      } catch {}
      try {
        const { data: seg } = await supabase.rpc('get_customer_segments', { p_business_id: b.id, p_days: 30 } as any)
        if (seg) setCustomerSegments(seg as any[])
      } catch {}
      setMetrics({
        stampsToday: (stampsTodayData)?.count || 0,
        stampsWeek: (stampsWeekData)?.count || 0,
        redemptionsWeek: (redemptionsWeekData)?.count || 0,
        topPromo: promotions.sort((a,b)=> (b.usage_count||0)-(a.usage_count||0))[0]?.name
      })
    }
    setLoading(false)
  }

  useEffect(() => { loadAll() // initial load + refetch on filter/page
    // Realtime subscription for promotions changes
    const channel = supabase.channel('owner-promotions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promotions' }, payload => {
        setPromotions(prev => {
          const idx = prev.findIndex(p=>p.id=== (payload.new as any).id)
          if (payload.eventType === 'DELETE') return prev.filter(p=>p.id!== (payload.old as any).id)
          if (idx>=0) {
            const copy = [...prev]; copy[idx] = { ...copy[idx], ...(payload.new as any) }; return copy
          }
          return [...prev, payload.new as any]
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoPage, promoFilters, orderBy, orderDir])

  function handleLocalToggle(id: string, active: boolean) {
    setPromotions(prev => prev.map(p=> p.id===id ? { ...p, is_active: active } : p))
    startTransition(async () => {
      const { togglePromotion } = await import('@/actions/promotions')
      const res = await togglePromotion(id, active)
      if (!res.success) toast.error(res.error || 'Error al actualizar')
      // Refresh promotion usage + metrics after toggle to reflect updated availability
      try {
        if (business) {
          const { data: usage } = await supabase.rpc('get_promotion_usage', { p_business_id: business.id } as any)
          if (usage) {
            const nameMap: Record<string,string> = {}
            setPromotions(prev => { prev.forEach(p=> { nameMap[p.id]=p.name }); return prev })
            setPromoUsage(usage.map((u:any)=> ({ ...u, name: nameMap[u.promotion_id] || u.promotion_id })))
          }
          // lightweight refresh of headline metrics (only stamps today + week)
          try { const { data } = await supabase.rpc('get_stamps_stats', { p_business_id: business.id, p_range: 'today' } as any); setMetrics(m => ({ ...(m||{ stampsWeek:0, redemptionsWeek:0 }), stampsToday: data?.count || 0 })) } catch {}
        }
      } catch {}
    })
  }

  async function saveEdit(promoId: string) {
    const { updatePromotion } = await import('@/actions/promotions')
    const res = await updatePromotion(promoId, {
      name: editDraft.name,
      priority: editDraft.priority,
      endsAt: editDraft.ends_at || null
    })
    if (!res.success) toast.error(res.error || 'Error guardando')
    else toast.success('Actualizado')
    setEditingPromoId(null)
    await loadAll()
  }

  async function performDelete(promoId: string) {
    if (!confirm('¿Eliminar promoción?')) return
    const { deletePromotion } = await import('@/actions/promotions')
    const res = await deletePromotion(promoId)
    if (!res.success) toast.error(res.error || 'Error eliminando')
    else {
      toast.success('Eliminada')
      setPromotions(prev => prev.filter(p=>p.id!==promoId))
      setPromoTotal(t=> (t? t-1 : t))
    }
  }

  // Periodic refresh of promotion usage to keep chart up-to-date (every 60s)
  useEffect(() => {
    if (!business) return
    const interval = setInterval(async () => {
      try {
        const { data: usage } = await supabase.rpc('get_promotion_usage', { p_business_id: business.id } as any)
        if (usage) {
          const nameMap: Record<string,string> = {}
          promotions.forEach(p=> { nameMap[p.id]=p.name })
          setPromoUsage(usage.map((u:any)=> ({ ...u, name: nameMap[u.promotion_id] || u.promotion_id })))
        }
      } catch { /* silent */ }
    }, 60000)
    return () => clearInterval(interval)
  }, [business, promotions, supabase])

  if (loading) return <div className="p-6">Cargando datos...</div>
  if (!business) return <div className="p-6">No tienes negocios aún.</div>

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {business.logo_url && <img src={business.logo_url} alt="logo" className="h-10 w-10 rounded" />}
          <h2 className="text-2xl font-semibold">{business.name}</h2>
        </div>
        <div className="ml-auto flex gap-4 text-sm">
          <Metric label="Sellos Hoy" value={metrics?.stampsToday ?? 0} />
          <Metric label="Sellos 7d" value={metrics?.stampsWeek ?? 0} />
          <Metric label="Canjes 7d" value={metrics?.redemptionsWeek ?? 0} />
          <Metric label="Top Promo" value={metrics?.topPromo || '—'} />
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <BusinessJoinQR businessId={business.id} businessName={business.name} />
            <UniversalScanner businessId={business.id} />
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold">Promociones</h3>
            <div className="flex flex-wrap gap-2 text-xs items-center">
              <input placeholder="Buscar" className="border px-2 py-1 rounded" value={promoFilters.search||''} onChange={e=> setPromoFilters(f=> ({ ...f, search: e.target.value||undefined }))} />
              <select className="border px-2 py-1 rounded" value={promoFilters.status||''} onChange={e=> setPromoFilters(f=> ({ ...f, status: e.target.value||undefined }))}>
                <option value="">Estado</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
                <option value="upcoming">Próximas</option>
                <option value="expired">Expiradas</option>
              </select>
              <select className="border px-2 py-1 rounded" value={promoFilters.type||''} onChange={e=> setPromoFilters(f=> ({ ...f, type: e.target.value||undefined }))}>
                <option value="">Tipo</option>
                <option value="extra_stamp">Extra</option>
                <option value="multiplier">Multiplicador</option>
                <option value="reward_boost">Reward Boost</option>
              </select>
              <button className="ml-auto text-xs underline" onClick={()=> { setPromoFilters({}); setPromoPage(1) }}>Reset</button>
            </div>
              <div className="border rounded p-3 divide-y">
                {promotions.length === 0 && <div className="text-sm py-2 text-gray-500">No hay promociones todavía.</div>}
                {promotions.map(p => (
                  <div key={p.id} className="py-2 flex items-start gap-3">
                    <div className="flex-1">
                      {editingPromoId === p.id ? (
                        <div className="space-y-1">
                          <input className="border px-2 py-1 rounded w-full text-xs" value={editDraft.name||''} onChange={e=> setEditDraft(d=> ({ ...d, name: e.target.value }))} />
                          <div className="flex gap-2 text-xs">
                            <input type="number" className="border px-2 py-1 rounded w-24" value={editDraft.priority ?? ''} placeholder="Prioridad" onChange={e=> setEditDraft(d=> ({ ...d, priority: e.target.value ? parseInt(e.target.value,10): undefined }))} />
                            <input type="date" className="border px-2 py-1 rounded" value={editDraft.ends_at ? editDraft.ends_at.substring(0,10): ''} onChange={e=> setEditDraft(d=> ({ ...d, ends_at: e.target.value || null }))} />
                          </div>
                          <div className="flex gap-2 text-xs">
                            <button onClick={()=> saveEdit(p.id)} className="bg-blue-600 text-white px-2 py-1 rounded">Guardar</button>
                            <button onClick={()=> { setEditingPromoId(null); setEditDraft({}) }} className="px-2 py-1 rounded border">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="font-medium flex items-center gap-2 flex-wrap">
                            {p.name}
                            {(() => { const u = promoUsage.find(u=>u.promotion_id===p.id); return u ? <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded" title="Usos">{u.usage_count}</span> : null })()}
                            {!p.is_active && <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded">Inactiva</span>}
                            {p.ends_at && new Date(p.ends_at) < new Date() && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded">Expirada</span>}
                            {p.ends_at && new Date(p.ends_at) > new Date() && !p.is_active && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Pausada</span>}
                          </div>
                          <div className="text-xs text-gray-500">Tipo: {p.promo_type} • Creada: {new Date(p.created_at).toLocaleDateString()} {p.ends_at && `• Fin: ${new Date(p.ends_at).toLocaleDateString()}`} </div>
                        </>
                      )}
                    </div>
                    {editingPromoId !== p.id && (
                      <div className="flex flex-col gap-1 items-end">
                        <button disabled={pending} onClick={()=>handleLocalToggle(p.id, !p.is_active)} className={`text-[11px] px-2 py-1 rounded border ${p.is_active ? 'bg-green-600 text-white' : 'bg-white hover:bg-gray-50'}`}>{p.is_active ? 'Desactivar' : 'Activar'}</button>
                        <div className="flex gap-1">
                          <button onClick={()=> { setEditingPromoId(p.id); setEditDraft({ name: p.name, priority: (p as any).priority, ends_at: p.ends_at }) }} className="text-[11px] px-2 py-1 rounded border">Editar</button>
                          <button onClick={()=> performDelete(p.id)} className="text-[11px] px-2 py-1 rounded border text-red-600">Borrar</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between gap-2 pt-2 text-xs items-center">
                <span>{promoTotal !== undefined ? `${promoTotal} resultados` : ' '}</span>
                <div className="flex items-center gap-2">
                  <button disabled={promoPage===1} className="text-xs border rounded px-2 py-1 disabled:opacity-40" onClick={()=> setPromoPage(p=> Math.max(1,p-1))}>Prev</button>
                  <span className="text-xs px-2 py-1">Página {promoPage}</span>
                  <button disabled={promoTotal !== undefined && promotions.length < pageSize} className="text-xs border rounded px-2 py-1 disabled:opacity-40" onClick={()=> setPromoPage(p=> p+1)}>Next</button>
                </div>
              </div>
          </div>

          {loyaltyCardId && (
            <div>
              <PromotionForm businessId={business.id} loyaltyCardId={loyaltyCardId} />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded p-3 space-y-2">
              <h4 className="font-semibold text-sm">Uso de Promociones</h4>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={promoUsage.slice(0,8)}>
                    <XAxis dataKey="name" hide={promoUsage.length>8} />
                    <YAxis allowDecimals={false} width={30} />
                    <Tooltip />
                    <Bar dataKey="usage_count" fill="#2563eb" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="border rounded p-3 space-y-2">
              <h4 className="font-semibold text-sm">Tendencia Sellos vs Canjes (14d)</h4>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="stamps" stroke="#16a34a" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="redemptions" stroke="#dc2626" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Actividad en Tiempo Real</h3>
            <EventsFeedClient businessId={business.id} initial={[]} />
          </div>
          <RewardsAnalytics businessId={business.id} />
        </div>

        <aside className="space-y-6">
          <div className="border rounded p-4 space-y-2">
            <h4 className="font-semibold">Wallet Pass / Canjes</h4>
            <RedeemWalletPass businessId={business.id} />
          </div>
          <div>
            {/* Extra: quick access to Join QR also in sidebar small */}
            <BusinessJoinQR businessId={business.id} businessName={business.name} />
          </div>
          <div className="border rounded p-4 space-y-3">
            <h4 className="font-semibold">Resumen</h4>
            <ul className="text-sm space-y-1">
              <li>Promociones activas: {promotions.filter(p=>p.is_active).length}</li>
              <li>Total promociones: {promotions.length}</li>
              <li>Sellos hoy: {metrics?.stampsToday ?? 0}</li>
              <li>Sellos 7 días: {metrics?.stampsWeek ?? 0}</li>
              <li>Canjes 7 días: {metrics?.redemptionsWeek ?? 0}</li>
            </ul>
          </div>
          <div className="border rounded p-4 space-y-3">
            <h4 className="font-semibold">Clientes (30d)</h4>
            {customerAnalytics ? (
              <ul className="text-xs space-y-1">
                <li>Activos: {customerAnalytics.summary.total_active}</li>
                <li>Nuevos: {customerAnalytics.summary.new_customers}</li>
                <li>Recurrentes: {customerAnalytics.summary.returning_customers}</li>
                <li>Riesgo churn: {customerAnalytics.summary.churned_customers}</li>
                <li>Avg sellos/activo: {Number(customerAnalytics.summary.avg_stamps_per_active).toFixed(1)}</li>
              </ul>
            ) : <div className="text-xs text-gray-500">—</div>}
            {customerAnalytics?.top_customers?.length ? (
              <div className="mt-2">
                <h5 className="font-medium text-xs mb-1">Top</h5>
                <ol className="text-xs space-y-1 max-h-40 overflow-y-auto">
                  {customerAnalytics.top_customers.slice(0,8).map((c:any)=> (
                    <li key={c.customer_id} className="flex justify-between gap-2">
                      <span className="truncate max-w-[120px]" title={c.email}>{c.email || c.customer_id.substring(0,6)}</span>
                      <span className="text-gray-600">{c.stamps_added}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
            {customerSegments.length>0 && (
              <div className="mt-2">
                <h5 className="font-medium text-xs mb-1">Segmentos</h5>
                <ul className="grid grid-cols-2 gap-1 text-[11px]">
                  {customerSegments.map(s=> (
                    <li key={s.segment} className="flex justify-between bg-gray-50 rounded px-2 py-1">
                      <span>{s.segment}</span>
                      <span className="font-medium">{s.customers}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <StaffManagement businessId={business.id} />
          </div>
        </aside>
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid gap-1 text-right">
      <span className="text-[11px] uppercase tracking-wide text-gray-500">{label}</span>
      <span className="font-semibold text-sm">{value}</span>
    </div>
  )
}

function RewardsAnalytics({ businessId }: { businessId: string }) {
  const supabase = getSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [series, setSeries] = useState<any[]>([])
  const [conversion, setConversion] = useState<any|null>(null)
  const [days, setDays] = useState(30)
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { data: ts } = await supabase.rpc('get_rewards_timeseries', { p_business_id: businessId, p_days: days } as any)
        if (!cancelled && ts) {
          setSeries(ts.map((r:any)=> ({ day: new Date(r.day).toLocaleDateString('es-ES',{ day:'2-digit'}), rewards: r.rewards_count })))
        }
      } catch {}
      try {
        const { data: conv } = await supabase.rpc('get_reward_conversion', { p_business_id: businessId, p_days: days } as any)
        if (!cancelled && conv) setConversion(conv)
      } catch {}
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [businessId, supabase, days])
  return (
    <div className="border rounded p-3 space-y-4">
      <div className="flex items-center gap-3">
        <h4 className="font-semibold text-sm">Recompensas ({days}d)</h4>
        <select className="text-xs border rounded px-1 py-0.5" value={days} onChange={e=> setDays(parseInt(e.target.value,10))}>
          <option value={7}>7d</option>
          <option value={30}>30d</option>
          <option value={60}>60d</option>
        </select>
      </div>
      {loading && <div className="text-xs text-gray-500">Cargando...</div>}
      {!loading && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="rewards" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs space-y-2">
            {conversion ? (
              <ul className="space-y-1">
                <li>Sellos: {conversion.stamps}</li>
                <li>Recompensas: {conversion.rewards}</li>
                <li>Ratio (rewards / sellos %): {conversion.ratio}</li>
              </ul>
            ) : <div className="text-gray-500">Sin datos</div>}
          </div>
        </div>
      )}
    </div>
  )
}

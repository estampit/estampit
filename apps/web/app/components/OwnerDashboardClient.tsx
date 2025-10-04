"use client"
import { useCallback, useEffect, useState, useTransition } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { PromotionForm } from './PromotionForm'
import { RedeemWalletPass } from './RedeemWalletPass'
import { EventsFeedClient } from './EventsFeedClient'
import { StaffManagement } from './StaffManagement'
import { BusinessJoinQR } from './BusinessJoinQR'
import { UniversalScanner } from './UniversalScanner'
import { BusinessAppearanceForm } from './BusinessAppearanceForm'
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
  primary_color?: string | null
  secondary_color?: string | null
  background_color?: string | null
  text_color?: string | null
  card_title?: string | null
  card_description?: string | null
  total_customers?: number
  total_stamps?: number
  total_rewards?: number
  active_promotions?: number
}

type TabId = 'overview' | 'promotions' | 'customers' | 'appearance' | 'staff'

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
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const tabs: ReadonlyArray<{ id: TabId; name: string; icon: string }> = [
    { id: 'overview', name: 'Vista General', icon: '📊' },
    { id: 'promotions', name: 'Promociones', icon: '🎯' },
    { id: 'customers', name: 'Clientes', icon: '👥' },
    { id: 'appearance', name: 'Apariencia', icon: '🎨' },
    { id: 'staff', name: 'Personal', icon: '👷' }
  ]

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast.error('No autenticado')
        setBusiness(null)
        setPromotions([])
        setPromoUsage([])
        setMetrics(null)
        return
      }

      const { data: businesses, error: bizErr } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)

      if (bizErr) {
        toast.error(bizErr.message)
        return
      }

      if (!businesses || businesses.length === 0) {
        toast.error('No se encontró negocio')
        setBusiness(null)
        setPromotions([])
        setPromoUsage([])
        setMetrics(null)
        return
      }

      const rawBusiness = businesses[0] as any
      setBusiness({
        id: rawBusiness.id,
        name: rawBusiness.name,
        logo_url: rawBusiness.logo_url ?? null,
        primary_color: rawBusiness.primary_color ?? null,
        secondary_color: rawBusiness.secondary_color ?? null,
        background_color: rawBusiness.background_color ?? null,
        text_color: rawBusiness.text_color ?? null,
        card_title: rawBusiness.card_title ?? null,
        card_description: rawBusiness.card_description ?? null,
        total_customers: rawBusiness.total_customers ?? rawBusiness.metrics_total_customers ?? 0,
        total_stamps: rawBusiness.total_stamps ?? rawBusiness.metrics_total_stamps ?? 0,
        total_rewards: rawBusiness.total_rewards ?? rawBusiness.metrics_total_rewards ?? 0,
        active_promotions: rawBusiness.active_promotions ?? rawBusiness.metrics_active_promotions ?? 0,
      })

      const { data: cards } = await supabase
        .from('loyalty_cards')
        .select('id')
        .eq('business_id', rawBusiness.id)
        .order('created_at', { ascending: true })
        .limit(1)
      setLoyaltyCardId(cards?.[0]?.id ?? null)

      const nowIso = new Date().toISOString()
      let promoQuery = supabase
        .from('promotions')
        .select('*', { count: 'exact' })
        .eq('business_id', rawBusiness.id)

      if (promoFilters.status) {
        switch (promoFilters.status) {
          case 'active':
            promoQuery = promoQuery.eq('is_active', true).or(`ends_at.is.null,ends_at.gte.${nowIso}`)
            break
          case 'inactive':
            promoQuery = promoQuery.eq('is_active', false)
            break
          case 'expired':
            promoQuery = promoQuery.not('ends_at', 'is', null).lt('ends_at', nowIso)
            break
          case 'upcoming':
            promoQuery = promoQuery.gt('starts_at', nowIso)
            break
        }
      }

      if (promoFilters.type) {
        promoQuery = promoQuery.eq('promo_type', promoFilters.type)
      }

      if (promoFilters.search) {
        promoQuery = promoQuery.ilike('name', `%${promoFilters.search}%`)
      }

      const from = (promoPage - 1) * pageSize
      const { data: promoData, error: promoErr, count } = await promoQuery
        .order(orderBy, { ascending: orderDir === 'asc' })
        .range(from, from + pageSize - 1)

      let promoList: Promotion[] = []
      if (promoErr) {
        toast.error('Error cargando promociones: ' + promoErr.message)
        setPromotions([])
        setPromoTotal(undefined)
      } else if (promoData) {
        promoList = (promoData as any[]).map((p: any) => ({
          id: p.id,
          name: p.name,
          promo_type: p.promo_type,
          is_active: p.is_active,
          created_at: p.created_at,
          ends_at: p.ends_at,
          usage_count: (p as any).usage_count ?? 0,
          priority: (p as any).priority ?? null,
          config: p.config ?? undefined,
        }))
        setPromotions(promoList)
        setPromoTotal(count ?? undefined)
      } else {
        setPromotions([])
        setPromoTotal(count ?? undefined)
      }

      const [
        promoUsageRes,
        stampsTodayRes,
        stampsWeekRes,
        redemptionsWeekRes,
        trendSeriesRes,
        analyticsRes,
        segmentsRes
      ] = await Promise.all([
        supabase.rpc('get_promotion_usage', { p_business_id: rawBusiness.id } as any).catch(() => ({ data: null })),
        supabase.rpc('get_stamps_stats', { p_business_id: rawBusiness.id, p_range: 'today' } as any).catch(() => ({ data: null })),
        supabase.rpc('get_stamps_stats', { p_business_id: rawBusiness.id, p_range: '7d' } as any).catch(() => ({ data: null })),
        supabase.rpc('get_redemptions_stats', { p_business_id: rawBusiness.id, p_range: '7d' } as any).catch(() => ({ data: null })),
        supabase.rpc('get_stamps_timeseries', { p_business_id: rawBusiness.id, p_days: 14 } as any).catch(() => ({ data: null })),
        supabase.rpc('get_customer_analytics', { p_business_id: rawBusiness.id, p_days: 30 } as any).catch(() => ({ data: null })),
        supabase.rpc('get_customer_segments', { p_business_id: rawBusiness.id, p_days: 30 } as any).catch(() => ({ data: null }))
      ])

      if (promoUsageRes?.data) {
        const nameMap: Record<string, string> = {}
        promoList.forEach(p => { nameMap[p.id] = p.name })
        setPromoUsage((promoUsageRes.data as any[]).map((entry: any) => ({
          ...entry,
          name: nameMap[entry.promotion_id] ?? entry.promotion_id
        })))
      } else {
        setPromoUsage([])
      }

      setMetrics({
        stampsToday: stampsTodayRes?.data?.count ?? 0,
        stampsWeek: stampsWeekRes?.data?.count ?? 0,
        redemptionsWeek: redemptionsWeekRes?.data?.count ?? 0,
        topPromo: (() => {
          const usage = (promoUsageRes?.data as any[]) ?? []
          if (!usage.length) return promoList[0]?.name
          const top = [...usage].sort((a, b) => (b.usage_count ?? 0) - (a.usage_count ?? 0))[0]
          return promoList.find(p => p.id === top.promotion_id)?.name ?? top.promotion_id
        })()
      })

      if (trendSeriesRes?.data) {
        setTrendData((trendSeriesRes.data as any[]).map((row: any) => ({
          day: new Date(row.day).toLocaleDateString('es-ES', { day: '2-digit' }),
          stamps: row.stamps_count,
          redemptions: row.redemptions_count
        })))
      } else {
        setTrendData([])
      }

      setCustomerAnalytics(analyticsRes?.data ?? null)
      setCustomerSegments((segmentsRes?.data as any[]) ?? [])

      setBusiness(prev => prev ? {
        ...prev,
        active_promotions: promoList.filter(p => p.is_active).length
      } : prev)
    } catch (error: any) {
      console.error('Error cargando dashboard', error)
      toast.error(error?.message ?? 'Error al cargar el dashboard')
    } finally {
      setLoading(false)
    }
  }, [supabase, promoPage, pageSize, promoFilters, orderBy, orderDir])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    const channel = supabase.channel('owner-promotions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promotions' }, () => {
        loadAll()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, loadAll])

  function handleLocalToggle(id: string, active: boolean) {
    setPromotions(prev => prev.map(p=> p.id===id ? { ...p, is_active: active } : p))
    startTransition(async () => {
      const { togglePromotion } = await import('@/actions/promotions')
      const res = await togglePromotion(id, active)
      if (!res.success) {
        toast.error(res.error || 'Error al actualizar')
        setPromotions(prev => prev.map(p => p.id === id ? { ...p, is_active: !active } : p))
      } else {
        toast.success(active ? 'Promoción activada' : 'Promoción desactivada')
        await loadAll()
      }
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
      await loadAll()
    }
  }

  function handleAppearanceUpdate(update: {
    logo_url?: string
    primary_color?: string
    secondary_color?: string
    background_color?: string
    text_color?: string
    card_title?: string
    card_description?: string
  }) {
    setBusiness(prev => prev ? {
      ...prev,
      logo_url: update.logo_url ?? prev.logo_url ?? null,
      primary_color: update.primary_color ?? prev.primary_color ?? null,
      secondary_color: update.secondary_color ?? prev.secondary_color ?? null,
      background_color: update.background_color ?? prev.background_color ?? null,
      text_color: update.text_color ?? prev.text_color ?? null,
      card_title: update.card_title ?? prev.card_title ?? null,
      card_description: update.card_description ?? prev.card_description ?? null,
    } : prev)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header mejorado */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              {business.logo_url && (
                <img src={business.logo_url} alt="logo" className="h-12 w-12 rounded-lg object-cover" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
                <p className="text-sm text-gray-600">Panel de administración</p>
              </div>
            </div>

            {/* Métricas rápidas en el header */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics?.stampsToday ?? 0}</div>
                <div className="text-xs text-gray-600">Sellos hoy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{metrics?.stampsWeek ?? 0}</div>
                <div className="text-xs text-gray-600">Esta semana</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics?.redemptionsWeek ?? 0}</div>
                <div className="text-xs text-gray-600">Canjes</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegación por pestañas */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600">🏷️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Clientes</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{business.total_customers ?? 0}</dd>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600">🎯</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Sellos</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{business.total_stamps ?? 0}</dd>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600">🏆</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500 truncate">Recompensas Otorgadas</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{business.total_rewards ?? 0}</dd>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600">🎉</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500 truncate">Promociones Activas</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{business.active_promotions ?? 0}</dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Herramientas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <BusinessJoinQR businessId={business.id} businessName={business.name} />
              <UniversalScanner businessId={business.id} />
              <RedeemWalletPass businessId={business.id} />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Uso de Promociones</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={promoUsage.slice(0, 8)}>
                      <XAxis dataKey="name" hide={promoUsage.length > 8} />
                      <YAxis allowDecimals={false} width={30} />
                      <Tooltip />
                      <Bar dataKey="usage_count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia Sellos vs Canjes (14 días)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="day" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="stamps" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="redemptions" stroke="#ef4444" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Actividad reciente */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
              </div>
              <div className="p-6">
                <EventsFeedClient businessId={business.id} initial={[]} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'promotions' && (
          <div className="space-y-8">
            <PromotionForm businessId={business.id} />

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Gestión de Promociones</h3>
                <p className="text-sm text-gray-600 mt-1">Administra todas tus promociones activas e inactivas</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
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
                              <div className="text-xs text-gray-500">Tipo: {p.promo_type} • Creada: {new Date(p.created_at).toLocaleDateString()} {p.ends_at && `• Fin: ${new Date(p.ends_at).toLocaleDateString()}`}</div>
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
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Analytics de Clientes</h3>
              </div>
              <div className="p-6">
                {customerAnalytics ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{customerAnalytics.summary?.new_customers || 0}</div>
                        <div className="text-sm text-gray-600">Nuevos clientes (30d)</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{customerAnalytics.summary?.total_active || 0}</div>
                        <div className="text-sm text-gray-600">Clientes activos</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{customerAnalytics.summary?.avg_stamps_per_active ? Number(customerAnalytics.summary.avg_stamps_per_active).toFixed(1) : 0}</div>
                        <div className="text-sm text-gray-600">Sellos promedio por cliente</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Cargando analytics...</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Segmentos de Clientes</h3>
              </div>
              <div className="p-6">
                {customerSegments.length > 0 ? (
                  <div className="space-y-4">
                    {customerSegments.map((segment: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <div className="font-medium">{segment.segment}</div>
                          <div className="text-sm text-gray-600">{segment.customers} clientes</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">{segment.avg_stamps || 0}</div>
                          <div className="text-xs text-gray-500">sellos promedio</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay datos de segmentos disponibles</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-8">
            <BusinessAppearanceForm
              businessId={business.id}
              businessName={business.name}
              currentAppearance={{
                logo_url: business.logo_url ?? undefined,
                primary_color: business.primary_color ?? undefined,
                secondary_color: business.secondary_color ?? undefined,
                background_color: business.background_color ?? undefined,
                text_color: business.text_color ?? undefined,
                card_title: business.card_title ?? undefined,
                card_description: business.card_description ?? undefined,
              }}
              onUpdate={handleAppearanceUpdate}
            />
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-8">
            <StaffManagement businessId={business.id} />
          </div>
        )}
      </div>
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

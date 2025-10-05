"use client"
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { CampaignWizard } from './CampaignWizard'
import { StaffManagement } from './StaffManagement'
import { BusinessAppearanceForm } from './BusinessAppearanceForm'
import { OverviewSection } from './dashboard/owner/OverviewSection'
import { CustomerDetailDrawer } from './dashboard/owner/CustomerDetailDrawer'
import { RealtimeAlerts } from './dashboard/owner/RealtimeAlerts'
import type { BusinessEventRow } from './EventsFeedClient'
import { getSupabaseClient } from '@/lib/supabaseClient'
import QRCode from 'qrcode'
import toast from 'react-hot-toast'

interface Promotion {
  id: string
  name: string
  promo_type: string
  is_active: boolean
  created_at: string
  ends_at: string | null
  usage_count?: number
  priority?: number | null
  config?: Record<string, any>
}

export interface BusinessSummary {
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

export interface DashboardMetrics {
  stampsToday: number
  stampsWeek: number
  redemptionsWeek: number
  topPromo?: string
  trendLabel?: string
}

export interface PromotionUsage {
  promotion_id: string
  usage_count: number
  name?: string
  pending_rewards?: number
  last_used_at?: string | null
}

export interface TrendDatum {
  day: string
  stamps: number
  redemptions: number
}

export interface CustomerSegment {
  segment: string
  customers: number
  avg_stamps?: number
}

export interface CustomerSummary {
  customer_id: string
  customer_email: string | null
  customer_name?: string | null
  current_stamps: number
  total_rewards: number
  last_stamp_at: string | null
  loyalty_card_id: string
  customer_card_id: string
  total_spent?: number | null
}

export interface CustomerActivityEntry {
  id: string
  occurredAt: string
  label: string
  type: 'event' | 'purchase'
  amount?: number
  currency?: string
  stamps?: number
  description?: string
  metadata?: Record<string, any> | null
}

export interface LiveAlert {
  id: string
  type: string
  message: string
  occurredAt: string
}

export type TabId = 'overview' | 'promotions' | 'customers' | 'appearance' | 'staff'

export function OwnerDashboardClient() {
  const supabase = getSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState<BusinessSummary | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [promoUsage, setPromoUsage] = useState<PromotionUsage[]>([])
  const [trendData, setTrendData] = useState<TrendDatum[]>([])
  const [pending, startTransition] = useTransition()
  const [customerAnalytics, setCustomerAnalytics] = useState<any | null>(null)
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([])
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerSegmentFilter, setCustomerSegmentFilter] = useState<'all' | 'loyal' | 'at-risk' | 'new'>('all')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null)
  const [customerActivity, setCustomerActivity] = useState<CustomerActivityEntry[]>([])
  const [customerActivityLoading, setCustomerActivityLoading] = useState(false)
  const [recentEvents, setRecentEvents] = useState<BusinessEventRow[]>([])
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([])
  const [promoPage, setPromoPage] = useState(1)
  const [promoFilters, setPromoFilters] = useState<{ status?: string; type?: string; search?: string }>({})
  const pageSize = 25
  const [promoTotal, setPromoTotal] = useState<number|undefined>(undefined)
  const [editingPromoId, setEditingPromoId] = useState<string|null>(null)
  const [editDraft, setEditDraft] = useState<{ name?: string; priority?: number; ends_at?: string | null}>({})
  const [orderBy, setOrderBy] = useState<'created_at' | 'priority' | 'ends_at'>('created_at')
  const [orderDir, setOrderDir] = useState<'asc'|'desc'>('desc')
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [qrPromoId, setQrPromoId] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const selectedCustomerRef = useRef<CustomerSummary | null>(null)

  useEffect(() => {
    if (qrPromoId && business) {
      const url = `${window.location.origin}/join/${business.id}/${qrPromoId}`
      QRCode.toDataURL(url, { width: 256, margin: 2 }, (err, dataUrl) => {
        if (!err) {
          setQrDataUrl(dataUrl)
        }
      })
    } else {
      setQrDataUrl(null)
    }
  }, [qrPromoId, business])

  useEffect(() => {
    selectedCustomerRef.current = selectedCustomer
  }, [selectedCustomer])

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = customerSearch.trim().toLowerCase()
    const now = Date.now()

    const filtered = customers.filter((customer) => {
      if (normalizedSearch) {
        const matchesEmail = (customer.customer_email ?? '').toLowerCase().includes(normalizedSearch)
        const matchesName = (customer.customer_name ?? '').toLowerCase().includes(normalizedSearch)
        if (!matchesEmail && !matchesName) {
          return false
        }
      }

      if (customerSegmentFilter === 'loyal') {
        return customer.current_stamps >= 8
      }

      if (customerSegmentFilter === 'at-risk') {
        if (!customer.last_stamp_at) return true
        const lastStamp = new Date(customer.last_stamp_at).getTime()
        const daysSince = (now - lastStamp) / (1000 * 60 * 60 * 24)
        return daysSince >= 30
      }

      if (customerSegmentFilter === 'new') {
        if (!customer.last_stamp_at) return true
        const lastStamp = new Date(customer.last_stamp_at).getTime()
        const daysSince = (now - lastStamp) / (1000 * 60 * 60 * 24)
        return daysSince <= 14
      }

      return true
    })

    return filtered.sort((a, b) => b.current_stamps - a.current_stamps)
  }, [customers, customerSearch, customerSegmentFilter])

  const normalizeEventMetadata = useCallback((value: any): Record<string, any> | null => {
    if (!value) return null
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return { raw: value }
      }
    }
    return value
  }, [])

  const eventMatchesCustomer = useCallback((event: BusinessEventRow, customer: CustomerSummary) => {
    const metadata = event.metadata ?? {}
    const candidateIds = [
      metadata.customer_id,
      metadata.customerId,
      metadata.customer?.id,
      metadata.customer_card_id,
      metadata.customerCardId,
      metadata.customer_card?.id,
    ].filter(Boolean) as string[]

    if (candidateIds.some((id) => id === customer.customer_id || id === customer.customer_card_id)) {
      return true
    }

    const candidateEmails = [
      metadata.customer_email,
      metadata.customer?.email,
      metadata.email,
    ]
      .filter(Boolean)
      .map((email: string) => email.toLowerCase())

    if (customer.customer_email && candidateEmails.includes(customer.customer_email.toLowerCase())) {
      return true
    }

    return false
  }, [])

  const mapEventToActivity = useCallback((event: BusinessEventRow): CustomerActivityEntry => {
    const metadata = event.metadata ?? {}
    const readableType = event.event_type.replace(/_/g, ' ')
    const amount = typeof metadata.amount === 'number' ? metadata.amount : undefined
    const currency = typeof metadata.currency === 'string' ? metadata.currency : undefined
    const stamps = typeof metadata.stamps === 'number'
      ? metadata.stamps
      : typeof metadata.stamps_awarded === 'number'
        ? metadata.stamps_awarded
        : undefined
    const description = (metadata.summary || metadata.message || metadata.description || metadata.reward_title || metadata.reward_description || '') as string

    return {
      id: event.id,
      occurredAt: event.created_at,
      label: readableType.charAt(0).toUpperCase() + readableType.slice(1),
      type: 'event',
      amount,
      currency,
      stamps,
      description: description ? description.trim() : undefined,
      metadata,
    }
  }, [])

  const buildAlertFromEvent = useCallback((event: BusinessEventRow): LiveAlert | null => {
    const metadata = event.metadata ?? {}
    const readableType = event.event_type.replace(/_/g, ' ')
    const capitalizedType = readableType.charAt(0).toUpperCase() + readableType.slice(1)

    let message = metadata.summary || metadata.message || ''
    if (!message) {
      if (metadata.customer_name) {
        message = `${metadata.customer_name} · ${capitalizedType}`
      } else if (metadata.customer_email) {
        message = `${metadata.customer_email} · ${capitalizedType}`
      } else {
        message = capitalizedType
      }
    }

    return {
      id: `${event.id}`,
      type: event.event_type,
      message: message,
      occurredAt: event.created_at,
    }
  }, [])

  const formatLastActivity = useCallback((iso: string | null) => {
    if (!iso) return 'Sin actividad'
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return 'Sin actividad'
    const diffMs = Date.now() - date.getTime()
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (days <= 0) return 'Hoy'
    if (days === 1) return 'Hace 1 día'
    if (days < 30) return `Hace ${days} días`
    return date.toLocaleDateString()
  }, [])

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
        segmentsRes,
        customersRes,
        eventsRes
      ] = await Promise.all([
        supabase.rpc('get_promotion_usage', { p_business_id: rawBusiness.id } as any).catch(() => ({ data: null })),
        supabase.rpc('get_stamps_stats', { p_business_id: rawBusiness.id, p_range: 'today' } as any).catch(() => ({ data: null })),
        supabase.rpc('get_stamps_stats', { p_business_id: rawBusiness.id, p_range: '7d' } as any).catch(() => ({ data: null })),
        supabase.rpc('get_redemptions_stats', { p_business_id: rawBusiness.id, p_range: '7d' } as any).catch(() => ({ data: null })),
        supabase.rpc('get_stamps_timeseries', { p_business_id: rawBusiness.id, p_days: 14 } as any).catch(() => ({ data: null })),
        supabase.rpc('get_customer_analytics', { p_business_id: rawBusiness.id, p_days: 30 } as any).catch(() => ({ data: null })),
        supabase.rpc('get_customer_segments', { p_business_id: rawBusiness.id, p_days: 30 } as any).catch(() => ({ data: null })),
        supabase.rpc('get_customer_dashboard_data', { p_business_id: rawBusiness.id, p_limit: 200 } as any).catch(() => ({ data: [] })),
        supabase
          .from('events')
          .select('id,event_type,created_at,metadata')
          .eq('business_id', rawBusiness.id)
          .order('created_at', { ascending: false })
          .limit(50)
          .catch(() => ({ data: [] }))
      ])

      if (promoUsageRes?.data) {
        const nameMap: Record<string, string> = {}
        promoList.forEach(p => { nameMap[p.id] = p.name })
        const usage = (promoUsageRes.data as any[]).map((entry: any): PromotionUsage => ({
          promotion_id: entry.promotion_id,
          usage_count: entry.usage_count ?? 0,
          name: nameMap[entry.promotion_id] ?? entry.promotion_id,
        }))
        setPromoUsage(usage)
      } else {
        setPromoUsage([])
      }

      setMetrics({
        stampsToday: stampsTodayRes?.data?.count ?? 0,
        stampsWeek: stampsWeekRes?.data?.count ?? 0,
        redemptionsWeek: redemptionsWeekRes?.data?.count ?? 0,
        trendLabel: stampsTodayRes?.data?.trend_label ?? undefined,
        topPromo: (() => {
          const usage = (promoUsageRes?.data as any[]) ?? []
          if (!usage.length) return promoList[0]?.name
          const top = [...usage].sort((a, b) => (b.usage_count ?? 0) - (a.usage_count ?? 0))[0]
          return promoList.find(p => p.id === top.promotion_id)?.name ?? top.promotion_id
        })()
      })

      if (trendSeriesRes?.data) {
        const series = (trendSeriesRes.data as any[]).map((row: any): TrendDatum => ({
          day: new Date(row.day).toLocaleDateString('es-ES', { day: '2-digit' }),
          stamps: row.stamps_count ?? 0,
          redemptions: row.redemptions_count ?? 0,
        }))
        setTrendData(series)
      } else {
        setTrendData([])
      }

      setCustomerAnalytics(analyticsRes?.data ?? null)
      const segments = ((segmentsRes?.data as any[]) ?? []).map((segment: any): CustomerSegment => ({
        segment: segment.segment ?? 'Segmento',
        customers: segment.customers ?? 0,
        avg_stamps: segment.avg_stamps ?? undefined,
      }))
      setCustomerSegments(segments)

      const customerRows = ((customersRes as any)?.data ?? []) as any[]
      setCustomers(customerRows.map((row: any): CustomerSummary => ({
        customer_id: row.customer_id,
        customer_email: row.customer_email ?? null,
        customer_name: row.customer_name ?? null,
        current_stamps: row.current_stamps ?? 0,
        total_rewards: row.total_rewards ?? 0,
        last_stamp_at: row.last_stamp_at ?? null,
        loyalty_card_id: row.loyalty_card_id,
        customer_card_id: row.customer_card_id,
        total_spent: row.total_spent ?? null,
      })))

      const eventsRows = ((eventsRes as any)?.data ?? []) as any[]
      const normalizedEvents: BusinessEventRow[] = eventsRows.map((row: any) => ({
        id: row.id,
        event_type: row.event_type,
        created_at: row.created_at,
        metadata: normalizeEventMetadata(row.metadata),
      }))
      setRecentEvents(normalizedEvents)

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
  }, [supabase, promoPage, pageSize, promoFilters, orderBy, orderDir, normalizeEventMetadata])

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

  useEffect(() => {
    if (!business?.id) return

    const channel = supabase
      .channel(`business-events:${business.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events', filter: `business_id=eq.${business.id}` }, (payload: any) => {
        const eventRow: BusinessEventRow = {
          id: payload.new.id,
          event_type: payload.new.event_type,
          created_at: payload.new.created_at,
          metadata: normalizeEventMetadata(payload.new.metadata),
        }

        setRecentEvents((prev) => [eventRow, ...prev].slice(0, 100))

        const alert = buildAlertFromEvent(eventRow)
        if (alert) {
          setLiveAlerts((prev) => {
            const deduped = prev.filter((item) => item.id !== alert.id)
            return [alert, ...deduped].slice(0, 5)
          })
          setTimeout(() => {
            setLiveAlerts((prev) => prev.filter((item) => item.id !== alert.id))
          }, 20000)
        }

        const currentCustomer = selectedCustomerRef.current
        if (currentCustomer && eventMatchesCustomer(eventRow, currentCustomer)) {
          setCustomerActivity((prev) => {
            const activity = mapEventToActivity(eventRow)
            const deduped = [activity, ...prev.filter((item) => item.id !== activity.id)]
            return deduped.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, business?.id, normalizeEventMetadata, buildAlertFromEvent, eventMatchesCustomer, mapEventToActivity])

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

  const fetchCustomerActivity = useCallback(async (customer: CustomerSummary) => {
    if (!business?.id) return
    setCustomerActivity([])
    setCustomerActivityLoading(true)
    try {
      const [purchasesRes, eventsResDetail] = await Promise.all([
        supabase
          .from('purchases')
          .select('id,amount,currency,stamps_awarded,created_at,items')
          .eq('business_id', business.id)
          .eq('customer_id', customer.customer_id)
          .order('created_at', { ascending: false })
          .limit(25)
          .catch(() => ({ data: [] })),
        supabase
          .from('events')
          .select('id,event_type,created_at,metadata')
          .eq('business_id', business.id)
          .order('created_at', { ascending: false })
          .limit(100)
          .catch(() => ({ data: [] })),
      ])

      const purchaseRows = ((purchasesRes as any)?.data ?? []) as any[]
      const purchaseActivities: CustomerActivityEntry[] = purchaseRows.map((row: any) => ({
        id: row.id,
        occurredAt: row.created_at,
        label: 'Compra registrada',
        type: 'purchase' as const,
        amount: typeof row.amount === 'number' ? row.amount : undefined,
        currency: typeof row.currency === 'string' ? row.currency : undefined,
        stamps: typeof row.stamps_awarded === 'number' ? row.stamps_awarded : undefined,
        description: Array.isArray(row.items) && row.items.length ? `${row.items.length} artículos` : undefined,
        metadata: row,
      }))

      const eventsRowsDetail = ((eventsResDetail as any)?.data ?? []) as any[]
      const normalizedEventRows: BusinessEventRow[] = eventsRowsDetail.map((row: any) => ({
        id: row.id,
        event_type: row.event_type,
        created_at: row.created_at,
        metadata: normalizeEventMetadata(row.metadata),
      }))

      const relevantEvents = normalizedEventRows.filter((event) => eventMatchesCustomer(event, customer))
      const eventActivities = relevantEvents.map(mapEventToActivity)

      const timeline = [...purchaseActivities, ...eventActivities].sort((a, b) => (
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      ))
      setCustomerActivity(timeline)
    } catch (error) {
      console.error('Error cargando detalle de cliente', error)
      toast.error('No se pudo cargar el detalle del cliente')
    } finally {
      setCustomerActivityLoading(false)
    }
  }, [business?.id, supabase, normalizeEventMetadata, eventMatchesCustomer, mapEventToActivity])

  const handleSelectCustomer = useCallback((customer: CustomerSummary) => {
    setSelectedCustomer(customer)
    fetchCustomerActivity(customer)
  }, [fetchCustomerActivity])

  const handleCloseCustomerDrawer = useCallback(() => {
    setSelectedCustomer(null)
    setCustomerActivity([])
  }, [])

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
      } catch (error) {
        console.debug('No se pudo actualizar el uso de promociones en vivo', error)
      }
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
        <RealtimeAlerts
          alerts={liveAlerts}
          onDismiss={(id) => setLiveAlerts((prev) => prev.filter((alert) => alert.id !== id))}
        />

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
          <OverviewSection
            business={business}
            metrics={metrics}
            promoUsage={promoUsage}
            trendData={trendData}
            customerAnalytics={customerAnalytics}
            customerSegments={customerSegments}
            businessId={business.id}
            events={recentEvents}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'promotions' && (
          <div className="space-y-8">
            <CampaignWizard businessId={business.id} />

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Gestión de Promociones</h3>
                <p className="text-sm text-gray-600 mt-1">Administra todas tus promociones activas e inactivas</p>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs items-center">
                    <input
                      placeholder="Buscar"
                      className="border px-2 py-1 rounded"
                      value={promoFilters.search || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setPromoFilters((f) => ({ ...f, search: value || undefined }))
                        setPromoPage(1)
                      }}
                    />
                    <select
                      className="border px-2 py-1 rounded"
                      value={promoFilters.status || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setPromoFilters((f) => ({ ...f, status: value || undefined }))
                        setPromoPage(1)
                      }}
                    >
                      <option value="">Estado</option>
                      <option value="active">Activas</option>
                      <option value="inactive">Inactivas</option>
                      <option value="upcoming">Próximas</option>
                      <option value="expired">Expiradas</option>
                    </select>
                    <select
                      className="border px-2 py-1 rounded"
                      value={promoFilters.type || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setPromoFilters((f) => ({ ...f, type: value || undefined }))
                        setPromoPage(1)
                      }}
                    >
                      <option value="">Tipo</option>
                      <option value="extra_stamp">Extra</option>
                      <option value="multiplier">Multiplicador</option>
                      <option value="reward_boost">Reward Boost</option>
                    </select>
                    <select
                      className="border px-2 py-1 rounded"
                      value={orderBy}
                      onChange={(e) => {
                        const value = e.target.value as 'created_at' | 'priority' | 'ends_at'
                        setOrderBy(value)
                        setPromoPage(1)
                      }}
                    >
                      <option value="created_at">Fecha de creación</option>
                      <option value="priority">Prioridad</option>
                      <option value="ends_at">Fecha de fin</option>
                    </select>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs"
                      onClick={() => {
                        setOrderDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                        setPromoPage(1)
                      }}
                    >
                      {orderDir === 'asc' ? 'Asc ↑' : 'Desc ↓'}
                    </button>
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
                              <div className="text-xs text-gray-500">
                                Tipo: {p.promo_type} • Creada: {new Date(p.created_at).toLocaleDateString()} {p.ends_at && `• Fin: ${new Date(p.ends_at).toLocaleDateString()} `}
                                • Prioridad: {p.priority ?? '—'}
                              </div>
                            </>
                          )}
                        </div>
                        {editingPromoId !== p.id && (
                          <div className="flex flex-col gap-1 items-end">
                            <button disabled={pending} onClick={()=>handleLocalToggle(p.id, !p.is_active)} className={`text-[11px] px-2 py-1 rounded border ${p.is_active ? 'bg-green-600 text-white' : 'bg-white hover:bg-gray-50'}`}>{p.is_active ? 'Desactivar' : 'Activar'}</button>
                            <div className="flex gap-1">
                              <button onClick={()=> { setEditingPromoId(p.id); setEditDraft({ name: p.name, priority: (p as any).priority, ends_at: p.ends_at }) }} className="text-[11px] px-2 py-1 rounded border">Editar</button>
                              <button onClick={()=> performDelete(p.id)} className="text-[11px] px-2 py-1 rounded border text-red-600">Borrar</button>
                              <button onClick={()=> setQrPromoId(p.id)} className="text-[11px] px-2 py-1 rounded border bg-blue-600 text-white">Ver QR</button>
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
              <div className="p-6 border-b border-gray-200 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Clientes</h3>
                  <p className="text-sm text-gray-600 mt-1">Selecciona un cliente para ver su historial detallado.</p>
                </div>
                <span className="text-xs text-gray-500">{filteredCustomers.length} de {customers.length}</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <input
                    placeholder="Buscar por nombre o email"
                    className="border px-3 py-2 rounded"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  <select
                    className="border px-3 py-2 rounded"
                    value={customerSegmentFilter}
                    onChange={(e) => setCustomerSegmentFilter(e.target.value as typeof customerSegmentFilter)}
                  >
                    <option value="all">Todos</option>
                    <option value="loyal">Leales (≥8 sellos)</option>
                    <option value="at-risk">En riesgo (≥30 días sin visita)</option>
                    <option value="new">Nuevos (últimos 14 días)</option>
                  </select>
                  <button
                    type="button"
                    className="inline-flex items-center rounded border px-3 py-2 text-xs"
                    onClick={() => {
                      setCustomerSearch('')
                      setCustomerSegmentFilter('all')
                    }}
                  >
                    Limpiar filtros
                  </button>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500">
                        <th className="px-4 py-3 font-semibold">Cliente</th>
                        <th className="px-4 py-3 font-semibold text-right">Sellos</th>
                        <th className="px-4 py-3 font-semibold text-right">Recompensas</th>
                        <th className="px-4 py-3 font-semibold text-right">Última visita</th>
                        <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredCustomers.map((customer) => {
                        const displayName = customer.customer_name || customer.customer_email || 'Cliente sin nombre'
                        const email = customer.customer_email || '—'
                        return (
                          <tr
                            key={customer.customer_id}
                            className="cursor-pointer bg-white transition hover:bg-blue-50/60"
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">{displayName}</div>
                              <div className="text-[11px] text-gray-500">{email}</div>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900">{customer.current_stamps}</td>
                            <td className="px-4 py-3 text-right text-gray-700">{customer.total_rewards}</td>
                            <td className="px-4 py-3 text-right text-gray-700">{formatLastActivity(customer.last_stamp_at)}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSelectCustomer(customer)
                                }}
                              >
                                Ver detalle
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                      {filteredCustomers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                            {customers.length === 0
                              ? 'Aún no hay clientes registrados.'
                              : 'No encontramos clientes con los filtros seleccionados.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

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
                    {customerSegments.map((segment, index) => (
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
      {qrPromoId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Código QR de la Promoción</h3>
            {qrDataUrl ? (
              <div className="text-center">
                <img src={qrDataUrl} alt="QR Code" className="mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">Promotion ID: {qrPromoId}</p>
                <p className="text-xs text-gray-500 mb-4">Escanea este QR para unirte a la promoción</p>
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/join/${business.id}/${qrPromoId}`)}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded mr-2"
                >
                  Copiar Enlace
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = qrDataUrl
                    link.download = `qr-promotion-${qrPromoId}.png`
                    link.click()
                  }}
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded"
                >
                  Descargar QR
                </button>
              </div>
            ) : (
              <p className="text-center">Generando QR...</p>
            )}
            <button
              onClick={() => setQrPromoId(null)}
              className="mt-4 w-full bg-gray-600 text-white py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      <CustomerDetailDrawer
        open={Boolean(selectedCustomer)}
        customer={selectedCustomer}
        activity={customerActivity}
        loading={customerActivityLoading}
        onClose={handleCloseCustomerDrawer}
      />
    </div>
  )
}

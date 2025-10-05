import { cache } from 'react'
import { getMarketingSupabase } from './marketingSupabase'

export interface LandingStat {
  metric: string
  label: string
  value: string
  trend?: number
  trendLabel?: string
}

export interface Testimonial {
  id: string
  author: string
  role: string
  quote: string
  avatarUrl?: string
  company?: string
  highlight?: string
}

export interface PricingPlan {
  id: string
  name: string
  priceMonthly: number
  priceYearly: number
  ctaLabel: string
  isPopular?: boolean
  features: string[]
}

export interface UseCaseContent {
  id: string
  vertical: string
  headline: string
  description: string
  benefits: string[]
  statHighlight: string
  assetUrl?: string
}

export interface FeatureHighlight {
  id: string
  title: string
  description: string
  icon: string
}

export interface AnalyticsCallout {
  id: string
  title: string
  description: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export interface AutomationStep {
  id: string
  step: number
  title: string
  description: string
  detail: string
}

const FALLBACK_STATS: LandingStat[] = [
  {
    metric: 'total_stamps',
    label: 'Sellos emitidos',
    value: '128K+',
    trend: 28,
    trendLabel: 'vs mes anterior',
  },
  {
    metric: 'rewards_redeemed',
    label: 'Recompensas canjeadas',
    value: '42K',
    trend: 19,
    trendLabel: 'clientes felices',
  },
  {
    metric: 'active_merchants',
    label: 'Comercios activos',
    value: '860',
    trend: 12,
    trendLabel: 'nuevos este mes',
  },
]

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: 'cafeteria-sol',
    author: 'María Gómez',
    role: 'Dueña · Cafetería Sol',
    quote:
      '“En 3 meses multiplicamos por dos los clientes que vuelven cada semana. Las recompensas digitales nos dieron agilidad y datos reales.”',
    highlight: '+54% retorno',
  },
  {
    id: 'brasa-madrid',
    author: 'Carlos Prieto',
    role: 'Gerente · Brasa Madrid',
    quote:
      '“Los reportes diarios nos dicen qué promociones funcionan. No volvemos a las tarjetas de cartón.”',
    highlight: 'ROI 6.4x',
  },
  {
    id: 'fit-club',
    author: 'Laura Fernández',
    role: 'Directora · Fit Club Studios',
    quote:
      '“Segmentamos por visitas y lanzamos campañas en un clic. El equipo se centra en clientes, no en Excel.”',
    highlight: '-32% churn',
  },
]

const FALLBACK_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 39,
    priceYearly: 390,
    ctaLabel: 'Comenzar gratis',
    features: [
      'Hasta 1.500 clientes activos',
      'Sellos digitales ilimitados',
      'App web para el personal',
      'Informes semanales básicos',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    priceMonthly: 89,
    priceYearly: 890,
    ctaLabel: 'Solicitar demo',
    isPopular: true,
    features: [
      'Segmentos automáticos (activos, en riesgo)',
      'Automatizaciones de campañas',
      'Widget de referidos',
      'Integraciones POS + eCommerce',
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    priceMonthly: 179,
    priceYearly: 1790,
    ctaLabel: 'Hablar con ventas',
    features: [
      'Soporte dedicado 24/7',
      'API + Webhooks ilimitados',
      'Branding avanzado y espacios multi-local',
      'Consultoría trimestral de retención',
    ],
  },
]

const FALLBACK_USE_CASES: UseCaseContent[] = [
  {
    id: 'cafeterias',
    vertical: 'Cafeterías',
    headline: 'Convierte cafés en visitas recurrentes',
    description:
      'Automatiza el sello del café número 10, lanza campañas en horas valle y felicita cumpleaños con un espresso gratis.',
    benefits: [
      'Sellos desde el TPV o QR en mostrador',
      'Promociones 2x1 configuradas en 2 minutos',
      'Dashboard diario con tickets medios',
    ],
    statHighlight: '+32% frecuencia / 90 días',
  },
  {
    id: 'restaurantes',
    vertical: 'Restaurantes',
    headline: 'Llena mesas en días tranquilos',
    description:
      'Identifica clientes VIP y envía ofertas de fidelización antes del fin de semana. Controla canjes y márgenes en tiempo real.',
    benefits: [
      'Segmentos listos (VIP, inactivos, primera visita)',
      'Campañas con fecha y hora programada',
      'Integración con Square & Lightspeed',
    ],
    statHighlight: '+18% ticket promedio',
  },
  {
    id: 'salones',
    vertical: 'Salones de belleza',
    headline: 'Agenda llena y clientes felices',
    description:
      'Premia visitas consecutivas, recuerda citas y ofrece upgrades exclusivos mediante wallet pass personalizado.',
    benefits: [
      'Wallet pass con tu branding en 5 minutos',
      'Sellos automáticos por código de personal',
      'Alertas cuando una clienta lleva 30 días sin volver',
    ],
    statHighlight: '-25% cancelaciones',
  },
  {
    id: 'gimnasios',
    vertical: 'Gimnasios',
    headline: 'Reduce la rotación de socios',
    description:
      'Diseña retos mensuales, gamifica el progreso y analiza la asistencia en cada centro.',
    benefits: [
      'Retos con insignias digitales',
      'Integración con lectores NFC',
      'Reportes de asistencia por franja horaria',
    ],
    statHighlight: '+41% permanencia anual',
  },
]

const FALLBACK_FEATURE_HIGHLIGHTS: FeatureHighlight[] = [
  {
    id: 'qr-pos',
    title: 'Sellos desde POS o QR',
    description:
      'Aplica sellos desde el TPV, tablet o QR en mostrador. Tus clientes reciben el avance al instante en su wallet digital.',
    icon: 'QrCode',
  },
  {
    id: 'staff-pin',
    title: 'Control por roles y PIN',
    description:
      'Cada miembro del equipo tiene su PIN. Define permisos por rol y evita canjes no autorizados.',
    icon: 'KeyRound',
  },
  {
    id: 'reward-playbooks',
    title: 'Playbooks pre-configurados',
    description:
      'Activa campañas probadas como “10 cafés” o “Brunch VIP” en dos clics y monitoriza su rendimiento.',
    icon: 'Sparkles',
  },
]

const FALLBACK_ANALYTICS_CALLOUTS: AnalyticsCallout[] = [
  {
    id: 'segmentos',
    title: 'Segmentos automáticos',
    description: 'Detectamos clientes en riesgo y VIP en base a visitas, ticket y frecuencia.',
    position: 'top-left',
  },
  {
    id: 'proyeccion',
    title: 'Proyección de ingresos',
    description: 'Calculamos el impacto estimado de tus campañas de sellos en tiempo real.',
    position: 'bottom-right',
  },
]

const FALLBACK_AUTOMATION_STEPS: AutomationStep[] = [
  {
    id: 'trigger',
    step: 1,
    title: 'Define el disparador',
    description: 'Selecciona eventos como “3 visitas sin volver” o “cumpleaños en 7 días”.',
    detail: 'Basado en datos reales de sellos y visitas, sin importar el canal.',
  },
  {
    id: 'segment',
    step: 2,
    title: 'Elige el segmento',
    description: 'Filtra por ticket medio, última visita, local o tipo de cliente.',
    detail: 'Usa segmentos preconstruidos o crea uno personalizado en segundos.',
  },
  {
    id: 'reward',
    step: 3,
    title: 'Lanza la recompensa',
    description: 'Programa un beneficio con caducidad y seguimiento automático.',
    detail: 'Envía wallet push, email o SMS y visualiza los resultados al instante.',
  },
]

export const fetchLandingStats = cache(async (): Promise<LandingStat[]> => {
  const supabase = await getMarketingSupabase()
  if (!supabase) return FALLBACK_STATS

  try {
    const { data, error } = await (supabase as any)
      .from('landing_stats')
      .select('metric, value, trend, trend_label')
      .order('metric', { ascending: true })

    if (error || !data) {
      return FALLBACK_STATS
    }

    return data.map((row: any) => ({
      metric: row.metric,
      value: row.value,
      trend: row.trend ?? undefined,
      trendLabel: row.trend_label ?? undefined,
      label: row.metric
        .split('_')
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
    }))
  } catch (error) {
    console.warn('⚠️ Error fetchLandingStats', error)
    return FALLBACK_STATS
  }
})

export const fetchTestimonials = cache(async (): Promise<Testimonial[]> => {
  const supabase = await getMarketingSupabase()
  if (!supabase) return FALLBACK_TESTIMONIALS

  try {
    const { data, error } = await (supabase as any)
      .from('testimonials')
      .select('id, author, role, quote, avatar_url, company, highlight')
      .order('display_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return FALLBACK_TESTIMONIALS
    }

    return data.map((row: any) => ({
      id: row.id,
      author: row.author,
      role: row.company ? `${row.role} · ${row.company}` : row.role,
      quote: row.quote,
      avatarUrl: row.avatar_url ?? undefined,
      highlight: row.highlight ?? undefined,
      company: row.company ?? undefined,
    }))
  } catch (error) {
    console.warn('⚠️ Error fetchTestimonials', error)
    return FALLBACK_TESTIMONIALS
  }
})

export const fetchPricingPlans = cache(async (): Promise<PricingPlan[]> => {
  const supabase = await getMarketingSupabase()
  if (!supabase) return FALLBACK_PLANS

  try {
    const { data, error } = await (supabase as any)
      .from('pricing_plans')
      .select('id, name, price_monthly, price_yearly, features, cta_label, is_popular')
      .order('display_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return FALLBACK_PLANS
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      priceMonthly: row.price_monthly,
      priceYearly: row.price_yearly,
      ctaLabel: row.cta_label,
      isPopular: row.is_popular ?? false,
      features: Array.isArray(row.features) ? row.features : [],
    }))
  } catch (error) {
    console.warn('⚠️ Error fetchPricingPlans', error)
    return FALLBACK_PLANS
  }
})

export const fetchUseCases = cache(async (): Promise<UseCaseContent[]> => {
  const supabase = await getMarketingSupabase()
  if (!supabase) return FALLBACK_USE_CASES

  try {
    const { data, error } = await (supabase as any)
      .from('use_case_content')
      .select('id, vertical, headline, description, benefits, stat_highlight, asset_url')
      .order('display_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return FALLBACK_USE_CASES
    }

    return data.map((row: any) => ({
      id: row.id,
      vertical: row.vertical,
      headline: row.headline,
      description: row.description,
      benefits: row.benefits ?? [],
      statHighlight: row.stat_highlight ?? '',
      assetUrl: row.asset_url ?? undefined,
    }))
  } catch (error) {
    console.warn('⚠️ Error fetchUseCases', error)
    return FALLBACK_USE_CASES
  }
})

export const fetchFeatureHighlights = cache(async (): Promise<FeatureHighlight[]> => {
  const supabase = await getMarketingSupabase()
  if (!supabase) return FALLBACK_FEATURE_HIGHLIGHTS

  try {
    const { data, error } = await (supabase as any)
      .from('feature_highlights')
      .select('id, title, description, icon')
      .order('display_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return FALLBACK_FEATURE_HIGHLIGHTS
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      icon: row.icon ?? 'Sparkles',
    }))
  } catch (error) {
    console.warn('⚠️ Error fetchFeatureHighlights', error)
    return FALLBACK_FEATURE_HIGHLIGHTS
  }
})

export const fetchAnalyticsCallouts = cache(async (): Promise<AnalyticsCallout[]> => {
  const supabase = await getMarketingSupabase()
  if (!supabase) return FALLBACK_ANALYTICS_CALLOUTS

  try {
    const { data, error } = await (supabase as any)
      .from('analytics_callouts')
      .select('id, title, description, position')
      .order('display_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return FALLBACK_ANALYTICS_CALLOUTS
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      position: row.position ?? 'top-right',
    }))
  } catch (error) {
    console.warn('⚠️ Error fetchAnalyticsCallouts', error)
    return FALLBACK_ANALYTICS_CALLOUTS
  }
})

export const fetchAutomationSteps = cache(async (): Promise<AutomationStep[]> => {
  const supabase = await getMarketingSupabase()
  if (!supabase) return FALLBACK_AUTOMATION_STEPS

  try {
    const { data, error } = await (supabase as any)
      .from('automation_steps')
      .select('id, step, title, description, detail')
      .order('step', { ascending: true })

    if (error || !data || data.length === 0) {
      return FALLBACK_AUTOMATION_STEPS
    }

    return data.map((row: any) => ({
      id: row.id,
      step: row.step,
      title: row.title,
      description: row.description,
      detail: row.detail ?? '',
    }))
  } catch (error) {
    console.warn('⚠️ Error fetchAutomationSteps', error)
    return FALLBACK_AUTOMATION_STEPS
  }
})

"use client"

import React, { type CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { WalletPassCard } from './WalletPassCard'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useAuth } from '@/app/context/AuthContext'

type Promotion = {
  id: string
  name: string
  description?: string | null
  promo_type: string
  ends_at?: string | null
  reward_description?: string | null
}

type JoinSuccessPayload = {
  userId: string
  existingUser: boolean
  profile: {
    name?: string | null
    email?: string | null
    phone?: string | null
  }
  promotion: {
    id: string
    name: string
    description: string | null
    reward_description: string | null
    ends_at: string | null
  }
  business: {
    id: string
    name: string
    logo_url: string | null
    primary_color: string | null
    secondary_color: string | null
    background_color: string | null
    text_color: string | null
  }
  loyaltyCard: {
    id: string
    name: string | null
    description: string | null
    stamps_required: number | null
    reward_description: string | null
  }
  promotionId: string | null
  customerCard: {
    id: string
    current_stamps: number
    total_rewards_earned: number
    last_stamp_at: string | null
    loyalty_card: any
  }
  walletPass: {
    id: string | null
    qr_token: string | null
    reused: boolean
    pass_type: string
    usage_count: number
    last_used_at: string | null
    promotion_id?: string | null
  }
  downloadUrl: string | null
  metrics: {
    currentStamps: number
    stampsRequired: number
    remainingStamps: number
    totalRewardsEarned: number
    pendingRewards: number
    promotionUsageCount?: number
  }
  pendingRewards: Array<{
    id: string
    reward_description: string | null
    reward_type: string
    is_redeemed: boolean | null
    is_claimed: boolean | null
    created_at: string
    redeemed_at: string | null
  }>
}

type JoinResponse =
  | { success: true; data: JoinSuccessPayload }
  | { success: false; error: string; details?: string }

type AutoJoinPayload = {
  businessId: string
  promotionId?: string | null
  timestamp: number
}

const AUTO_JOIN_SESSION_KEY = 'stampit:auto-join'
const AUTO_JOIN_MAX_AGE_MS = 5 * 60 * 1000

interface QuickJoinFormProps {
  businessId: string
  businessName: string
  promotion: Promotion
  loyaltyCard?: {
    name: string | null
    description: string | null
    stamps_required: number | null
    reward_description: string | null
  } | null
  theme?: {
    primary?: string
    accent?: string
    background?: string
    surface?: string
    text?: string
    textMuted?: string
    border?: string
  }
}

function humanizeError(code: string) {
  switch (code) {
    case 'identifier_required':
      return 'Necesitamos tu email o teléfono para encontrarte.'
    case 'business_not_found':
      return 'No encontramos el negocio, revisa el enlace.'
    case 'no_loyalty_card':
      return 'Este comercio aún no tiene tarjeta configurada.'
    case 'create_user_failed':
      return 'No pudimos crear tu perfil. Inténtalo de nuevo en unos segundos.'
    case 'ensure_failed':
    case 'card_not_created':
      return 'No se pudo generar tu tarjeta. Intenta de nuevo.'
    default:
      return code
  }
}

// Helper function to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '')
  const r = parseInt(normalized.substring(0, 2), 16)
  const g = parseInt(normalized.substring(2, 4), 16)
  const b = parseInt(normalized.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function clearSupabaseAuthCookies() {
  if (typeof window === 'undefined') return
  const cookies = document.cookie.split(';')
  const expiry = new Date(0).toUTCString()
  cookies.forEach((cookie) => {
    const [rawName] = cookie.trim().split('=')
    if (!rawName) return
    if (rawName.startsWith('sb-')) {
      document.cookie = `${rawName}=; expires=${expiry}; path=/`
    }
  })

  try {
    const storage = window.localStorage
    const keysToRemove: string[] = []
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index)
      if (key && key.startsWith('sb-')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => {
      storage.removeItem(key)
    })
  } catch (storageError) {
    console.warn('⚠️ Error al limpiar el almacenamiento local de Supabase', storageError)
  }
}

function persistAutoJoinPayload(payload: AutoJoinPayload) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(AUTO_JOIN_SESSION_KEY, JSON.stringify(payload))
  } catch (storageError) {
    console.warn('⚠️ No se pudo guardar el estado de auto-join', storageError)
  }
}

function readAutoJoinPayload(): AutoJoinPayload | null {
  if (typeof window === 'undefined') return null
  const raw = window.sessionStorage.getItem(AUTO_JOIN_SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AutoJoinPayload
  } catch (parseError) {
    console.warn('⚠️ Estado de auto-join inválido, limpiando…', parseError)
    window.sessionStorage.removeItem(AUTO_JOIN_SESSION_KEY)
    return null
  }
}

function clearAutoJoinPayload() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(AUTO_JOIN_SESSION_KEY)
}

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export function QuickJoinForm({
  businessId,
  businessName,
  promotion,
  loyaltyCard: _loyaltyCard,
  theme: propTheme
}: QuickJoinFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  
  // Estados principales
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<JoinSuccessPayload | null>(null)
  const [showManualForm, setShowManualForm] = useState(false)
  const [autoJoinPayload, setAutoJoinPayload] = useState<AutoJoinPayload | null>(null)
  
  useEffect(() => {
    if (!user) return

    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>

    const inferredEmail =
      user.email ??
      (typeof metadata.email === 'string' ? metadata.email : undefined) ??
      (typeof metadata.email_address === 'string' ? metadata.email_address : undefined)

    const inferredPhone =
      (typeof metadata.phone === 'string' ? metadata.phone : undefined) ??
      (typeof metadata.phone_number === 'string' ? metadata.phone_number : undefined)

    const fullName =
      (typeof metadata.full_name === 'string' ? metadata.full_name : undefined) ??
      (typeof metadata.name === 'string' ? metadata.name : undefined)

    const inferredFirstName =
      (typeof metadata.given_name === 'string' ? metadata.given_name : undefined) ??
      (typeof metadata.first_name === 'string' ? metadata.first_name : undefined) ??
      (fullName ? fullName.split(' ')[0] : undefined)

    const inferredLastName =
      (typeof metadata.family_name === 'string' ? metadata.family_name : undefined) ??
      (typeof metadata.last_name === 'string' ? metadata.last_name : undefined) ??
      (fullName ? fullName.split(' ').slice(1).join(' ') || undefined : undefined)

    if (inferredEmail && !email) setEmail(inferredEmail)
    if (inferredPhone && !phone) setPhone(inferredPhone)
    if (inferredFirstName && !firstName) setFirstName(inferredFirstName)
    if (inferredLastName && !lastName) setLastName(inferredLastName)
  }, [user, email, phone, firstName, lastName])

  // Theme con valores por defecto
  const theme = useMemo(() => {
    const defaults = {
      primary: '#4f46e5',
      accent: '#8b5cf6',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1f2937',
      textMuted: '#6b7280',
      border: '#e5e7eb'
    }
    return {
      primary: propTheme?.primary || defaults.primary,
      accent: propTheme?.accent || defaults.accent,
      background: propTheme?.background || defaults.background,
      surface: propTheme?.surface || defaults.surface,
      text: propTheme?.text || defaults.text,
      textMuted: propTheme?.textMuted || defaults.textMuted,
      border: propTheme?.border || defaults.border
    }
  }, [propTheme])

  const disabled = loading
  
  const googleDisabled = loading
  
  const googleButtonLabel = user ? 'Cambiar de cuenta' : 'Continuar con Google'

  const rewardDescription = useMemo(() => {
    if (promotion.reward_description && promotion.reward_description.trim().length > 0) {
      return promotion.reward_description
    }
    if (_loyaltyCard?.reward_description && _loyaltyCard.reward_description.trim().length > 0) {
      return _loyaltyCard.reward_description
    }
    if (result?.pendingRewards?.length) {
      return result.pendingRewards[0]?.reward_description ?? null
    }
    return null
  }, [promotion.reward_description, _loyaltyCard?.reward_description, result?.pendingRewards])

  const stampsRequired = useMemo(() => {
    if (typeof _loyaltyCard?.stamps_required === 'number' && _loyaltyCard.stamps_required > 0) {
      return _loyaltyCard.stamps_required
    }
    if (typeof result?.metrics?.stampsRequired === 'number' && result.metrics.stampsRequired > 0) {
      return result.metrics.stampsRequired
    }
    return null
  }, [_loyaltyCard?.stamps_required, result?.metrics?.stampsRequired])

  // Handler principal de envío del formulario
  const runJoin = useCallback(async () => {
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()
    const trimmedFirstName = firstName.trim()
    const trimmedLastName = lastName.trim()

    const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>

    const metaEmail =
      user?.email ??
      (typeof metadata.email === 'string' ? metadata.email : undefined) ??
      (typeof metadata.email_address === 'string' ? metadata.email_address : undefined) ??
      ''

    const metaPhone =
      (typeof metadata.phone === 'string' ? metadata.phone : undefined) ??
      (typeof metadata.phone_number === 'string' ? metadata.phone_number : undefined) ??
      ''

    const metaFullName =
      (typeof metadata.full_name === 'string' ? metadata.full_name : undefined) ??
      (typeof metadata.name === 'string' ? metadata.name : undefined) ??
      ''

    let metaFirstName =
      (typeof metadata.given_name === 'string' ? metadata.given_name : undefined) ??
      (typeof metadata.first_name === 'string' ? metadata.first_name : undefined) ??
      ''

    let metaLastName =
      (typeof metadata.family_name === 'string' ? metadata.family_name : undefined) ??
      (typeof metadata.last_name === 'string' ? metadata.last_name : undefined) ??
      ''

    if (!metaFirstName && metaFullName) {
      const [firstWord, ...rest] = metaFullName.split(' ')
      metaFirstName = firstWord ?? ''
      metaLastName = rest.join(' ')
    }

    const effectiveEmail = trimmedEmail || metaEmail
    const effectivePhone = trimmedPhone || metaPhone
    const effectiveFirstName = trimmedFirstName || metaFirstName
    const effectiveLastName = trimmedLastName || metaLastName

    if (!effectiveEmail && !effectivePhone) {
      setError('Necesitas indicar al menos tu email o teléfono')
      return false
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/join/${businessId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: effectiveEmail || undefined,
          phone: effectivePhone || undefined,
          firstName: effectiveFirstName || undefined,
          lastName: effectiveLastName || undefined,
          promotionId: promotion.id
        })
      })

      const json: JoinResponse = await response.json()

      if (!response.ok) {
        if (!json.success && 'error' in json) {
          setError(humanizeError(json.error))
        } else {
          setError('No pudimos completar la solicitud. Inténtalo nuevamente.')
        }
        console.warn('Join error', json)
        return false
      }

      if (!json.success && 'error' in json) {
        setError(humanizeError(json.error))
        return false
      }

      setResult(json.data)
      router.prefetch(`/join/${businessId}`)

      // Generar pase de Apple Wallet si es iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      if (isIOS && json.data.walletPass?.qr_token) {
        try {
          const supabase = getSupabaseClient()
          const applePassResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-apple-pass`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabase.supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: json.data.userId,
              qrCode: json.data.walletPass.qr_token,
              businessName: json.data.business.name,
              reward: json.data.loyaltyCard.reward_description || 'Recompensa',
            }),
          })
          if (applePassResponse.ok) {
            const blob = await applePassResponse.blob()
            const applePassUrl = URL.createObjectURL(blob)
            // Actualizar result con el nuevo downloadUrl
            setResult(prev => prev ? { ...prev, downloadUrl: applePassUrl } : prev)
          }
        } catch (appleError) {
          console.warn('Error generando pase de Apple:', appleError)
        }
      }

      return true
    } catch (err: any) {
      console.error('Join request failed', err)
      setError('No pudimos completar la solicitud. Comprueba tu conexión e inténtalo de nuevo.')
      return false
    } finally {
      setLoading(false)
    }
  }, [
    businessId,
    email,
    phone,
    firstName,
    lastName,
    promotion.id,
    user,
    router
  ])
  
  // Wrapper para compatibilidad
  const handleSubmit = useCallback(async () => {
    await runJoin()
  }, [runJoin])
  
  // Handler para Google OAuth
  const handleContinueWithGoogle = useCallback(async (e?: React.MouseEvent) => {
    // Prevenir comportamiento por defecto inmediatamente
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (googleDisabled) return
    
    // NO actualizar estados antes de redirigir - eso causa re-renders que cancelan la navegación
    
    try {
      const supabase = getSupabaseClient()

      try {
        if (user) {
          await supabase.auth.signOut({ scope: 'global' })
        }
      } catch (signOutError) {
        console.warn('⚠️ Error al cerrar sesión previa de Supabase', signOutError)
      }
      clearSupabaseAuthCookies()

      persistAutoJoinPayload({
        businessId,
        promotionId: promotion.id,
        timestamp: Date.now()
      })

      const redirectTo = `${window.location.origin}/auth/callback?next=/join/${businessId}`
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Iniciando OAuth flow...')
        console.log('🔍 Configuración OAuth:', {
          businessId,
          redirectTo,
          origin: window.location.origin
        })
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          scopes: 'profile email',
          queryParams: {
            prompt: 'select_account consent',
            access_type: 'online',
            include_granted_scopes: 'true'
          }
        }
      })
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 Respuesta de OAuth:', { data, error })
      }

      if (error) {
        console.error('❌ OAuth error:', error)
        setError(`Error de Google: ${error.message}`)
        return
      }
      
      if (!data?.url) {
        console.warn('⚠️ No URL received from OAuth:', data)
        setError('No se pudo obtener la URL de autenticación')
        return
      }

      // Redirigir INMEDIATAMENTE sin actualizar ningún estado
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Redirigiendo a Google...')
        console.log('🔗 URL destino:', data.url)
      }
      
      // La redirección debe ser lo ÚLTIMO que se ejecute
      // Usar replace para que no se pueda volver atrás y forzar la navegación
      window.location.replace(data.url)
      
    } catch (err) {
      console.error('💥 OAuth exception:', err)
      setError('No pudimos iniciar sesión con Google. Intenta nuevamente en unos segundos.')
    }
  }, [businessId, googleDisabled, promotion.id, user])
  
  useEffect(() => {
    const payload = readAutoJoinPayload()
    if (!payload) return

    const isExpired = Date.now() - payload.timestamp > AUTO_JOIN_MAX_AGE_MS
    const isDifferentBusiness = payload.businessId !== businessId
    const isDifferentPromotion = payload.promotionId !== promotion.id

    if (isExpired || isDifferentBusiness || isDifferentPromotion) {
      clearAutoJoinPayload()
      return
    }

    setAutoJoinPayload(payload)
  }, [businessId, promotion.id])

  useEffect(() => {
    if (!autoJoinPayload) return
    if (loading) return
    if (result) return
    if (!user) return

    clearAutoJoinPayload()
    setAutoJoinPayload(null)

    void runJoin()
  }, [autoJoinPayload, loading, result, user, runJoin])

  useEffect(() => {
    if (!user) return
    if (loading) return
    if (result) return
    if (autoJoinPayload) return

    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>
    const resolvedEmail = (
      email ||
      user.email ||
      (typeof metadata.email === 'string' ? metadata.email : undefined) ||
      (typeof metadata.email_address === 'string' ? metadata.email_address : undefined) ||
      ''
    ).trim()
    const resolvedPhone = (
      phone ||
      (typeof metadata.phone === 'string' ? metadata.phone : undefined) ||
      (typeof metadata.phone_number === 'string' ? metadata.phone_number : undefined) ||
      ''
    ).trim()

    if (!resolvedEmail && !resolvedPhone) return

    void runJoin()
  }, [user, loading, result, autoJoinPayload, email, phone, runJoin])
  // Effect para limpiar resultado si el usuario cambia
  useEffect(() => {
    if (!user) {
      setResult(null)
    }
  }, [user])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div
        className="rounded-lg border p-4 sm:p-6 shadow-sm"
        style={{ borderColor: theme.border, backgroundColor: theme.surface }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2" style={{ color: theme.text }}>
            <h3 className="text-lg font-semibold">Promoción seleccionada</h3>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Activarás la tarjeta asociada a esta promoción específica.
            </p>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{promotion.name}</p>
              {promotion.description && (
                <p style={{ color: theme.textMuted }}>{promotion.description}</p>
              )}
              {rewardDescription && (
                <p>
                  <span className="font-medium">Recompensa:</span>{' '}
                  {rewardDescription}
                </p>
              )}
              {stampsRequired && (
                <p>
                  <span className="font-medium">Sellos necesarios:</span> {stampsRequired}
                </p>
              )}
            </div>
          </div>
          {promotion.ends_at && (
            <div
              className="rounded-md border px-3 py-2 text-xs font-medium"
              style={{
                borderColor: hexToRgba(theme.accent, 0.4),
                backgroundColor: hexToRgba(theme.accent, 0.08),
                color: theme.accent
              }}
            >
              Disponible hasta {new Date(promotion.ends_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Identificación */}
      <div
        className="rounded-lg border p-4 sm:p-6 shadow-sm"
        style={{ borderColor: theme.border, backgroundColor: theme.surface }}
      >
        <div className="space-y-4" style={{ color: theme.text }}>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Identifícate</h3>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Conecta con Google para acelerar el proceso o introduce tus datos manualmente.
            </p>
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={(e) => handleContinueWithGoogle(e)}
              disabled={googleDisabled}
              className={clsx(
                'inline-flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-semibold transition',
                googleDisabled ? 'cursor-not-allowed opacity-70' : 'hover:shadow-md'
              )}
              style={{
                borderColor: googleDisabled ? theme.border : '#dadce0',
                backgroundColor: '#ffffff',
                color: '#3c4043'
              }}
            >
              <GoogleIcon className="h-5 w-5" />
              {googleButtonLabel}
            </button>

            {user && (
              <div
                className="rounded-md border px-3 py-2 text-xs"
                style={{
                  borderColor: hexToRgba(theme.accent, 0.5),
                  backgroundColor: hexToRgba(theme.accent, 0.12),
                  color: theme.accent
                }}
              >
                Sesión activa: <span className="font-semibold">{user.email ?? 'cliente'}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowManualForm((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 self-start rounded-full border px-4 py-1.5 text-xs font-semibold transition hover:bg-gray-50"
              style={{
                borderColor: theme.border,
                color: theme.textMuted
              }}
            >
              {showManualForm ? 'Ocultar formulario manual' : 'Prefiero introducir mis datos'}
            </button>
          </div>

          {showManualForm && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium" style={{ color: theme.textMuted }} htmlFor="customer-email">
                  Email
                </label>
                <input
                  id="customer-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                    color: theme.text
                  }}
                  disabled={disabled}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: theme.textMuted }} htmlFor="customer-phone">
                  Teléfono
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={phone}
                  autoComplete="tel"
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                    color: theme.text
                  }}
                  disabled={disabled}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: theme.textMuted }} htmlFor="customer-first-name">
                  Nombre
                </label>
                <input
                  id="customer-first-name"
                  type="text"
                  placeholder="María"
                  value={firstName}
                  autoComplete="given-name"
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                    color: theme.text
                  }}
                  disabled={disabled}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium" style={{ color: theme.textMuted }} htmlFor="customer-last-name">
                  Apellidos
                </label>
                <input
                  id="customer-last-name"
                  type="text"
                  placeholder="García"
                  value={lastName}
                  autoComplete="family-name"
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                    color: theme.text
                  }}
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {error && (
            <div
              className="rounded-md border px-3 py-2 text-sm"
              style={{
                borderColor: '#fca5a5',
                backgroundColor: '#fef2f2',
                color: '#dc2626'
              }}
            >
              {error}
            </div>
          )}

          {(showManualForm || user) && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Guardaremos tu perfil para futuras visitas.
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={disabled}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  backgroundColor: theme.primary,
                  color: '#ffffff'
                }}
              >
                {loading ? 'Generando tarjeta…' : 'Obtener mi tarjeta'}
              </button>
            </div>
          )}
        </div>
      </div>

      {result && (
        <WalletPassCard
          businessName={businessName}
          profileName={result.profile?.name}
          downloadUrl={result.downloadUrl}
          qrToken={result.walletPass.qr_token}
          metrics={result.metrics}
          loyaltyCard={result.customerCard.loyalty_card}
          pendingRewards={result.pendingRewards}
          existingUser={result.existingUser}
        />
      )}
    </div>
  )
}

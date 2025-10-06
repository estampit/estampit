'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabaseServer'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import path from 'node:path'
import { promises as fsp } from 'node:fs'
import { Buffer } from 'node:buffer'
import { DEFAULT_PASS_TEMPLATE } from '../templateDefaults'
import {
  DEFAULT_ICON_PNG_BASE64,
  DEFAULT_ICON_2X_PNG_BASE64,
  DEFAULT_LOGO_PNG_BASE64,
  DEFAULT_STRIP_PNG_BASE64
} from '../templateAssets'
import type { Json } from '@/types/database.types'

type PromotionConfig = Json

type PassAssetBundle = {
  icon: string
  icon2x: string
  logo: string
  strip: string
}

type PassAppearance = {
  backgroundColor: string
  foregroundColor: string
  labelColor: string
  logoText: string
  description: string
}

type BuiltWalletPass = {
  pass: Record<string, any>
  assets: PassAssetBundle
  appearance: PassAppearance
  meta: {
    businessId: string
    businessName: string
    reward: string
    currentStamps: number
    stampsRequired: number
    progressText: string
    loyaltyCardName?: string | null
    promotionName?: string | null
    promotionId?: string | null
  }
}

type SupabasePassPayload = {
  userId: string | null
  qrCode: string
  businessId: string
  businessName: string
  reward: string
  currentStamps: number
  stampsRequired: number
  promotionId: string | null
  promotionName?: string | null
  loyaltyCardName?: string | null
  appearance: PassAppearance
  assets: PassAssetBundle
  serialNumber: string
}

type WalletPassWithDetails = {
  id: string
  business_id: string
  qr_token: string
  pass_type: string
  promotion_id: string | null
  customer_cards: {
    customer_id: string
    current_stamps: number | null
    loyalty_card_id: string
    loyalty_cards: {
      id: string
      name: string | null
      reward_description: string | null
      stamps_required: number | null
      businesses: {
        id: string
        name: string
        logo_url: string | null
        primary_color: string | null
        secondary_color: string | null
        background_color: string | null
        text_color: string | null
        card_title?: string | null
        card_description?: string | null
        settings: Record<string, any> | null
      }
    }
  }
  promotions: null | {
    id: string
    name: string
    description: string | null
    reward_description: string | null
    starts_at: string | null
    ends_at: string | null
    config: PromotionConfig
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
  }

  try {
    const supabase = createAdminSupabaseClient() ?? await getServerSupabase()

    // Verificar que el token existe y obtener datos completos con joins
    const { data: passData, error } = await supabase
      .from('wallet_passes')
      .select(`
        id,
        business_id,
        qr_token,
        pass_type,
        promotion_id,
        customer_cards!inner (
          customer_id,
          current_stamps,
          loyalty_card_id,
          loyalty_cards!inner (
            id,
            name,
            reward_description,
            stamps_required,
            businesses!inner (
              id,
              name,
              logo_url,
              primary_color,
              secondary_color,
              background_color,
              text_color,
              settings
            )
          )
        ),
        promotions!left (
          id,
          name,
          description,
          reward_description,
          starts_at,
          ends_at,
          config
        )
      `)
      .eq('qr_token', token)
      .single()

    if (error || !passData) {
      console.warn('[wallet/download] pass lookup failed', {
        token,
        error,
        hasData: Boolean(passData)
      })
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
    }

    const data = passData as WalletPassWithDetails

    const builtPass = await buildPassPayload(data, token)

    const signedResponse = await tryGenerateSignedPass(builtPass)
    if (signedResponse) {
      return signedResponse
    }

    const supabasePassResponse = await tryGenerateSupabasePass(token, builtPass, data)
    if (supabasePassResponse) {
      return supabasePassResponse
    }

    const fallbackBody = JSON.stringify({
      pass: builtPass.pass,
      appearance: builtPass.appearance,
      assets: builtPass.assets,
      meta: builtPass.meta
    }, null, 2)

    return new NextResponse(fallbackBody, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="wallet-pass.json"'
      }
    })

  } catch (error) {
    console.error('Error generando wallet pass:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    return null
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

async function buildPassPayload(data: WalletPassWithDetails, token: string): Promise<BuiltWalletPass> {
  const loyaltyCard = data.customer_cards?.loyalty_cards
  const business = loyaltyCard?.businesses

  if (!loyaltyCard || !business) {
    throw new Error('Datos incompletos para generar el pass')
  }

  const promotion = data.promotions

  const businessSettings = (business.settings ?? {}) as Record<string, any>
  const pickText = (...values: Array<string | null | undefined>) => {
    for (const value of values) {
      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed.length > 0) {
          return trimmed
        }
      }
    }
    return null
  }

  const passTypeIdentifier = process.env.APPLE_WALLET_PASS_TYPE_ID || 'pass.com.mystamp.loyalty'
  const teamIdentifier = process.env.APPLE_TEAM_ID || 'TEAM_PLACEHOLDER'
  const organizationName = business.name || process.env.APPLE_ORGANIZATION_NAME || 'Stampit'

  const resolvedCardDescription = pickText(
    business.card_description,
    businessSettings.card_description,
    businessSettings.cardDescription
  )
  const resolvedPromotionDescription = pickText(promotion?.description)
  const description = pickText(
    resolvedCardDescription,
    resolvedPromotionDescription,
    DEFAULT_PASS_TEMPLATE.description,
    'Tarjeta de fidelización'
  ) || 'Tarjeta de fidelización'

  const resolvedCardTitle = pickText(
    business.card_title,
    businessSettings.card_title,
    businessSettings.cardTitle
  )
  const logoText = resolvedCardTitle ?? organizationName

  const backgroundColor = toPassColor(business.background_color, DEFAULT_PASS_TEMPLATE.backgroundColor)
  const foregroundColor = toPassColor(business.text_color, DEFAULT_PASS_TEMPLATE.foregroundColor)
  const labelColor = toPassColor(business.secondary_color ?? business.primary_color, DEFAULT_PASS_TEMPLATE.labelColor || foregroundColor)

  const currentStamps = Math.max(0, Math.floor(data.customer_cards.current_stamps ?? 0))
  const stampsRequired = Math.max(0, Math.floor(loyaltyCard.stamps_required ?? 0))
  const rewardDescription = promotion?.reward_description
    || loyaltyCard.reward_description
    || 'Recompensa especial'
  const loyaltyCardName = loyaltyCard.name
  const promotionName = promotion?.name ?? null
  const progressText = formatProgress(currentStamps, stampsRequired)

  const pass: Record<string, any> = cloneTemplate(DEFAULT_PASS_TEMPLATE)

  pass.passTypeIdentifier = passTypeIdentifier
  pass.serialNumber = data.id
  pass.teamIdentifier = teamIdentifier
  pass.organizationName = organizationName
  pass.description = description
  pass.backgroundColor = backgroundColor
  pass.foregroundColor = foregroundColor
  pass.labelColor = labelColor
  pass.logoText = logoText

  pass.generic = pass.generic || {}
  pass.generic.primaryFields = [
    {
      key: 'stamps',
      label: promotionName || 'Progreso',
      value: progressText
    }
  ]
  pass.generic.secondaryFields = [
    {
      key: 'business',
      label: 'Negocio',
      value: organizationName
    }
  ]
  if (loyaltyCardName) {
    pass.generic.secondaryFields.push({
      key: 'program',
      label: 'Programa',
      value: loyaltyCardName
    })
  }
  pass.generic.auxiliaryFields = [
    {
      key: 'reward',
      label: 'Recompensa',
      value: rewardDescription
    }
  ]

  const backFields = [
    {
      key: 'instructions',
      label: 'Cómo usar',
      value: resolvedCardDescription || 'Presenta este pass para acumular sellos y canjear recompensas.'
    },
    {
      key: 'progress',
      label: 'Progreso actual',
      value: progressText
    },
    {
      key: 'reward_details',
      label: 'Recompensa',
      value: rewardDescription
    }
  ]
  pass.backFields = backFields

  if (!Array.isArray(pass.barcodes) || pass.barcodes.length === 0) {
    pass.barcodes = [
      {
        format: 'PKBarcodeFormatQR',
        message: token,
        messageEncoding: 'iso-8859-1'
      }
    ]
  } else {
    const [first, ...rest] = pass.barcodes
    pass.barcodes = [
      {
        ...first,
        format: first?.format || 'PKBarcodeFormatQR',
        message: token,
        messageEncoding: first?.messageEncoding || 'iso-8859-1'
      },
      ...rest
    ]
  }

  if (promotion?.ends_at) {
    pass.expirationDate = promotion.ends_at
    pass.relevantDate = promotion.ends_at
  } else if (promotion?.starts_at) {
    pass.relevantDate = promotion.starts_at
  }

  pass.userInfo = {
    walletPassId: data.id,
    customerCardId: loyaltyCard.id,
    customerCardUuid: data.customer_cards.loyalty_card_id,
    promotionId: data.promotion_id,
    businessId: data.business_id
  }

  const assets = await resolveAssetBundle(business.logo_url)
  const appearance: PassAppearance = {
    backgroundColor,
    foregroundColor,
    labelColor,
    logoText,
    description
  }

  return {
    pass,
    assets,
    appearance,
    meta: {
      businessId: data.business_id,
      businessName: organizationName,
      reward: rewardDescription,
      currentStamps,
      stampsRequired,
      progressText,
      loyaltyCardName,
      promotionName,
      promotionId: data.promotion_id ?? null
    }
  }
}

const shouldAttemptSigning = () => {
  if (process.env.APPLE_WALLET_SIGNING_ENABLED === 'false') {
    return false
  }
  return true
}

async function tryGenerateSignedPass(builtPass: BuiltWalletPass) {
  if (!shouldAttemptSigning()) {
    return null
  }

  try {
    const {
      modelDir,
      wwdrPath,
      signerCertPath,
      signerKeyPath,
      signerKeyPassphrase,
      envSignerCert,
      envSignerKey
    } = await resolvePassResources()

    const { PKPass } = (await import('passkit-generator')) as any
    const certificates = {
      wwdr: await fsp.readFile(wwdrPath),
      signerCert: envSignerCert ?? await fsp.readFile(signerCertPath),
      signerKey: envSignerKey ?? await fsp.readFile(signerKeyPath),
      signerKeyPassphrase
    }

    const pass = (await PKPass.from(
      {
        model: modelDir,
        certificates
      },
      builtPass.pass as any
    )) as any

    const buffer = await streamToBuffer(pass.stream as NodeJS.ReadableStream)
    const filename = `${builtPass.pass.serialNumber || 'wallet-pass'}.pkpass`

    const body = new Uint8Array(buffer)

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.warn('[wallet/download] No se pudo firmar el pass automáticamente. Detalle:', error)
    return null
  }
}

async function tryGenerateSupabasePass(token: string, builtPass: BuiltWalletPass, data: WalletPassWithDetails) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  const payload: SupabasePassPayload = {
    userId: data.customer_cards.customer_id ?? null,
    qrCode: token,
    businessId: builtPass.meta.businessId,
    businessName: builtPass.meta.businessName,
    reward: builtPass.meta.reward,
    currentStamps: builtPass.meta.currentStamps,
    stampsRequired: builtPass.meta.stampsRequired,
    promotionId: builtPass.meta.promotionId ?? null,
    promotionName: builtPass.meta.promotionName ?? null,
    loyaltyCardName: builtPass.meta.loyaltyCardName ?? null,
    appearance: builtPass.appearance,
    assets: builtPass.assets,
    serialNumber: builtPass.pass.serialNumber ?? data.id
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-apple-pass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseServiceKey
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.warn('[wallet/download] Supabase pass signing failed', response.status, errorText)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
  const filename = `${builtPass.pass.serialNumber || 'wallet-pass'}.pkpass`

    return new NextResponse(new Uint8Array(arrayBuffer), {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.warn('[wallet/download] Error calling Supabase pass signer', error)
    return null
  }
}

async function buildDefaultAssetBundle(): Promise<PassAssetBundle> {
  return {
    icon: DEFAULT_ICON_PNG_BASE64,
    icon2x: DEFAULT_ICON_2X_PNG_BASE64,
    logo: DEFAULT_LOGO_PNG_BASE64,
    strip: DEFAULT_STRIP_PNG_BASE64
  }
}

async function resolveAssetBundle(logoUrl: string | null): Promise<PassAssetBundle> {
  const bundle = await buildDefaultAssetBundle()

  if (!logoUrl) {
    return bundle
  }

  const remoteLogo = await fetchImageAsBase64(logoUrl)
  if (remoteLogo) {
    bundle.logo = remoteLogo
    bundle.strip = remoteLogo
  }

  return bundle
}

function toPassColor(color: string | null | undefined, fallback: string): string {
  if (!color) return fallback
  const trimmed = color.trim()
  if (!trimmed) return fallback

  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return hexToRgb(trimmed)
  }

  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
    const expanded = `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`
    return hexToRgb(expanded)
  }

  if (/^rgb(a)?\(/i.test(trimmed)) {
    return trimmed
  }

  return fallback
}

function hexToRgb(hex: string): string {
  const value = hex.replace('#', '')
  const bigint = parseInt(value, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgb(${r}, ${g}, ${b})`
}

function formatProgress(current: number, required: number): string {
  const boundedCurrent = required > 0 ? Math.min(current, required) : current
  return required > 0 ? `${boundedCurrent}/${required}` : `${boundedCurrent}`
}

function cloneTemplate<T>(template: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(template)
  }
  return JSON.parse(JSON.stringify(template)) as T
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer).toString('base64')
  } catch (error) {
    console.warn(`[wallet/download] No se pudo obtener el logo desde ${url}:`, error)
    return null
  }
}

async function resolvePassResources() {
  const rootOverride = process.env.PASS_ASSETS_DIR
  const candidateRoots = rootOverride
    ? [path.resolve(process.cwd(), rootOverride)]
    : [
        path.join(process.cwd(), 'apps', 'web', 'public', 'pass-assets'),
        path.join(process.cwd(), 'public', 'pass-assets')
      ]

  const assetsRoot = await findFirstExisting(candidateRoots)

  if (!assetsRoot) {
    throw new Error(
      `No se encontró directorio base de pass-assets. Revisados: ${candidateRoots.join(', ')}`
    )
  }

  const modelDir = resolvePath(process.env.PASS_MODEL_DIR, path.join(assetsRoot, 'model'))
  const wwdrPath = resolvePath(process.env.PASS_WWDR_CERT, path.join(assetsRoot, 'wwdr.pem'))
  const signerCertPath = resolvePath(process.env.PASS_SIGNER_CERT, path.join(assetsRoot, 'signerCert.pem'))
  const signerKeyPath = resolvePath(process.env.PASS_SIGNER_KEY, path.join(assetsRoot, 'signerKey.pem'))
  const signerKeyPassphrase = process.env.APPLE_PASS_KEY || process.env.PASS_SIGNER_PASSPHRASE || ''

  const envSignerCert = decodeBase64Env('APPLE_PASS_CERT')
  const envSignerKey = decodeBase64Env('APPLE_PASS_CERT_KEY')

  await ensureExists(modelDir, 'directorio del modelo (.pass)')
  await ensureExists(wwdrPath, 'WWDR (wwdr.pem)')

  if (!envSignerCert) {
    await ensureExists(signerCertPath, 'certificado del Pass (signerCert.pem)')
  }

  if (!envSignerKey) {
    await ensureExists(signerKeyPath, 'clave privada del Pass (signerKey.pem)')
  }

  return {
    modelDir,
    wwdrPath,
    signerCertPath,
    signerKeyPath,
    signerKeyPassphrase,
    envSignerCert,
    envSignerKey
  }
}

function resolvePath(envValue: string | undefined, defaultPath: string) {
  if (envValue && envValue.trim().length > 0) {
    return path.resolve(process.cwd(), envValue)
  }
  return defaultPath
}

async function findFirstExisting(paths: string[]): Promise<string | null> {
  for (const candidate of paths) {
    try {
      const stats = await fsp.stat(candidate)
      if (stats.isDirectory()) {
        return candidate
      }
    } catch {
      continue
    }
  }

  return null
}

async function ensureExists(filePath: string, label: string) {
  try {
    const stats = await fsp.stat(filePath)
    if (stats.isFile() || stats.isDirectory()) {
      return
    }
  } catch {
    throw new Error(`No se encontró ${label} en ${filePath}`)
  }
  throw new Error(`Ruta inválida para ${label}: ${filePath}`)
}

function decodeBase64Env(name: string) {
  const raw = process.env[name]
  if (!raw) {
    return undefined
  }

  const trimmed = raw.trim()
  if (!trimmed) {
    return undefined
  }

  try {
    return Buffer.from(trimmed, 'base64')
  } catch (error) {
    console.warn(`[wallet/download] No se pudo decodificar ${name} desde base64:`, error)
    return undefined
  }
}

async function streamToBuffer(stream: NodeJS.ReadableStream) {
  const chunks: Buffer[] = []
  return new Promise<Buffer>((resolve, reject) => {
    stream.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', (err) => reject(err))
  })
}
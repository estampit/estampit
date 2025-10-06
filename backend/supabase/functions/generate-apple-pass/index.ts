// @ts-ignore Deno npm specifier resolved at runtime
import { PKPass } from 'npm:passkit-generator'
import { Buffer } from 'node:buffer'

declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
  serve: (handler: (req: Request) => Response | Promise<Response>) => void
}

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

type SupabasePassPayload = {
  userId?: string | null
  qrCode?: string | null
  businessId?: string | null
  businessName?: string | null
  reward?: string | null
  currentStamps?: number | null
  stampsRequired?: number | null
  promotionId?: string | null
  promotionName?: string | null
  loyaltyCardName?: string | null
  appearance?: PassAppearance | null
  assets?: PassAssetBundle | null
  serialNumber?: string | null
}

type Certificates = {
  wwdr: Buffer
  signerCert: Buffer
  signerKey: Buffer
  signerKeyPassphrase: string
}

type ResolvedPassContext = {
  pass: Record<string, any>
  appearance: PassAppearance
  assets: Record<string, Buffer>
}

const PASS_TYPE_IDENTIFIER = Deno.env.get('APPLE_WALLET_PASS_TYPE_ID') ?? 'pass.com.mystamp.loyalty'
const TEAM_IDENTIFIER = Deno.env.get('APPLE_TEAM_ID') ?? 'TEAM_PLACEHOLDER'
const ORGANIZATION_FALLBACK = Deno.env.get('APPLE_ORGANIZATION_NAME') ?? 'Stampit'

const DEFAULT_PASS_TEMPLATE: Record<string, any> = {
  formatVersion: 1,
  passTypeIdentifier: PASS_TYPE_IDENTIFIER,
  description: 'Tarjeta de fidelización',
  organizationName: ORGANIZATION_FALLBACK,
  teamIdentifier: TEAM_IDENTIFIER,
  backgroundColor: 'rgb(30, 58, 138)',
  foregroundColor: 'rgb(255, 255, 255)',
  labelColor: 'rgb(255, 255, 255)',
  logoText: ORGANIZATION_FALLBACK,
  generic: {
    primaryFields: [
      {
        key: 'stamps',
        label: 'Progreso',
        value: '0/10'
      }
    ],
    secondaryFields: [
      {
        key: 'business',
        label: 'Negocio',
        value: ORGANIZATION_FALLBACK
      }
    ],
    auxiliaryFields: [
      {
        key: 'reward',
        label: 'Recompensa',
        value: 'Recompensa especial'
      }
    ]
  },
  backFields: [
    {
      key: 'instructions',
      label: 'Cómo usar',
      value: 'Presenta este pass para acumular sellos y canjear recompensas.'
    }
  ],
  barcodes: [
    {
      format: 'PKBarcodeFormatQR',
      message: 'TOKEN_PLACEHOLDER',
      messageEncoding: 'iso-8859-1'
    }
  ]
}

const FALLBACK_ASSETS: PassAssetBundle = {
  icon: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
  icon2x: 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAQAAABLabXuAAAADUlEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
  logo: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
  strip: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { 'Content-Type': 'text/plain' }
    })
  }

  let payload: SupabasePassPayload
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON payload' }, 400)
  }

  const validationError = validatePayload(payload)
  if (validationError) {
    return jsonResponse({ error: validationError }, 400)
  }

  try {
    const certificates = await loadCertificates()
    const { pass, assets } = resolvePassContext(payload)

  const walletPass = new PKPass(pass, certificates, assets)
  const buffer = await walletPass.getAsBuffer()
  const body = new Uint8Array(buffer)
    const filename = `${pass.serialNumber || 'wallet-pass'}.pkpass`

  return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('[generate-apple-pass] Failed to generate pass', error)
    return jsonResponse({ error: 'Failed to generate Apple Wallet pass' }, 500)
  }
})

function validatePayload(payload: SupabasePassPayload): string | null {
  if (!payload.qrCode || payload.qrCode.trim().length === 0) {
    return 'qrCode is required'
  }

  if (!payload.businessName || payload.businessName.trim().length === 0) {
    return 'businessName is required'
  }

  if (typeof payload.currentStamps !== 'number') {
    return 'currentStamps is required'
  }

  if (typeof payload.stampsRequired !== 'number') {
    return 'stampsRequired is required'
  }

  if (!payload.reward || payload.reward.trim().length === 0) {
    return 'reward is required'
  }

  return null
}

async function loadCertificates(): Promise<Certificates> {
  const wwdr = decodeCertificateFromEnv('APPLE_WWDR_CERT')
  const signerCert = decodeCertificateFromEnv('APPLE_PASS_CERT')
  const signerKey = decodeCertificateFromEnv('APPLE_PASS_CERT_KEY')
  const signerKeyPassphrase = Deno.env.get('APPLE_PASS_CERT_PASSWORD') ?? ''

  if (!wwdr || !signerCert || !signerKey) {
    throw new Error('Missing Apple Wallet certificates in environment variables')
  }

  return {
    wwdr,
    signerCert,
    signerKey,
    signerKeyPassphrase
  }
}

function decodeCertificateFromEnv(name: string): Buffer | null {
  const raw = Deno.env.get(name)
  if (!raw) {
    return null
  }

  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }

  if (trimmed.startsWith('-----BEGIN')) {
    return Buffer.from(trimmed)
  }

  try {
    return Buffer.from(trimmed, 'base64')
  } catch (error) {
    console.warn(`[generate-apple-pass] Could not decode ${name} from base64`, error)
    return null
  }
}

function resolvePassContext(payload: SupabasePassPayload): ResolvedPassContext {
  const appearance = resolveAppearance(payload.appearance)
  const pass = buildPass(payload, appearance)
  const assets = buildAssetMap(payload.assets)

  return { pass, appearance, assets }
}

function resolveAppearance(appearance?: PassAppearance | null): PassAppearance {
  const fallback = DEFAULT_PASS_TEMPLATE

  const safe = <T extends string>(value: T | null | undefined, fallbackValue: T): T => {
    if (!value) return fallbackValue
    const trimmed = value.trim()
    return trimmed.length > 0 ? (trimmed as T) : fallbackValue
  }

  return {
    backgroundColor: sanitizeColor(safe(appearance?.backgroundColor, fallback.backgroundColor)),
    foregroundColor: sanitizeColor(safe(appearance?.foregroundColor, fallback.foregroundColor)),
    labelColor: sanitizeColor(safe(appearance?.labelColor, fallback.labelColor)),
    logoText: safe(appearance?.logoText, fallback.logoText),
    description: safe(appearance?.description, fallback.description)
  }
}

function sanitizeColor(input: string): string {
  if (/^#[0-9A-Fa-f]{6}$/.test(input)) {
    return hexToRgb(input)
  }

  if (/^#[0-9A-Fa-f]{3}$/.test(input)) {
    const expanded = `#${input[1]}${input[1]}${input[2]}${input[2]}${input[3]}${input[3]}`
    return hexToRgb(expanded)
  }

  return input
}

function hexToRgb(hex: string): string {
  const value = hex.replace('#', '')
  const bigint = parseInt(value, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgb(${r}, ${g}, ${b})`
}

function cloneTemplate<T>(template: T): any {
  if (typeof structuredClone === 'function') {
    return structuredClone(template)
  }
  return JSON.parse(JSON.stringify(template))
}

function buildPass(payload: SupabasePassPayload, appearance: PassAppearance): Record<string, any> {
  const base: Record<string, any> = cloneTemplate(DEFAULT_PASS_TEMPLATE)
  const serialNumber = payload.serialNumber?.trim() || crypto.randomUUID()
  const organizationName = payload.businessName?.trim() || ORGANIZATION_FALLBACK
  const promotionLabel = payload.promotionName?.trim() || 'Progreso'
  const loyaltyCardName = payload.loyaltyCardName?.trim()
  const progressText = formatProgress(payload.currentStamps ?? 0, payload.stampsRequired ?? 0)

  base.passTypeIdentifier = PASS_TYPE_IDENTIFIER
  base.serialNumber = serialNumber
  base.teamIdentifier = TEAM_IDENTIFIER
  base.organizationName = organizationName
  base.description = appearance.description
  base.backgroundColor = appearance.backgroundColor
  base.foregroundColor = appearance.foregroundColor
  base.labelColor = appearance.labelColor
  base.logoText = appearance.logoText

  base.generic = base.generic || {}
  base.generic.primaryFields = [
    {
      key: 'stamps',
      label: promotionLabel,
      value: progressText
    }
  ]
  base.generic.secondaryFields = [
    {
      key: 'business',
      label: 'Negocio',
      value: organizationName
    }
  ]

  if (loyaltyCardName) {
    base.generic.secondaryFields.push({
      key: 'program',
      label: 'Programa',
      value: loyaltyCardName
    })
  }

  base.generic.auxiliaryFields = [
    {
      key: 'reward',
      label: 'Recompensa',
      value: payload.reward ?? 'Recompensa especial'
    }
  ]

  base.backFields = [
    {
      key: 'instructions',
      label: 'Cómo usar',
      value: appearance.description || 'Presenta este pass para acumular sellos y canjear recompensas.'
    },
    {
      key: 'progress',
      label: 'Progreso actual',
      value: progressText
    },
    {
      key: 'reward_details',
      label: 'Recompensa',
      value: payload.reward ?? 'Recompensa especial'
    }
  ]

  base.barcodes = [
    {
      format: 'PKBarcodeFormatQR',
      message: payload.qrCode ?? 'TOKEN_PLACEHOLDER',
      messageEncoding: 'iso-8859-1'
    }
  ]

  base.userInfo = {
    walletPassId: serialNumber,
    businessId: payload.businessId ?? null,
    promotionId: payload.promotionId ?? null,
    userId: payload.userId ?? null
  }

  return base
}

function buildAssetMap(assets?: PassAssetBundle | null): Record<string, Buffer> {
  const merged: PassAssetBundle = {
    icon: chooseAsset(assets?.icon, FALLBACK_ASSETS.icon),
    icon2x: chooseAsset(assets?.icon2x, FALLBACK_ASSETS.icon2x),
    logo: chooseAsset(assets?.logo, FALLBACK_ASSETS.logo),
    strip: chooseAsset(assets?.strip, FALLBACK_ASSETS.strip)
  }

  return {
    'icon.png': Buffer.from(merged.icon, 'base64'),
    'icon@2x.png': Buffer.from(merged.icon2x, 'base64'),
    'logo.png': Buffer.from(merged.logo, 'base64'),
    'strip.png': Buffer.from(merged.strip, 'base64')
  }
}

function chooseAsset(input: string | null | undefined, fallback: string): string {
  if (!input) {
    return fallback
  }

  const trimmed = input.trim()
  if (!trimmed) {
    return fallback
  }

  const dataUrlMatch = trimmed.match(/^data:image\/[^;]+;base64,(.+)$/i)
  if (dataUrlMatch) {
    return dataUrlMatch[1]
  }

  return trimmed
}

function formatProgress(current: number, required: number): string {
  const safeCurrent = Number.isFinite(current) ? Math.max(0, Math.floor(current)) : 0
  const safeRequired = Number.isFinite(required) ? Math.max(0, Math.floor(required)) : 0
  const boundedCurrent = safeRequired > 0 ? Math.min(safeCurrent, safeRequired) : safeCurrent
  return safeRequired > 0 ? `${boundedCurrent}/${safeRequired}` : `${boundedCurrent}`
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
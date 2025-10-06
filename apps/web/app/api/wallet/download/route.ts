'use server'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabaseServer'
import path from 'node:path'
import { promises as fsp } from 'node:fs'

type SupabasePassPayload = {
  userId: string | null
  qrCode: string
  businessName: string
  reward: string
  currentStamps: number
  stampsRequired: number
}

type WalletPassWithDetails = {
  id: string
  qr_token: string
  customer_cards: {
    customer_id: string
    current_stamps: number
    loyalty_cards: {
      stamps_required: number
      reward_description: string
      businesses: {
        name: string
      }
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
  }

  try {
    const supabase = await getServerSupabase()

    // Verificar que el token existe y obtener datos completos con joins
    const { data: passData, error } = await supabase
      .from('wallet_passes')
      .select(`
        *,
        customer_cards!inner (
          customer_id,
          current_stamps,
          loyalty_cards!inner (
            stamps_required,
            reward_description,
            businesses!inner (
              name
            )
          )
        )
      `)
      .eq('qr_token', token)
      .single()

    if (error || !passData) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
    }

    const data = passData as WalletPassWithDetails

    const passPayload = buildPassPayload(data, token)

    const signedResponse = await tryGenerateSignedPass(passPayload)
    if (signedResponse) {
      return signedResponse
    }

    const supabasePassResponse = await tryGenerateSupabasePass(token, passPayload, data)
    if (supabasePassResponse) {
      return supabasePassResponse
    }

    return new NextResponse(JSON.stringify(passPayload, null, 2), {
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

function buildPassPayload(data: WalletPassWithDetails, token: string) {
  const passTypeIdentifier = process.env.APPLE_WALLET_PASS_TYPE_ID || 'pass.com.mystamp.loyalty'
  const teamIdentifier = process.env.APPLE_TEAM_ID || 'TEAM_PLACEHOLDER'
  const organizationName = process.env.APPLE_ORGANIZATION_NAME || data.customer_cards.loyalty_cards.businesses.name || 'MyStamp'

  return {
    formatVersion: 1,
    passTypeIdentifier,
    serialNumber: data.id,
    teamIdentifier,
    organizationName,
    description: 'Tarjeta de Fidelización',
    foregroundColor: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(0, 123, 255)',
    generic: {
      primaryFields: [
        {
          key: 'stamps',
          label: 'Sellos',
          value: `${data.customer_cards.current_stamps || 0}/${data.customer_cards.loyalty_cards.stamps_required || 10}`
        }
      ],
      secondaryFields: [
        {
          key: 'business',
          label: 'Negocio',
          value: data.customer_cards.loyalty_cards.businesses.name || 'Negocio'
        }
      ],
      auxiliaryFields: [
        {
          key: 'reward',
          label: 'Recompensa',
          value: data.customer_cards.loyalty_cards.reward_description || 'Descuento especial'
        }
      ]
    },
    barcodes: [
      {
        format: 'PKBarcodeFormatQR',
        message: token,
        messageEncoding: 'iso-8859-1'
      }
    ]
  }
}

const shouldAttemptSigning = () => {
  if (process.env.APPLE_WALLET_SIGNING_ENABLED === 'false') {
    return false
  }
  return true
}

async function tryGenerateSignedPass(passPayload: Record<string, any>) {
  if (!shouldAttemptSigning()) {
    return null
  }

  try {
    const { modelDir, wwdrPath, signerCertPath, signerKeyPath, signerKeyPassphrase } = await resolvePassResources()

    const { PKPass } = (await import('passkit-generator')) as any
    const pass = (await PKPass.from(passPayload as any, {
      model: modelDir,
      certificates: {
        wwdr: await fsp.readFile(wwdrPath),
        signerCert: await fsp.readFile(signerCertPath),
        signerKey: await fsp.readFile(signerKeyPath),
        signerKeyPassphrase
      }
    })) as any

    const buffer = await streamToBuffer(pass.stream as NodeJS.ReadableStream)
    const filename = `${passPayload.serialNumber || 'wallet-pass'}.pkpass`

    const body = new Uint8Array(buffer)

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.warn('[wallet/download] No se pudo firmar el pass automáticamente. Enviando JSON. Detalle:', error)
    return null
  }
}

async function tryGenerateSupabasePass(token: string, passPayload: Record<string, any>, data: WalletPassWithDetails) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  const payload: SupabasePassPayload = {
    userId: data.customer_cards.customer_id ?? null,
    qrCode: token,
    businessName: data.customer_cards.loyalty_cards.businesses.name || 'Negocio',
    reward: data.customer_cards.loyalty_cards.reward_description || 'Recompensa',
    currentStamps: data.customer_cards.current_stamps ?? 0,
    stampsRequired: data.customer_cards.loyalty_cards.stamps_required ?? 0
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
    const filename = `${passPayload.serialNumber || 'wallet-pass'}.pkpass`

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

async function resolvePassResources() {
  const rootOverride = process.env.PASS_ASSETS_DIR
  const defaultRoot = path.join(process.cwd(), 'public', 'pass-assets')
  const assetsRoot = rootOverride ? path.resolve(process.cwd(), rootOverride) : defaultRoot

  const modelDir = resolvePath(process.env.PASS_MODEL_DIR, path.join(assetsRoot, 'model'))
  const wwdrPath = resolvePath(process.env.PASS_WWDR_CERT, path.join(assetsRoot, 'wwdr.pem'))
  const signerCertPath = resolvePath(process.env.PASS_SIGNER_CERT, path.join(assetsRoot, 'signerCert.pem'))
  const signerKeyPath = resolvePath(process.env.PASS_SIGNER_KEY, path.join(assetsRoot, 'signerKey.pem'))
  const signerKeyPassphrase = process.env.PASS_SIGNER_PASSPHRASE || ''

  await ensureExists(modelDir, 'directorio del modelo (.pass)')
  await ensureExists(wwdrPath, 'WWDR (wwdr.pem)')
  await ensureExists(signerCertPath, 'certificado del Pass (signerCert.pem)')
  await ensureExists(signerKeyPath, 'clave privada del Pass (signerKey.pem)')

  return { modelDir, wwdrPath, signerCertPath, signerKeyPath, signerKeyPassphrase }
}

function resolvePath(envValue: string | undefined, defaultPath: string) {
  if (envValue && envValue.trim().length > 0) {
    return path.resolve(process.cwd(), envValue)
  }
  return defaultPath
}

async function ensureExists(filePath: string, label: string) {
  try {
    const stats = await fsp.stat(filePath)
    if (stats.isFile() || stats.isDirectory()) {
      return
    }
  } catch (error) {
    throw new Error(`No se encontró ${label} en ${filePath}`)
  }
  throw new Error(`Ruta inválida para ${label}: ${filePath}`)
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
#!/usr/bin/env node
import { promises as fsp } from 'node:fs'
import path from 'node:path'

async function main() {
  const [,, inputJsonArg, templateIdArg] = process.argv
  const apiPrefix = process.env.PASSKIT_API_PREFIX || 'https://api.pub1.passkit.io'
  const restKey = process.env.PASSKIT_REST_KEY
  const restSecret = process.env.PASSKIT_REST_SECRET
  const templateId = templateIdArg || process.env.PASSKIT_TEMPLATE_ID

  if (!restKey || !restSecret) {
    throw new Error('Define PASSKIT_REST_KEY y PASSKIT_REST_SECRET en tu entorno para autenticarte contra PassKit.')
  }

  if (!templateId) {
    throw new Error('Debes pasar un templateId como segundo argumento o definir PASSKIT_TEMPLATE_ID en tu entorno.')
  }

  if (!inputJsonArg) {
    throw new Error('Uso: node scripts/passkit-issue-pass.mjs <wallet-pass.json> [templateId]')
  }

  const resolvedJson = path.resolve(process.cwd(), inputJsonArg)
  const raw = await fsp.readFile(resolvedJson, 'utf8')
  const walletPass = JSON.parse(raw)

  const authRes = await fetch(`${apiPrefix}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: restKey, secret: restSecret })
  })

  if (!authRes.ok) {
    const text = await authRes.text()
    throw new Error(`Error autenticando en PassKit (${authRes.status}): ${text}`)
  }

  const authJson = await authRes.json()
  const bearer = authJson.accessToken || authJson.token || authJson.jwt

  if (!bearer) {
    throw new Error('No se recibió un accessToken/token válido de PassKit. Revisa las credenciales o la región.')
  }

  const primary = walletPass?.generic?.primaryFields?.[0]
  const secondary = walletPass?.generic?.secondaryFields?.[0]
  const auxFields = walletPass?.generic?.auxiliaryFields || []
  const barcode = walletPass?.barcodes?.[0]

  const memberPayload = {
    templateId,
    externalId: walletPass.serialNumber || walletPass.authenticationToken || `wallet-${Date.now()}`,
    person: {
      firstName: walletPass?.cardholder?.firstName || walletPass?.firstName || 'Wallet',
      lastName: walletPass?.cardholder?.lastName || walletPass?.lastName || 'User',
      email: walletPass?.cardholder?.email || walletPass?.email || undefined
    },
    pass: {
      barcode: barcode?.message || barcode?.altText,
      header: secondary?.value || '',
      primary: primary?.value || '',
      secondary: secondary?.value || '',
      auxiliary: auxFields.map((field) => ({ key: field.key, value: field.value }))
    },
    metadata: walletPass
  }

  const issueUrl = `${apiPrefix}/v2/passes/${encodeURIComponent(templateId)}/issue`

  const issueRes = await fetch(issueUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearer}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(memberPayload)
  })

  const responseText = await issueRes.text()

  if (!issueRes.ok) {
    throw new Error(`Error emitiendo pass en PassKit (${issueRes.status}): ${responseText}`)
  }

  try {
    const json = JSON.parse(responseText)
    console.log('✅ Pass emitido en PassKit:')
    console.log(JSON.stringify(json, null, 2))
    if (json?.distributionUrl) {
      console.log(`🔗 URL de descarga: ${json.distributionUrl}`)
    }
  } catch (err) {
    console.log('✅ Pass emitido. Respuesta de PassKit:')
    console.log(responseText)
  }
}

main().catch((error) => {
  console.error('❌ Error conectando con PassKit:', error.message)
  process.exit(1)
})

#!/usr/bin/env node
import fs from 'node:fs'
import { promises as fsp } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PKPass } from 'passkit-generator'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function ensureFileExists(filePath, label) {
  try {
    await fsp.access(filePath)
  } catch (err) {
    throw new Error(`No se encontró ${label} en ${filePath}. Ajusta el path o crea el archivo.`)
  }
}

async function readCertificate(filePath) {
  await ensureFileExists(filePath, path.basename(filePath))
  return fsp.readFile(filePath)
}

async function main() {
  const [, , inputJson, outputArg] = process.argv

  if (!inputJson) {
    console.error('Uso: node scripts/build-wallet-pass.mjs <ruta-json> [salida.pkpass]')
    process.exit(1)
  }

  const resolvedInput = path.resolve(process.cwd(), inputJson)
  const jsonRaw = await fsp.readFile(resolvedInput, 'utf8')
  const passPayload = JSON.parse(jsonRaw)

  const defaultAssetsRoot = path.resolve(__dirname, '../apps/web/public/pass-assets')
  const modelDir = process.env.PASS_MODEL_DIR
    ? path.resolve(process.cwd(), process.env.PASS_MODEL_DIR)
    : path.resolve(defaultAssetsRoot, 'model')

  const wwdrPath = process.env.PASS_WWDR_CERT
    ? path.resolve(process.cwd(), process.env.PASS_WWDR_CERT)
    : path.resolve(defaultAssetsRoot, 'wwdr.pem')

  const signerCertPath = process.env.PASS_SIGNER_CERT
    ? path.resolve(process.cwd(), process.env.PASS_SIGNER_CERT)
    : path.resolve(defaultAssetsRoot, 'signerCert.pem')

  const signerKeyPath = process.env.PASS_SIGNER_KEY
    ? path.resolve(process.cwd(), process.env.PASS_SIGNER_KEY)
    : path.resolve(defaultAssetsRoot, 'signerKey.pem')

  const signerKeyPassphrase = process.env.PASS_SIGNER_PASSPHRASE || ''

  await ensureFileExists(modelDir, 'directorio modelo (assets del pass)')

  const certificates = {
    wwdr: await readCertificate(wwdrPath),
    signerCert: await readCertificate(signerCertPath),
    signerKey: await readCertificate(signerKeyPath),
    signerKeyPassphrase
  }

  const pass = await PKPass.from(passPayload, {
    model: modelDir,
    certificates
  })

  const outputFile = path.resolve(process.cwd(), outputArg || 'wallet.pkpass')
  await fsp.mkdir(path.dirname(outputFile), { recursive: true })

  await new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(outputFile)
    pass.stream.pipe(stream)
    stream.on('finish', resolve)
    stream.on('error', reject)
    pass.stream.on('error', reject)
  })

  console.log(`✅ Wallet pass generado en ${outputFile}`)
}

main().catch((error) => {
  console.error('❌ Error generando el pass:', error.message)
  process.exit(1)
})

import { readFileSync } from 'node:fs'
import path from 'node:path'

const BLANK_PIXEL_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='

function assetPath(fileName: string) {
  return path.join(process.cwd(), 'public', 'pass-assets', fileName)
}

function readAssetAsBase64(fileName: string): string {
  try {
    const fileBuffer = readFileSync(assetPath(fileName))
    return fileBuffer.toString('base64')
  } catch (error) {
    console.warn(`[wallet/templateAssets] No se pudo leer ${fileName}. Usando pixel en blanco.`, error)
    return BLANK_PIXEL_BASE64
  }
}

export const DEFAULT_ICON_PNG_BASE64 = readAssetAsBase64('default-icon.png')
export const DEFAULT_ICON_2X_PNG_BASE64 = readAssetAsBase64('default-icon@2x.png')
export const DEFAULT_LOGO_PNG_BASE64 = readAssetAsBase64('default-logo.png')
export const DEFAULT_STRIP_PNG_BASE64 = readAssetAsBase64('default-strip.png')

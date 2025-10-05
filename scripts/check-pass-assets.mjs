#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const DEFAULT_ASSETS_DIR = path.resolve(ROOT, 'apps/web/public/pass-assets')
const MODEL_DIR = path.join(DEFAULT_ASSETS_DIR, 'model')

const REQUIRED_MODEL_FILES = [
  'pass.json',
  'icon.png',
  'icon@2x.png',
  'logo.png'
]

const OPTIONAL_MODEL_FILES = [
  'background.png',
  'strip.png',
  'strip@2x.png',
  'thumbnail.png',
  'thumbnail@2x.png'
]

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK)
    return true
  } catch (_err) {
    return false
  }
}

function reportStatus(title, message, level = 'info') {
  const icons = {
    info: 'ℹ️',
    ok: '✅',
    warn: '⚠️',
    error: '❌'
  }
  console.log(`${icons[level] || icons.info} ${title} ${message ? `- ${message}` : ''}`)
}

function ensureDirectory(label, dirPath) {
  if (!fileExists(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    reportStatus(label, `No existe en ${dirPath}`, 'error')
    process.exitCode = 1
    return false
  }
  reportStatus(label, dirPath, 'ok')
  return true
}

function main() {
  console.log('🔍 Verificando assets de Apple Wallet...')

  const assetsDir = process.env.PASS_ASSETS_DIR
    ? path.resolve(ROOT, process.env.PASS_ASSETS_DIR)
    : DEFAULT_ASSETS_DIR

  const modelDir = process.env.PASS_MODEL_DIR
    ? path.resolve(ROOT, process.env.PASS_MODEL_DIR)
    : MODEL_DIR

  if (!ensureDirectory('Directorio de assets', assetsDir)) {
    return
  }

  if (!ensureDirectory('Directorio del modelo', modelDir)) {
    return
  }

  let missing = 0
  for (const filename of REQUIRED_MODEL_FILES) {
    const filePath = path.join(modelDir, filename)
    if (!fileExists(filePath)) {
      reportStatus('Archivo requerido faltante', `${filename}`, 'error')
      missing += 1
    } else {
      reportStatus('Archivo requerido', `${filename}`, 'ok')
    }
  }

  for (const filename of OPTIONAL_MODEL_FILES) {
    const filePath = path.join(modelDir, filename)
    if (fileExists(filePath)) {
      reportStatus('Archivo opcional encontrado', `${filename}`, 'info')
    }
  }

  const examplePath = path.join(modelDir, 'pass.json.example')
  if (fileExists(examplePath) && !fileExists(path.join(modelDir, 'pass.json'))) {
    reportStatus('Recordatorio', 'Renombra pass.json.example a pass.json con tus datos reales', 'warn')
  }

  if (missing > 0) {
    reportStatus('Resultado', `Faltan ${missing} archivos requeridos`, 'error')
    process.exitCode = 1
  } else {
    reportStatus('Resultado', 'Todos los archivos requeridos están presentes', 'ok')
  }
}

main()

#!/usr/bin/env node

/**
 * Script para generar QR del póster de tienda
 * Uso: node scripts/generate-store-qr.js STORE123
 */

const fs = require('fs')
const path = require('path')
const QRCode = require('qrcode')

const storeCode = process.argv[2]
if (!storeCode) {
  console.error('Uso: node scripts/generate-store-qr.js <STORE_CODE>')
  process.exit(1)
}

// URL de alta (cambiar por tu ngrok URL en producción)
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
const enrollUrl = `${baseUrl}/enroll?s=${storeCode}`

console.log(`Generando QR para tienda: ${storeCode}`)
console.log(`URL: ${enrollUrl}`)

QRCode.toFile(
  path.join(__dirname, '..', 'public', `store-${storeCode}-qr.png`),
  enrollUrl,
  {
    width: 1024,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  },
  (err) => {
    if (err) {
      console.error('Error generando QR:', err)
      process.exit(1)
    }
    console.log(`✅ QR generado: public/store-${storeCode}-qr.png`)
    console.log('Imprime este QR y colócalo en el póster de la tienda.')
  }
)
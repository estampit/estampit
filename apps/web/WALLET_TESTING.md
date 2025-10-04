# 🧪 Testing Wallet Passes en Local

Esta guía te explica cómo probar el sistema de wallet passes completamente en local durante el desarrollo.

## 🚀 Inicio Rápido

1. **Inicia el servidor:**
   ```bash
   cd apps/web
   npm run dev
   ```

2. **Ve a la página de testing:**
   ```
   http://localhost:3001/test-wallet
   ```

3. **Sigue los pasos en la página** para probar todo el flujo.

## 📋 Flujo Completo de Testing

### 1. Registrar un Cliente
- Ve a: `http://localhost:3001/register?businessId=test-business-123`
- Completa el formulario de registro
- El cliente se asociará automáticamente con el negocio

### 2. Dashboard del Cliente
- Después del registro, ve a: `http://localhost:3001/my`
- Verás las tarjetas de fidelización disponibles

### 3. Unirse a una Tarjeta
- Haz clic en "Unirme" en cualquier tarjeta disponible
- Esto crea una `customer_card` en la base de datos

### 4. Generar Wallet Pass
- Una vez unido, haz clic en "Wallet Pass"
- Se genera un código QR y se muestra el componente de descarga

### 5. Descargar y Probar
- Haz clic en "📱 Descargar Pass"
- Se descarga un archivo JSON con la estructura del wallet pass
- Usa este JSON con herramientas de testing

## 🛠️ Herramientas para Testing

### Opción 1: PassSource (Recomendado)
1. Ve a [https://www.passsource.com/](https://www.passsource.com/)
2. Copia el contenido del JSON descargado
3. Pégalo en PassSource
4. Genera el pass
5. Escanea el QR con tu teléfono

### Opción 2: Simulador de iOS (Mac con Xcode)
```bash
# Copia el JSON a un archivo .pass
cp test-wallet-pass.json test.pass

# Abre en simulador
xcrun simctl openurl booted "file://$(pwd)/test.pass"
```

### Opción 3: Script de Testing
```bash
# Ejecuta el script para generar un pass de prueba
node test-wallet.js
```

## 📁 Archivos Importantes

- **`/app/api/wallet/download/route.ts`** - Endpoint que genera el JSON del pass
- **`/app/components/WalletPassQR.tsx`** - Componente que muestra QR y botón de descarga
- **`/app/actions/customer.ts`** - Función `generateWalletPass`
- **`/app/test-wallet/page.tsx`** - Página con instrucciones de testing
- **`test-wallet.js`** - Script para generar passes de prueba

## 🔧 Estructura del Wallet Pass

El JSON generado incluye:
```json
{
  "formatVersion": 1,
  "passTypeIdentifier": "pass.com.mystamp.loyalty",
  "generic": {
    "primaryFields": [{"key": "stamps", "value": "3/10"}],
    "secondaryFields": [{"key": "business", "value": "Café Central"}],
    "auxiliaryFields": [{"key": "reward", "value": "Café gratis"}]
  },
  "barcodes": [{"format": "PKBarcodeFormatQR", "message": "token"}]
}
```

## ⚠️ Notas para Producción

- **Certificados de Apple**: Necesitas certificados de desarrollador de Apple
- **Servidor de Passes**: Apple requiere un servidor web para los passes
- **Firma Digital**: Los passes deben estar firmados criptográficamente
- **Actualizaciones**: Los passes pueden actualizarse vía push notifications

## 🐛 Troubleshooting

### El servidor no inicia
```bash
# Verifica que no haya procesos corriendo en el puerto 3001
lsof -ti:3001 | xargs kill -9

# Reinicia
npm run dev
```

### Error en la base de datos
- Asegúrate de que Supabase esté corriendo
- Verifica las variables de entorno en `.env.local`

### El pass no se descarga
- Revisa la consola del navegador por errores
- Verifica que el token del QR sea válido

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del servidor en la terminal
2. Verifica la consola del navegador (F12)
3. Comprueba que la base de datos tenga datos de prueba
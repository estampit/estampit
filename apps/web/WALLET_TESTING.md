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

### Opción 4: Firmar el JSON con tus certificados
```bash
# Instala la dependencia si aún no lo hiciste
npm install

# Genera el .pkpass a partir del JSON descargado
node scripts/build-wallet-pass.mjs wallet-pass.json ./out/wallet.pkpass
```
Coloca tus certificados en `apps/web/public/pass-assets` o exporta las variables `PASS_WWDR_CERT`, `PASS_SIGNER_CERT`, `PASS_SIGNER_KEY` y `PASS_SIGNER_PASSPHRASE` antes de ejecutar el script.

### Opción 5: Pasar por PassKit (plan gratuito)
1. Crea una cuenta gratuita en [PassKit](https://dashboard.passkit.com/) y define una campaña/membership template.
2. En el dashboard, toma la región (`pub1` para Europa) y las credenciales REST (key/secret) que ya tienes.
3. Guarda las credenciales en un archivo `.env.local` (fuera de git):
  ```bash
  PASSKIT_API_PREFIX=https://api.pub1.passkit.io
  PASSKIT_REST_KEY=3GLlw7ZdriWveuV8A5M3QU
  PASSKIT_REST_SECRET=Guex0OhD2TC8FZq0BPehryiohxwGAk1Jy4BMt59d
  PASSKIT_TEMPLATE_ID=TU_TEMPLATE_ID
  ```
4. Usa el script `scripts/passkit-issue-pass.mjs` (ver abajo) para enviar `wallet-pass.json` y obtener la URL de descarga del pass hospedado por PassKit.
5. Comparte esa URL o el QR generado por PassKit para añadirlo a Wallet sin certificados propios.

> 🔒 **Importante**: nunca subas key/secret a git. Usa `.env.local` o un secret manager.

## � Configurar Apple Wallet en tu cuenta

1. **Paga la membresía Apple Developer (USD 99/año)**
  - Ve a [https://developer.apple.com/programs/enroll/](https://developer.apple.com/programs/enroll/).
  - Inicia sesión con tu Apple ID, completa los datos fiscales y de facturación, y finaliza el pago.
  - Si tu empresa ya tiene una suscripción activa, pide acceso y evita pagos duplicados.

2. **Descarga el certificado WWDR (G4)**
  - Visita [https://www.apple.com/certificateauthority/](https://www.apple.com/certificateauthority/).
  - Descarga “Worldwide Developer Relations – G4.cer”.

3. **Crea un Pass Type ID**
  - En la consola developer ve a **Certificates, IDs & Profiles → Identifiers**.
  - Pulsa **+** → selecciona **Pass Type IDs** → continúa.
  - Define nombre e identifier (p. ej. `pass.com.tuempresa.loyalty`). Guarda.

4. **Genera un CSR en macOS**
  - Abre **Acceso a Llaveros → Asistente de Certificados → Solicitar un certificado de una autoridad**.
  - Usa el correo de la cuenta developer, elige “Guardado en disco”. Obtendrás `pass.csr`.

5. **Emite el certificado del pass**
  - Desde el Pass Type ID creado, entra en **Certificates**.
  - Pulsa **Create Certificate**, sube `pass.csr` y descarga el `.cer` generado (p. ej. `pass-signing.cer`). Ábrelo para añadirlo al llavero; la clave privada queda asociada automáticamente.

6. **Exporta certificados y claves**
  - En Acceso a Llaveros selecciona **Worldwide Developer Relations Certification Authority** → **Archivo → Exportar** → guarda en `.cer`.
  - Selecciona el certificado del Pass Type ID → **Archivo → Exportar** → formato `.p12`, define un password (será tu `PASS_SIGNER_PASSPHRASE`).

7. **Convierte a PEM en terminal**
  ```bash
  # WWDR
  openssl x509 -inform der -in WWDR_G4.cer -out wwdr.pem

  # Certificado y clave del pass
  openssl pkcs12 -in pass-signing.p12 -clcerts -nokeys -out signerCert.pem
  openssl pkcs12 -in pass-signing.p12 -nocerts -out signerKey.pem

  # (Opcional) eliminar passphrase de la clave privada
  openssl rsa -in signerKey.pem -out signerKey.pem
  ```

8. **Coloca los archivos en el proyecto**
  - Copia `wwdr.pem`, `signerCert.pem` y `signerKey.pem` a `apps/web/public/pass-assets/`.
  - Guarda la contraseña del `.p12` en un gestor de secretos y expórtala como `PASS_SIGNER_PASSPHRASE` si la clave privada aún está protegida.

9. **Genera el pass firmado**
  ```bash
  cd /Users/luistorrentenaveira/Documents/STAMPIT
  node scripts/build-wallet-pass.mjs ~/Downloads/wallet-pass.json ./out/wallet.pkpass
  ```
  - El script crea `./out` si no existe. Si tus archivos están en otra ruta, exporta `PASS_WWDR_CERT`, `PASS_SIGNER_CERT`, `PASS_SIGNER_KEY` y `PASS_SIGNER_PASSPHRASE` antes de correrlo.
  - El `.pkpass` generado se puede mandar por AirDrop al iPhone o servirlo desde un endpoint.

  > 🛠️ **Tip**: puedes automatizar la conversión de certificados con `./scripts/setup-wallet-certificates.sh`. Ejecuta:
  > ```bash
  > chmod +x scripts/setup-wallet-certificates.sh
  > ./scripts/setup-wallet-certificates.sh -c ~/Downloads/AppleWWDRCAG4.cer -p ~/Downloads/pass-signing.p12
  > ```
  > Esto genera `wwdr.pem`, `signerCert.pem` y `signerKey.pem` dentro de `apps/web/public/pass-assets/`.

> 📌 **Tip**: guarda los `.pem` y la passphrase fuera del repositorio (Git no debe contenerlos). Usa un secrets manager o tu herramienta de despliegue.

## �📁 Archivos Importantes

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
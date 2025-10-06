# Pass Assets

Coloca aquí los archivos necesarios para generar Apple Wallet passes:

## Archivos requeridos:
- `icon.png` (29x29px) - Ícono del pass
- `icon@2x.png` (58x58px) - Ícono retina
- `logo.png` (opcional) - Logo de la tienda
- `strip.png` (opcional) - Imagen de fondo para storeCard

## Certificados (para desarrollo):
- `wwdr.pem` - Certificado WWDR de Apple
- `signerCert.pem` - Certificado del desarrollador
- `signerKey.pem` - Clave privada
- `signerKeyPassphrase` - Contraseña de la clave (guárdala en `.env.local` o expórtala al correr el script)

Con estos archivos puedes usar el script `scripts/build-wallet-pass.mjs` para convertir el JSON generado por `/api/wallet/download` en un `.pkpass` firmado:

```bash
npm install
node scripts/build-wallet-pass.mjs wallet-pass.json ./salida/MyPass.pkpass
```

Variables de entorno opcionales:

- `PASS_MODEL_DIR`: ruta al directorio con los assets (por defecto `apps/web/public/pass-assets/model`).
- `PASS_WWDR_CERT`, `PASS_SIGNER_CERT`, `PASS_SIGNER_KEY`: rutas personalizadas a los certificados.
- `PASS_SIGNER_PASSPHRASE`: contraseña de la clave privada si no quieres escribirla en la terminal.

Para desarrollo local, puedes crear passes sin certificados usando passkit-generator en modo "demo".

## Generar QR de tienda:
```bash
node scripts/generate-store-qr.js STORE123
```

Esto creará `public/store-STORE123-qr.png` con la URL de registro.
# 🚀 Guía de Prueba - Flujo de Rewards

## 1. Configuración Inicial

### Instalar dependencias
```bash
npm install passkit-generator jsonwebtoken @types/jsonwebtoken
```

### Ejecutar SQL en Supabase
Ejecuta el contenido de `supabase/rewards-schema.sql` en el SQL Editor de Supabase.

### Variables de entorno
Asegúrate de que `.env.local` tenga:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3001
JWT_SECRET=supersecretlocalforrewardsflow123456789
```

## 2. Iniciar servidor
```bash
npm run dev
```

## 3. Generar QR del póster
```bash
node scripts/generate-store-qr.js STORE123
```
Esto crea `public/store-STORE123-qr.png`.

## 4. Prueba en móvil

### Opción A: Local con ngrok
```bash
# Instalar ngrok si no lo tienes
npm install -g ngrok

# Exponer puerto 3001
ngrok http 3001
```
Copia la URL HTTPS (ej: `https://ab12cd34.ngrok.io`).

### Opción B: Usar localhost (solo para desarrollo)

## 5. Flujo de prueba

### Paso 1: Escanear QR del póster
- Abre `public/store-STORE123-qr.png` en tu móvil
- Escanea el QR (o abre la URL directamente)
- Debería llevarte a: `https://TU_NGROK/enroll?s=STORE123`

### Paso 2: Rellenar formulario
- Completa nombre, apellidos, teléfono, email, fecha nacimiento
- Haz clic en "Obtener mi tarjeta"

### Paso 3: Descargar pass
- Se muestra enlace para descargar `.pkpass`
- Descarga y añade a Apple Wallet

### Paso 4: Verificar pass
- Abre el pass en Wallet
- Escanea el QR del pass (o abre la URL del QR)
- Debería registrar el escaneo y actualizar sellos

### Paso 5: Verificar actualización
- Vuelve a descargar el pass desde la app
- Debería mostrar sellos actualizados

## 6. Endpoints para testing

### Registro:
```bash
curl -X POST http://localhost:3001/api/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "+123456789",
    "email": "juan@example.com",
    "birthdate": "1990-01-01",
    "storeCode": "STORE123"
  }'
```

### Verificación (escaneo):
```bash
curl "http://localhost:3001/api/verify?token=JWT_TOKEN_AQUI"
```

### Escaneo manual:
```bash
curl -X POST http://localhost:3001/api/scan \
  -H "Content-Type: application/json" \
  -d '{"token": "JWT_TOKEN_AQUI"}'
```

## 7. Troubleshooting

### Error "Tienda no encontrada"
- Verifica que ejecutaste el SQL y que existe la tienda STORE123

### Error en generación de pass
- Para desarrollo, modifica el código para usar passkit-generator sin certificados
- O crea certificados de desarrollo de Apple

### QR no funciona
- Verifica que NEXT_PUBLIC_SITE_URL esté configurado correctamente
- Para móvil, usa ngrok para HTTPS

### Escaneo no actualiza
- Verifica que el JWT token sea válido
- Revisa logs del servidor para errores

## 8. Criterios de aceptación ✅

- [ ] Escanear QR lleva al formulario correcto
- [ ] Formulario crea cliente y membresía
- [ ] Se descarga pass .pkpass válido
- [ ] Pass muestra campos correctos (sellos restantes, cupones, último escaneo)
- [ ] QR del pass registra escaneo al escanearse
- [ ] Membresía se actualiza correctamente
- [ ] Alcanzar goal de sellos genera cupón
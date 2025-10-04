# Configuración de Supabase para Password Recovery

## Paso 1: Configurar la URL de redirección en Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard/project/ntswpcbywkzekfyrbhdj

2. Ve a **Authentication** → **URL Configuration**

3. En **Site URL**, asegúrate que esté: `http://localhost:3001`

4. En **Redirect URLs**, agrega estas URLs (una por línea):
   ```
   http://localhost:3001/**
   http://localhost:3001/auth/callback
   http://localhost:3001/auth/update-password
   http://localhost:3001/dashboard/owner
   ```

## Paso 2: Configurar el Email Template

1. Ve a **Authentication** → **Email Templates**

2. Selecciona **Reset Password** (o "Change Email Request" dependiendo de tu versión)

3. Reemplaza el contenido del template con esto:

```html
<h2>Restablecer contraseña</h2>

<p>Hola,</p>

<p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>

<p><a href="{{ .SiteURL }}/auth/callback#access_token={{ .Token }}&type=recovery&refresh_token={{ .RefreshToken }}">Restablecer contraseña</a></p>

<p>O copia y pega esta URL en tu navegador:</p>
<p>{{ .SiteURL }}/auth/callback#access_token={{ .Token }}&type=recovery&refresh_token={{ .RefreshToken }}</p>

<p>Si no solicitaste este cambio, puedes ignorar este email.</p>

<p>Este enlace expira en 1 hora.</p>
```

4. Guarda los cambios

## Paso 3: Configurar Email Provider (si aún no lo has hecho)

Si aún estás usando el email provider de Supabase por defecto:
1. Ve a **Project Settings** → **Auth** → **SMTP Settings**
2. Por ahora está bien usar el provider por defecto de Supabase

## Alternativa más simple: Configurar redirect_to en el código

Si no puedes cambiar el template de email, la aplicación ya está configurada para detectar `type=recovery` en el dashboard y redirigir automáticamente.

## Verificar configuración

Después de hacer estos cambios:
1. Ve a http://localhost:3001/login
2. Click "¿Olvidaste tu contraseña?"
3. Ingresa tu email
4. Solicita nuevo link
5. El nuevo link debería llevar a `/auth/callback` y luego a `/auth/update-password`

# 🚀 Guía de Setup - Estampit

Esta guía te ayudará a configurar el proyecto Estampit en tu máquina local usando VS Code.

## 📋 Requisitos Previos

- **Node.js 18+** (recomendado LTS): https://nodejs.org/
- **Git**: https://git-scm.com/downloads
- **VS Code**: https://code.visualstudio.com/
- **Cuenta GitHub** con acceso al repositorio
- **Proyecto Supabase** (o acceso al proyecto compartido)

---

## 1️⃣ Configurar SSH para GitHub (solo la primera vez)

### Generar clave SSH:
```bash
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
```
Presiona Enter 3 veces (ubicación por defecto, sin contraseña).

### Copiar tu clave pública:
```bash
cat ~/.ssh/id_ed25519.pub | pbcopy
```
(En Linux/Windows usa `xclip` o copia manualmente el contenido)

### Añadir en GitHub:
1. Ve a: https://github.com/settings/ssh/new
2. **Title:** "Mi Laptop"
3. **Key:** Pega la clave copiada
4. Click en **"Add SSH key"**

### Verificar conexión:
```bash
ssh -T git@github.com
```
Deberías ver: `Hi tu-usuario! You've successfully authenticated...`

---

## 2️⃣ Clonar el Repositorio

### Opción A: Desde la terminal
```bash
cd ~/Documents  # o la carpeta donde quieras el proyecto
git clone git@github.com:estampit/estampit.git
cd estampit
```

### Opción B: Desde VS Code
1. Abre VS Code
2. Presiona `Cmd+Shift+P` (macOS) o `Ctrl+Shift+P` (Windows/Linux)
3. Escribe: `Git: Clone`
4. Pega: `git@github.com:estampit/estampit.git`
5. Elige carpeta donde clonar
6. Click en **"Open"** cuando termine

---

## 3️⃣ Instalar Dependencias

Abre la terminal integrada en VS Code:
- **macOS:** `Ctrl + ñ` o `View > Terminal`
- **Windows/Linux:** `Ctrl + ñ`

Ejecuta:
```bash
npm install
```

Esto instalará todas las dependencias del `package.json` (~5 min la primera vez).

---

## 4️⃣ Configurar Variables de Entorno (Supabase)

### Crear archivo de configuración local:
```bash
cp .env.example .env.local
```

### Editar `.env.local`:
Abre el archivo `.env.local` en VS Code y rellena:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

### ¿Dónde conseguir las claves?

#### Opción A: Proyecto compartido (pide las claves al dueño)
El owner del proyecto te dará:
- URL del proyecto Supabase
- Anon Key (clave pública, segura compartir)

#### Opción B: Tu propio proyecto Supabase (desarrollo independiente)
1. Ve a: https://supabase.com/dashboard
2. Crea un nuevo proyecto (o usa uno existente)
3. En el proyecto, ve a: **Settings > API**
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

⚠️ **IMPORTANTE:** 
- Nunca subas `.env.local` a GitHub (ya está en `.gitignore`)
- No compartas la clave `service_role` (si la usas en el futuro)

---

## 5️⃣ Configurar Base de Datos (si usas tu propio Supabase)

Si creaste tu propio proyecto Supabase, necesitas aplicar las migraciones SQL:

### Opción A: Desde el Dashboard de Supabase
1. Ve a tu proyecto en https://supabase.com/dashboard
2. Click en **SQL Editor** (menú lateral)
3. Copia y ejecuta cada archivo `.sql` de la carpeta `backend/supabase/migrations/` en orden cronológico:
   - `20251004120000_initial_schema.sql`
   - `20251004120100_rls_policies.sql`
   - ... (todos los archivos en orden)

### Opción B: Usando CLI de Supabase (avanzado)
```bash
# Instalar CLI
brew install supabase/tap/supabase  # macOS
# o
npm install -g supabase  # Cualquier plataforma

# Vincular proyecto
cd backend/supabase
supabase link --project-ref TU_REF_PROYECTO

# Aplicar migraciones
supabase db push
```

---

## 6️⃣ Generar Tipos de TypeScript (opcional pero recomendado)

Esto genera tipos automáticos desde tu base de datos Supabase:

```bash
npm run generate:types
```

Si no funciona, verifica que el script esté en `package.json`:
```json
{
  "scripts": {
    "generate:types": "bash ../../backend/supabase/scripts/gen-types.sh"
  }
}
```

---

## 7️⃣ Arrancar el Proyecto en Desarrollo

```bash
npm run dev
```

Esto levantará el servidor en: **http://localhost:3000**

(Si el puerto 3000 está ocupado, usa: `npm run dev -- --port 3002`)

### Verificar que funciona:
1. Abre http://localhost:3000 en tu navegador
2. Deberías ver la landing page de Estampit
3. Intenta crear una cuenta en `/login`
4. Ve al dashboard de dueño: `/dashboard/owner`

---

## 8️⃣ Extensiones Recomendadas para VS Code

Instala estas extensiones para mejor experiencia:

1. **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`)
2. **Prettier - Code formatter** (`esbenp.prettier-vscode`)
3. **ESLint** (`dbaeumer.vscode-eslint`)
4. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
5. **GitLens** (`eamodio.gitlens`)
6. **Path Intellisense** (`christian-kohler.path-intellisense`)

Para instalarlas rápido, presiona `Cmd+Shift+X` y busca cada una.

---

## 9️⃣ Flujo de Trabajo con Git

### Crear una nueva feature:
```bash
# Asegúrate de estar en main actualizado
git checkout main
git pull origin main

# Crea tu rama
git checkout -b feat/nombre-de-tu-feature

# Haz cambios, añade commits
git add .
git commit -m "feat: descripción de tu cambio"

# Sube tu rama
git push origin feat/nombre-de-tu-feature
```

### Abrir Pull Request:
1. Ve a: https://github.com/estampit/estampit/pulls
2. Click en **"New pull request"**
3. Selecciona tu rama
4. Añade descripción
5. Pide revisión al equipo

### Actualizar tu rama con cambios de main:
```bash
git checkout main
git pull origin main
git checkout tu-rama
git merge main
# Resuelve conflictos si hay
git push
```

---

## 🛠️ Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir build |
| `npm run lint` | Verificar código con ESLint |
| `npm run type-check` | Verificar tipos TypeScript |
| `git status` | Ver estado de cambios |
| `git log --oneline` | Ver historial de commits |
| `git branch -a` | Ver todas las ramas |

---

## 🐛 Solución de Problemas Comunes

### Error: "Missing Supabase env vars"
✅ Verifica que `.env.local` existe y tiene las claves correctas.

### Error: "Cannot find module..."
✅ Ejecuta `npm install` de nuevo.

### Puerto 3000 ocupado
✅ Usa: `npm run dev -- --port 3002`

### No puedo hacer push
✅ Verifica SSH: `ssh -T git@github.com`
✅ Asegúrate de ser colaborador del repo.

### Los tipos de TypeScript no coinciden
✅ Ejecuta: `npm run generate:types`

### Cambios de otro compañero no aparecen
✅ Actualiza tu rama:
```bash
git checkout main
git pull origin main
```

---

## 📚 Recursos Adicionales

- **Documentación Next.js:** https://nextjs.org/docs
- **Documentación Supabase:** https://supabase.com/docs
- **Documentación Tailwind:** https://tailwindcss.com/docs
- **Repositorio GitHub:** https://github.com/estampit/estampit
- **Supabase Dashboard:** https://supabase.com/dashboard

---

## 💡 Tips de Productividad en VS Code

### Atajos de teclado útiles:
- `Cmd+P` → Buscar archivo rápido
- `Cmd+Shift+P` → Paleta de comandos
- `Cmd+B` → Toggle sidebar
- `Cmd+J` → Toggle terminal
- `Cmd+/` → Comentar línea
- `Option+Shift+F` → Formatear documento
- `Cmd+D` → Seleccionar siguiente ocurrencia
- `Cmd+Shift+L` → Seleccionar todas las ocurrencias

### Configuración recomendada (settings.json):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.autoSave": "afterDelay",
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

---

## 🎯 Próximos Pasos

1. ✅ Clona el repo
2. ✅ Instala dependencias
3. ✅ Configura `.env.local`
4. ✅ Arranca el servidor
5. 🚀 Empieza a desarrollar

Si tienes problemas, pregunta en el canal del equipo o abre un issue en GitHub.

**¡Bienvenido al equipo! 🎉**

# Stampit

Plataforma de fidelización (sellos, recompensas, promociones, QR y pases wallet) construida con:

- Next.js (App Router)
- Supabase (Auth + Postgres + RLS + RPC)
- Tailwind CSS
- Recharts / QR Scanner / React Hot Toast

## Estructura

```
app/                # Rutas (marketing, dashboard, join, login, etc.)
app/actions/        # Server Actions (CRUD, RPC wrappers, authz)
app/components/     # Componentes UI y panel dueño
lib/                # Clientes Supabase (browser / server), helpers
public/             # Assets estáticos
types/              # Tipos generados de la base de datos
```

## Requisitos Previos

1. Node 18+ (recomendado LTS)
2. Proyecto Supabase creado
3. Claves públicas copiadas en `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=TU_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

(No subas `.env.local`; ya está en `.gitignore`).

## Instalación

```bash
npm install
```

## Generar Tipos (si cambias el esquema en Supabase)

Si añades un script similar (ajústalo si cambia la ruta):
```bash
npm run generate:types
```
Esto rellena `types/database.types.ts` usando la CLI / script de Supabase.

## Ejecutar en Desarrollo

```bash
npm run dev
```
Por defecto levanta en `http://localhost:3000` (o el puerto que configures con `--port`).

## Flujo de Negocio

- Al entrar a `/dashboard/owner` con sesión: se asegura negocio y loyalty card vía RPC `ensure_business_and_default_card`.
- Se pueden crear / activar / pausar promociones.
- QR: página pública `/join/[businessId]` permite a un cliente unirse y generar su pase.
- Recompensas: generación de tokens de canje y escaneo universal (wallet pass / reward claim).

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| dev | Next dev server |
| build | Build producción |
| start | Servir build |
| lint | Lint Next/ESLint |
| type-check | Revisión TypeScript |
| generate:types | Generar tipos DB (adaptar script backend) |

## Buenas Prácticas

- Nunca subir `SUPABASE_SERVICE_ROLE_KEY` si se añade en el futuro.
- Usar ramas `feat/`, `fix/`, PRs hacia `main`.
- Regenerar tipos tras nuevas migraciones SQL.
- Mantener funciones RPC con `SECURITY DEFINER` auditadas y políticas RLS activas.

## Despliegue (Vercel)

Configurar en Vercel variables de entorno:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Deploy automático al hacer push a `main`.

## Roadmap (breve)

- Cooldowns anti‑abuso de stamping
- Subscription / planes
- Apple / Google Wallet passes nativos
- Batching de métricas consolidado

## Licencia

Propietario / Privado (añade LICENSE si procede).

---
Si necesitas un README en inglés o documentación extendida, abre un issue / PR.

# Supabase Environment Setup

Guía paso a paso para montar y sincronizar el entorno de Supabase (local y remoto) para el proyecto MYSTAMP.

## 1. Pre-requisitos
- macOS / Linux / WSL
- Node.js >= 18 (para Next.js)
- npm o pnpm
- Docker (para usar `supabase start` local)
- Cuenta en https://supabase.com

## 2. Instalar CLI de Supabase
```bash
brew install supabase/tap/supabase  # macOS con Homebrew
# Alternativa:
npm install -g supabase
```
Verifica:
```bash
supabase --version
```

## 3. Estructura de carpetas (relevante)
```
backend/
  supabase/
    migrations/        <-- Todos los archivos *.sql ordenados
    README_SUPABASE.md <-- Este documento
```

## 4. Crear proyecto remoto (dashboard web)
1. Login en Supabase y pulsa "New Project".
2. Elige organización + nombre (ej: mystamp-dev).
3. Selecciona una password para la DB (guárdala segura).
4. Espera a que el proyecto esté listo.
5. En Project Settings > API copia:
   - Project URL -> NEXT_PUBLIC_SUPABASE_URL
   - anon public key -> NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role key (solo para uso server-side) -> SUPABASE_SERVICE_ROLE_KEY

## 5. Archivo de entorno (.env.local)
Crea `apps/web/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...  # (no exponer en el browser)
```
Asegúrate de NO commitear service_role en repos públicos.

## 6. Vincular CLI a proyecto remoto
En la raíz del repo o dentro de `backend/supabase`:
```bash
supabase login            # abre browser
supabase link --project-ref <project-ref> --password <db-password>
```
Esto crea/actualiza `.supabase/config.toml` (si no existe puedes generar con `supabase init`).

> Recomendado: mantén a mano el connection string completo de la _session pooler_ para los comandos que no respetan el archivo `.temp/pooler-url`:

```
postgresql://postgres.<project-ref>:<db-password>@aws-1-<region>.pooler.supabase.com:5432/postgres?pgbouncer=true
```

La variante en puerto `6543` (transaction pooler) funciona para `db pull`/`db push`, pero algunos comandos (`migration repair`, `migration list`) necesitan el parámetro `?pgbouncer=true` y usar el puerto `5432` para evitar errores de prepared statements.

## 7. Extensiones necesarias
La mayoría ya vienen habilitadas (uuid-ossp, pgcrypto). Verifica en SQL Editor:
```sql
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;
```

## 8. Aplicar migraciones (remoto)
Orden recomendado (nuestros archivos ya están numerados):
```bash
# Desde backend/supabase
supabase db push
```
Si prefieres manual:
1. Abre cada archivo en `migrations/` por orden (001 -> 011) y ejecútalo en SQL Editor.

## 9. Ejecutar local (opcional para desarrollo aislado)
```bash
supabase start
# Genera contenedores locales (auth, db, storage, etc.)
```
La CLI crea un `supabase`/. Usa:
```bash
supabase status
supabase stop
```
Para reset local (cuidado, borra datos):
```bash
supabase db reset
```
Esto aplicará de nuevo todas las migraciones.

## 10. Migraciones nuevas
Para añadir una nueva migración SQL:
```bash
# Crear archivo manual con siguiente número, ej: 012_nueva_funcion.sql
# Editar y luego:
supabase db push   # si usas shadow DB
```
O generar base (si quieres que CLI intente diff):
```bash
supabase migration new nombre_corto
# Edita el archivo generado en supabase/migrations/<timestamp>_nombre_corto.sql
```
Nosotros preferimos mantener numeración semántica manual (001, 002, ...).

### Nota sobre formato de migraciones

El CLI de Supabase espera (para algunos comandos como `migration list`) archivos con formato `YYYYMMDDHHMMSS_descripcion.sql`. Al usar `001_...`, `002_...` etc., `supabase migration list` puede no mostrarlos como "Local" y tampoco gestionar estados. Para plena compatibilidad en el futuro podemos:

1. Migrar a formato timestamp (renombrar preservando orden y actualizar histórico). 
2. Mantener los números pero confiar en `db push` / ejecución manual.

Plan sugerido (COMPLETADO): se convirtieron las migraciones 001–013 al formato timestamp (`2025100412xxxx_*.sql`) y se eliminaron las versiones numéricas para que el CLI gestione correctamente el estado. A partir de ahora crear nuevas migraciones usando:

```
supabase migration new <descripcion>
```

o añadiendo manualmente un archivo timestamp válido.


## 11. Testing rápido de funciones clave
Ejecuta en SQL Editor (reemplaza UUIDs):
```sql
select get_business_analytics('<business_id>'::uuid, 30);
select add_stamp_with_promotions('<customer_card_id>'::uuid, '<business_id>'::uuid, 'manual');
select generate_wallet_pass('<business_id>'::uuid, '<customer_card_id>'::uuid);
```

## 12. Reglas RLS chequeo básico
Ver que tablas críticas tienen RLS:
```sql
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('purchases','promotions','wallet_passes','customer_cards','stamps');
```
Debe devolver `true` en `relrowsecurity`.

## 13. Poblar datos mínimos (si no se autogenera)
1. Inicia sesión con un usuario (magic link) → se crea profile.
2. Llama acción `initBusiness` desde UI para crear negocio + loyalty card.
3. Crea clientes desde el dashboard.
4. Genera promoción demo (o usar `seed_demo_promotion`).

## 14. Variables de features / gating
En `subscription_plans.features` definimos JSON como:
```json
{
  "promotions": true,
  "analytics": "advanced",
  "api": true,
  "multi_location": true
}
```
Se consumirá más adelante para mostrar/ocultar módulos.

## 15. Seguridad mínima adicional recomendada
- Rotar service_role key si se expone accidentalmente.
- Activar captchas (si abres registros públicos) desde Auth Settings.
- Configurar policies específicas para futuras tablas (ej: events read solo owner/staff).

## 16. Logs y monitoreo
Supabase dashboard → Logs → Filtra por función (ej: `add_stamp_with_promotions`). Útil para debug de triggers/funciones.

## 17. Despliegues
Cada vez que merges cambios de migraciones:
```bash
supabase db push
# O manualmente desde SQL Editor
```
Mantén la numeración consistente para evitar conflictos.

## 18. Checklist de verificación post-migración
- [ ] `select * from subscription_plans` (3 planes seed) 
- [ ] `select count(*) from businesses` (>=1 tras init)
- [ ] `select * from loyalty_cards` (programa base)
- [ ] Crear un cliente y verificar en `customer_cards`
- [ ] Añadir sello y revisar en `stamps`
- [ ] Crear compra y revisar `purchases` + `events`
- [ ] Generar wallet pass y revisar `wallet_passes`
- [ ] Canjear pass y revisar incremento de sellos + `events`

## 19. Problemas frecuentes
| Issue | Causa | Acción |
|-------|-------|--------|
| add_stamp_with_promotions retorna error `customer_card_not_found` | UUID mal o loyalty card de otro negocio | Verifica IDs y negocio | 
| No se aplican promociones | `is_active=false` o fecha fuera de rango | Revisa `starts_at/ends_at` | 
| Token QR invalido | Pass revocado / business mismatch | Regenerar pass | 
| Purchases no registran | Migraciones 005 u 008 no aplicadas | Reaplicar | 
| `prepared statement ... already exists` en CLI | Te estás conectando al pooler transaccional (6543) sin `pgbouncer=true` | Repite el comando con `--db-url "postgresql://postgres.<ref>:<pwd>@aws-1-<region>.pooler.supabase.com:5432/postgres?pgbouncer=true"` |

## 20. Próximos pasos backend
- Gating runtime por plan (vista materializada o función consolidada de features).
- Expiración y cooldown para wallet passes.
- Endpoint API pública para canjear QR.
- Enriquecer `get_business_analytics` con retención y funnel.

---
Cualquier migración nueva: crea archivo `0NN_descripcion.sql` y mantén un bloque inicial de comentarios indicando propósito y dependencias.

## 21. Sanity Test Automatizado (nuevo)
Hemos añadido `backend/supabase/tests/sanity.sql` que consolida:
- Presencia de tablas clave
- RLS en tablas sensibles
- Funciones críticas
- Planes de suscripción seed
- Conteos básicos

Cómo usar:
1. Abre el archivo y pégalo en el SQL Editor del proyecto → Ejecutar.
2. Revisa cada sección (`section` en la primera columna) para confirmar.

Script helper (`run_sanity.sh`) creado pero limitado (la CLI no ejecuta SQL arbitrario remoto aún). Usa el SQL Editor como fuente de verdad.

## 22. Troubleshooting adicional (DB password / CLI)

- Si el comando `supabase migration list` pide password repetidamente o muestra `password authentication failed for user "postgres" (SQLSTATE 28P01)`, debes resetear la contraseña en el Dashboard (Project Settings → Database) y luego:
  ```bash
  export SUPABASE_DB_PASSWORD='TU_PASSWORD'
  cd backend/supabase
  SUPABASE_DB_PASSWORD=$SUPABASE_DB_PASSWORD supabase migration list
  ```
- Errores `connection refused` iniciales al pooler (puerto 6543) suelen ser transitorios. Reintenta tras unos segundos o prueba el puerto 5432 directo:
  ```bash
  PGPASSWORD=$SUPABASE_DB_PASSWORD psql -h db.<project-ref>.supabase.co -p 5432 -U postgres -d postgres -c 'select 1;'
  ```
- Asegúrate de que sólo exista un set de migraciones activas en `supabase/migrations/`. Archiva duplicados.
- Usa el script helper:
  ```bash
  chmod +x scripts/supabase-reset.sh
  SUPABASE_DB_PASSWORD=$SUPABASE_DB_PASSWORD ./scripts/supabase-reset.sh
  ```
- Si la verificación falla en `get_platform_objects`, confirma que la migración `*_verification_helpers.sql` esté presente y sin errores sintácticos.

## 23. Script de diagnóstico de conectividad

Se añadió `scripts/supabase-diagnose-db.sh` que prueba:
- Varias combinaciones de host (db.<ref>.supabase.co / .net, pooler, etc.)
- Puertos 5432 (directo) y 6543 (pooler)
- Usuarios `postgres` y `postgres.<ref>`

Uso:
```bash
export SUPABASE_DB_PASSWORD='TU_PASSWORD'
./scripts/supabase-diagnose-db.sh
```
El script reporta DNS, autenticación y fallos. Útil para aislar si el problema es password, DNS o pooler.


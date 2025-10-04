#!/usr/bin/env bash
# Aplica las migraciones timestamp directamente contra el pooler transaction
# Usa el usuario postgres.<ref> sobre el puerto 6543 (transaction mode)
# Requiere exportar SUPABASE_DB_PASSWORD con la contraseña EXACTA (incluyendo posible punto final)
set -euo pipefail

PROJECT_REF="ntswpcbywkzekfyrbhdj"
POOLER_HOST="aws-1-eu-west-3.pooler.supabase.com"
POOLER_PORT=6543
PRIMARY_USER="postgres.${PROJECT_REF}"
FALLBACK_USER="postgres"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MIG_DIR="$ROOT_DIR/backend/supabase/supabase/migrations"

if [ -z "${SUPABASE_DB_PASSWORD:-}" ]; then
  echo "[ERROR] Falta SUPABASE_DB_PASSWORD (export SUPABASE_DB_PASSWORD='tuPw')" >&2
  exit 1
fi

if [ ! -d "$MIG_DIR" ]; then
  echo "[ERROR] No existe directorio de migraciones: $MIG_DIR" >&2
  exit 1
fi

# Probar conexión con usuario primario
USER_TO_USE="$PRIMARY_USER"
if ! PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$POOLER_HOST" -p "$POOLER_PORT" -U "$USER_TO_USE" -d postgres -c 'select 1;' -qt >/dev/null 2>&1; then
  echo "[WARN] Falló conexión con usuario $USER_TO_USE. Intentando fallback $FALLBACK_USER"
  USER_TO_USE="$FALLBACK_USER"
  if ! PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$POOLER_HOST" -p "$POOLER_PORT" -U "$USER_TO_USE" -d postgres -c 'select 1;' -qt >/dev/null 2>&1; then
    echo "[ERROR] No se puede autenticar con ninguno de los usuarios ($PRIMARY_USER / $FALLBACK_USER). Revisa password (¿incluye punto final?)." >&2
    exit 2
  fi
fi

echo "[INFO] Usuario efectivo: $USER_TO_USE"

echo "[INFO] Aplicando migraciones en orden..."
APPLIED=0
for f in $(ls -1 "$MIG_DIR"/2025*.sql 2>/dev/null | sort); do
  echo "[APPLY] $f"
  if ! PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -v ON_ERROR_STOP=1 -h "$POOLER_HOST" -p "$POOLER_PORT" -U "$USER_TO_USE" -d postgres -f "$f"; then
    echo "[ERROR] Falló aplicando $f" >&2
    exit 3
  fi
  APPLIED=$((APPLIED+1))

echo "[OK] $f"
  sleep 0.2
done

echo "[INFO] Migraciones aplicadas: $APPLIED"

if [ $APPLIED -eq 0 ]; then
  echo "[WARN] No se encontró ningún archivo 2025*.sql en $MIG_DIR" >&2
fi

# Verificación rápida de la función clave
echo "[INFO] Verificando función get_platform_objects"
if ! PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$POOLER_HOST" -p "$POOLER_PORT" -U "$USER_TO_USE" -d postgres -c "SELECT proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND proname='get_platform_objects';" | grep -q get_platform_objects; then
  echo "[WARN] No se encontró get_platform_objects. Revisa última migración (verification_helpers)." >&2
  exit 4
fi

echo "[SUCCESS] Todas las migraciones procesadas y función detectada. Ejecuta ahora: npm run verify:remote"

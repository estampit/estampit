#!/usr/bin/env bash
# Aplica migraciones usando una cadena de conexión completa (PGURL)
# Ejemplo de uso (NO commitear la password):
#   read -s -p "Password DB: " DBPW; echo
#   export PGURL="postgres://postgres.ntswpcbywkzekfyrbhdj:${DBPW}@aws-1-eu-west-3.pooler.supabase.com:6543/postgres"
#   ./scripts/supabase-apply-url.sh

set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MIG_DIR="$ROOT_DIR/backend/supabase/supabase/migrations"

if [ -z "${PGURL:-}" ]; then
  echo "[ERROR] Define PGURL primero (cadena completa)." >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "[ERROR] psql no está instalado en el PATH." >&2
  exit 2
fi

if [ ! -d "$MIG_DIR" ]; then
  echo "[ERROR] No existe directorio de migraciones: $MIG_DIR" >&2
  exit 3
fi

# Prueba rápida de conexión
if ! psql "$PGURL" -c 'select 1;' -qt >/dev/null 2>&1; then
  echo "[ERROR] No se pudo conectar con PGURL (auth o host). Revisa usuario/password/host/puerto." >&2
  exit 4
fi

echo "[INFO] Conexión OK. Aplicando migraciones..."
APPLIED=0
for f in $(ls -1 "$MIG_DIR"/2025*.sql 2>/dev/null | sort); do
  echo "[APPLY] $f"
  if ! psql "$PGURL" -v ON_ERROR_STOP=1 -f "$f"; then
    echo "[ERROR] Falló aplicando $f" >&2
    exit 5
  fi
  APPLIED=$((APPLIED+1))
  echo "[OK] $f"
  sleep 0.2
done

echo "[INFO] Migraciones aplicadas: $APPLIED"
if [ $APPLIED -eq 0 ]; then
  echo "[WARN] No se encontró ningún archivo de migración (prefijo 2025)." >&2
fi

echo "[INFO] Verificando función get_platform_objects"
if ! psql "$PGURL" -c "SELECT proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND proname='get_platform_objects';" | grep -q get_platform_objects; then
  echo "[WARN] No se encontró get_platform_objects. Revisa última migración." >&2
  exit 6
fi

echo "[SUCCESS] Migraciones y verificación completadas. Ejecuta: npm run verify:remote"

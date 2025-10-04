#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR/backend/supabase"

if [ -z "${SUPABASE_DB_PASSWORD:-}" ]; then
  echo "[ERROR] Falta SUPABASE_DB_PASSWORD (contraseña postgres del proyecto)." >&2
  exit 1
fi

echo "[INFO] Intentando reset remoto vía CLI (sin seed)..."
if ! SUPABASE_DB_PASSWORD="$SUPABASE_DB_PASSWORD" supabase db reset --linked --no-seed --yes; then
  echo "[WARN] Reset via CLI falló. Intentando diagnóstico y fallback."
  POOLER_HOST=$(grep -Eo 'aws-[^ ]+\.pooler\.supabase\.com' supabase/.temp/pooler-url || true)
  if [ -n "${POOLER_HOST:-}" ]; then
    echo "[INFO] Pooler host detectado: $POOLER_HOST"
    echo "[INFO] Probar conexión psql (usuario postgres)..."
    if PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$POOLER_HOST" -p 6543 -U postgres -d postgres -c 'select 1;' >/dev/null 2>&1; then
      echo "[INFO] Conexión psql OK con usuario postgres. Aplicando migraciones manualmente (fallback)."
      MIG_DIR="supabase/migrations"
      for f in $(ls -1 $MIG_DIR/2025*.sql 2>/dev/null); do
        echo "[APPLY] $f"
        if ! PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$POOLER_HOST" -p 6543 -U postgres -d postgres -f "$f"; then
          echo "[ERROR] Falló aplicando $f"; exit 2;
        fi
      done
      echo "[INFO] Migraciones aplicadas en modo fallback."
    else
      echo "[WARN] Conexión directa con usuario 'postgres' falló. Intentando con sufijo de ref."
      # Extraer project ref
      PROJECT_REF=$(cat supabase/.temp/project-ref 2>/dev/null || true)
      if [ -n "${PROJECT_REF:-}" ]; then
        USER_VARIANT="postgres.$PROJECT_REF"
        echo "[INFO] Probando usuario $USER_VARIANT"
        if PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$POOLER_HOST" -p 6543 -U "$USER_VARIANT" -d postgres -c 'select 1;' >/dev/null 2>&1; then
          echo "[INFO] Conexión OK con $USER_VARIANT. Aplicando migraciones fallback."
          MIG_DIR="supabase/migrations"
          for f in $(ls -1 $MIG_DIR/2025*.sql 2>/dev/null); do
            echo "[APPLY] $f"
            if ! PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$POOLER_HOST" -p 6543 -U "$USER_VARIANT" -d postgres -f "$f"; then
              echo "[ERROR] Falló aplicando $f"; exit 3;
            fi
          done
        else
          echo "[ERROR] No se pudo conectar ni con 'postgres' ni con '$USER_VARIANT'. Abortando."; exit 4;
        fi
      else
        echo "[ERROR] No se pudo obtener project-ref para intentar usuario alternativo."; exit 5;
      fi
    fi
  else
    echo "[ERROR] No se detectó pooler host. Abortando."; exit 6;
  fi
fi

echo "[INFO] Listando migraciones (si CLI operativo)..."
SUPABASE_DB_PASSWORD="$SUPABASE_DB_PASSWORD" supabase migration list || echo "[WARN] No se pudo listar migraciones (posible fallo de conexión CLI)."

if [ -d "supabase/migrations" ]; then
  echo "[INFO] Migraciones presentes:" && ls -1 supabase/migrations | sed 's/^/  - /'
fi

echo "[INFO] Generando tipos remotos (si conexión disponible)..."
supabase gen types typescript --linked > remote_types.d.ts 2>/dev/null || echo "[WARN] No se pudieron generar tipos (aún)."

echo "[INFO] Verificando RPC get_platform_objects..."
node ../../scripts/verifyRemote.js || { echo "[WARN] Verificación falló. Revisa logs."; exit 7; }

echo "[SUCCESS] Reset + verificación completados."
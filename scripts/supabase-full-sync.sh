#!/usr/bin/env bash
# Supabase Full Sync Helper
# Intenta detectar una combinación válida (usuario/puerto) y aplicar migraciones.
# Pasos:
# 1. Detecta project-ref
# 2. Prueba matrix de conexiones (transaction/session pooler + usuarios con/sin sufijo)
# 3. Aplica migraciones sólo si falta una tabla clave (businesses)
# 4. Verifica función get_platform_objects
# 5. Genera tipos
# 6. Reporta un resumen final
#
# Requisitos:
#   - SUPABASE_DB_PASSWORD exportada con la contraseña EXACTA (incluyendo posible punto final)
#   - psql instalado
#
# Opcional:
#   PROJECT_REF override manual (export PROJECT_REF=...)
#   POOLER_REGION override (por defecto eu-west-3 si se detecta en host pooler actual)

set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MIG_DIR="$ROOT_DIR/backend/supabase/supabase/migrations"
LOG_FILE="$ROOT_DIR/supabase_full_sync_$(date +%Y%m%d_%H%M%S).log"

info(){ echo -e "[INFO] $*" | tee -a "$LOG_FILE"; }
warn(){ echo -e "[WARN] $*" | tee -a "$LOG_FILE" >&2; }
err(){ echo -e "[ERROR] $*" | tee -a "$LOG_FILE" >&2; }

if [ -z "${SUPABASE_DB_PASSWORD:-}" ]; then
  err "SUPABASE_DB_PASSWORD no exportada."; exit 1
fi

PROJECT_REF_FILE="$ROOT_DIR/backend/supabase/supabase/.temp/project-ref"
if [ -z "${PROJECT_REF:-}" ]; then
  if [ -f "$PROJECT_REF_FILE" ]; then
    PROJECT_REF=$(cat "$PROJECT_REF_FILE" | tr -d '\n' | tr -d '\r')
  else
    err "No se pudo determinar PROJECT_REF (exporta PROJECT_REF=...)."; exit 1
  fi
fi

if [ -z "$PROJECT_REF" ]; then
  err "PROJECT_REF vacío."; exit 1
fi

# Región heurística (basado en lo que vimos: aws-1-eu-west-3)
POOLER_REGION_PART="aws-1-eu-west-3"
POOLER_HOST_BASE="${POOLER_REGION_PART}.pooler.supabase.com"
TRANSACTION_PORT=6543
SESSION_PORT=5432

USERS=("postgres.${PROJECT_REF}" "postgres")
PORTS=($TRANSACTION_PORT $SESSION_PORT)
HOST="$POOLER_HOST_BASE"

info "Project ref: $PROJECT_REF"
info "Pooler host base: $HOST"
info "Probando combinaciones de conexión..."

SUCCESS_DSN=""
SUCCESS_USER=""
SUCCESS_PORT=""
for u in "${USERS[@]}"; do
  for p in "${PORTS[@]}"; do
    printf "[TRY] user=%s port=%s ... " "$u" "$p" | tee -a "$LOG_FILE"
    if PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$HOST" -U "$u" -p "$p" -d postgres -c 'select 1;' -qt >/dev/null 2>&1; then
      echo "OK" | tee -a "$LOG_FILE"
      SUCCESS_DSN="postgres://$u:<PASSWORD>@$HOST:$p/postgres"
      SUCCESS_USER="$u"
      SUCCESS_PORT="$p"
      break 2
    else
      echo "FAIL" | tee -a "$LOG_FILE"
    fi
  done
done

if [ -z "$SUCCESS_DSN" ]; then
  err "No se encontró combinación válida (usuario/puerto). Comprueba password (¿incluye el punto final?)"; exit 2
fi

MASKED_DSN=${SUCCESS_DSN//<PASSWORD>/********}
info "Conexión válida: $MASKED_DSN"

# Comprobar si ya existe tabla clave
TABLE_EXISTS=$(PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$HOST" -U "$SUCCESS_USER" -p "$SUCCESS_PORT" -d postgres -tAc "select 1 from pg_class where relname='businesses' and relkind='r'" || echo "")
if [ "$TABLE_EXISTS" = "1" ]; then
  info "Tabla 'businesses' ya existe. Se asume que migraciones (base) fueron aplicadas. Sólo se re-verificará función."
else
  # Aplicar migraciones
  if [ ! -d "$MIG_DIR" ]; then
    err "No existe directorio de migraciones: $MIG_DIR"; exit 3
  fi
  COUNT=0
  for f in $(ls -1 "$MIG_DIR"/2025*.sql 2>/dev/null | sort); do
    info "Aplicando $f"
    if ! PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -v ON_ERROR_STOP=1 -h "$HOST" -U "$SUCCESS_USER" -p "$SUCCESS_PORT" -d postgres -f "$f" >>"$LOG_FILE" 2>&1; then
      err "Falló $f (ver $LOG_FILE)"; exit 4
    fi
    COUNT=$((COUNT+1))
  done
  info "Migraciones aplicadas: $COUNT"
fi

# Verificar función
FUNC_OK=$(PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "$HOST" -U "$SUCCESS_USER" -p "$SUCCESS_PORT" -d postgres -tAc "select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='get_platform_objects'" || echo "")
if [ "$FUNC_OK" = "1" ]; then
  info "Función get_platform_objects OK"
else
  warn "Función get_platform_objects NO encontrada. Revisa última migración (verification_helpers)."
fi

# Generar tipos (best effort)
if command -v supabase >/dev/null 2>&1; then
  info "Intentando generar tipos (supabase gen types)..."
  if (cd "$ROOT_DIR/backend/supabase" && supabase gen types typescript --linked > remote_types.d.ts 2>>"$LOG_FILE"); then
    info "Tipos generados en backend/supabase/remote_types.d.ts"
  else
    warn "No se pudieron generar tipos (ver logs)."
  fi
else
  warn "CLI supabase no está en PATH. Saltando generación de tipos."
fi

info "Resumen final:" | tee -a "$LOG_FILE"
info "  Usuario: $SUCCESS_USER" | tee -a "$LOG_FILE"
info "  Puerto: $SUCCESS_PORT" | tee -a "$LOG_FILE"
info "  Función get_platform_objects: $( [ "$FUNC_OK" = "1" ] && echo 'OK' || echo 'MISSING')" | tee -a "$LOG_FILE"
info "Log detallado: $LOG_FILE"
info "Ejecuta ahora: npm run verify:remote (desde la raíz)"

exit 0

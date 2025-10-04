#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

REF_FILE="backend/supabase/supabase/.temp/project-ref"
if [ ! -f "$REF_FILE" ]; then
  echo "[ERROR] No se encuentra $REF_FILE" >&2
  exit 1
fi
PROJECT_REF="$(cat "$REF_FILE" | tr -d '\n' | tr -d '\r')"
if [ -z "${PROJECT_REF}" ]; then
  echo "[ERROR] project-ref vacío" >&2
  exit 1
fi

PASS="${SUPABASE_DB_PASSWORD:-}"
if [ -z "$PASS" ]; then
  echo "[WARN] Variable SUPABASE_DB_PASSWORD no exportada (solo se probarán DNS)." >&2
fi

HOSTS=(
  "db.${PROJECT_REF}.supabase.co"
  "db.${PROJECT_REF}.supabase.net"
  "${PROJECT_REF}.supabase.co"
  "${PROJECT_REF}.supabase.net"
  "aws-1-eu-west-3.pooler.supabase.com"
)
PORTS_5432=(5432)
PORTS_6543=(6543)
USERS=("postgres" "postgres.${PROJECT_REF}")

red() { printf "\033[31m%s\033[0m\n" "$1"; }
green() { printf "\033[32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }

printf "== Diagnóstico de hosts para ref %s ==\n" "$PROJECT_REF"

for h in "${HOSTS[@]}"; do
  printf "\n-- Host: %s --\n" "$h"
  if dig +short "$h" >/dev/null 2>&1; then
    IPS=$(dig +short "$h" | tr '\n' ' ')
    if [ -n "$IPS" ]; then
      green "DNS OK -> $IPS"
    else
      yellow "DNS sin respuesta A/AAAA"
      continue
    fi
  else
    red "DNS fallo (dig no resolvió)"; continue
  fi
  # Decide puertos a probar
  PORTS=("5432")
  [[ "$h" == *pooler.supabase.com ]] && PORTS=("6543")
  for p in "${PORTS[@]}"; do
    printf "  * Puerto %s\n" "$p"
    for u in "${USERS[@]}"; do
      if [ -z "$PASS" ]; then
        yellow "    - Usuario $u (omitido: no PASS)"; continue
      fi
      CMD="PGPASSWORD=*** psql -h $h -U $u -p $p -d postgres -c 'select 1;'"
      if PGPASSWORD="$PASS" psql -h "$h" -U "$u" -p "$p" -d postgres -c 'select 1;' -qt >/dev/null 2>&1; then
        green "    - $u autenticación OK"
      else
        red "    - $u fallo auth/conexión"
      fi
    done
  done
done

echo "\nResumen: Si ningún host/usuario funcionó, revisa en el Dashboard la cadena oficial de conexión y compárala."
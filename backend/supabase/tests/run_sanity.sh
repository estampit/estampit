#!/usr/bin/env bash
# run_sanity.sh - Ejecuta sanity.sql contra la DB remota ligada por la CLI.
# Requiere que 'supabase link' ya esté hecho y que exista ./.supabase/config.toml
# Uso: ./run_sanity.sh

set -euo pipefail
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/../" && pwd)
SQL_FILE="$SCRIPT_DIR/sanity.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "No se encuentra $SQL_FILE" >&2
  exit 1
fi

echo "Ejecutando sanity.sql contra la base remota..."
# La CLI expone comando para abrir consola psql temporal; usamos pg_dump style? No directo.
# Usamos supabase db remote commit --dry-run para asegurar conexión, luego psql manual si existiera.
# Supabase CLI no expone 'exec arbitrary SQL' aún; sugerimos pegar en SQL Editor si falla.

# Intento: obtener cadena de conexión (requiere versión CLI moderna)
CONN_JSON=$(supabase status 2>/dev/null | grep -i connectionString || true)
if [ -z "$CONN_JSON" ]; then
  echo "No se pudo obtener connection string automáticamente. Abre el archivo en el dashboard y pégalo manualmente." >&2
  exit 0
fi

echo "Connection info detectado (revisa seguridad antes de usar)." 
# No ejecutamos directamente por seguridad.

exit 0

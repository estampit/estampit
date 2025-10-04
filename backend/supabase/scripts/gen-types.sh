#!/usr/bin/env bash
set -euo pipefail

if ! command -v supabase >/dev/null 2>&1; then
  echo "[ERROR] supabase CLI no encontrado. Instala con: npm install -g supabase" >&2
  exit 1
fi

PROJECT_ID="ntswpcbywkzekfyrbhdj"

# Determine repository root (directory containing this script's parent structure)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../" && pwd)"
OUT_FILE="$REPO_ROOT/backend/supabase/types/database.types.ts"

mkdir -p "$(dirname "$OUT_FILE")"

echo "Generando tipos para proyecto $PROJECT_ID ..."
supabase gen types typescript --project-id "$PROJECT_ID" --schema public > "$OUT_FILE"
echo "Tipos escritos en $OUT_FILE"

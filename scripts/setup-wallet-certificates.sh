#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<EOF
Uso: ./scripts/setup-wallet-certificates.sh -c <WWDR.cer> -p <pass-signing.p12> [-o <directorio-destino>]

Convierte los certificados de Apple Wallet al formato PEM y los copia al directorio de assets del proyecto.

Opciones:
  -c  Ruta al certificado WWDR (formato .cer)
  -p  Ruta al certificado del Pass Type en formato .p12 (exportado desde Acceso a Llaveros)
  -o  Directorio de salida (por defecto apps/web/public/pass-assets)
  -h  Muestra esta ayuda
EOF
}

wwdr_cer=""
pass_p12=""
output_dir="/Users/luistorrentenaveira/Documents/STAMPIT/apps/web/public/pass-assets"

while getopts "c:p:o:h" opt; do
  case "$opt" in
    c) wwdr_cer="$OPTARG" ;;
    p) pass_p12="$OPTARG" ;;
    o) output_dir="$OPTARG" ;;
    h) usage; exit 0 ;;
    *) usage; exit 1 ;;
  esac
done

if [[ -z "$wwdr_cer" || -z "$pass_p12" ]]; then
  usage
  exit 1
fi

if [[ ! -f "$wwdr_cer" ]]; then
  echo "❌ No se encontró el archivo WWDR: $wwdr_cer" >&2
  exit 1
fi

if [[ ! -f "$pass_p12" ]]; then
  echo "❌ No se encontró el archivo .p12: $pass_p12" >&2
  exit 1
fi

mkdir -p "$output_dir"

wwdr_pem="$output_dir/wwdr.pem"
signer_cert_pem="$output_dir/signerCert.pem"
signer_key_pem="$output_dir/signerKey.pem"

openssl x509 -inform der -in "$wwdr_cer" -out "$wwdr_pem"

echo "Introduce la contraseña con la que exportaste el .p12 cuando se solicite."
openssl pkcs12 -in "$pass_p12" -clcerts -nokeys -out "$signer_cert_pem"
openssl pkcs12 -in "$pass_p12" -nocerts -out "$signer_key_pem"

echo "Quieres eliminar la passphrase de la clave privada? (s/n)"
read -r remove_pass
if [[ "$remove_pass" == "s" || "$remove_pass" == "S" ]]; then
  openssl rsa -in "$signer_key_pem" -out "$signer_key_pem"
  echo "🔓 Passphrase eliminada de signerKey.pem"
else
  echo "🔐 Manteniendo la passphrase en signerKey.pem. Recuerda exportarla como PASS_SIGNER_PASSPHRASE al usar el script."
fi

echo "✅ Certificados convertidos y guardados en $output_dir"
echo "   - $wwdr_pem"
echo "   - $signer_cert_pem"
echo "   - $signer_key_pem"
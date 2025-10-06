# Wallet Pass Model Assets

Coloca en este directorio el contenido exacto del paquete `.pass` que Apple espera antes de firmar el wallet pass. Archivos recomendados:

- `pass.json` – definición base del pass (sin firma).
- `icon.png` y `icon@2x.png` – iconos de 29×29 px y 58×58 px.
- `logo.png` – logotipo mostrado en la cabecera.
- `strip.png` / `strip@2x.png` o `background.png` – imagen principal opcional.
- Cualquier otro asset compatible (por ejemplo `thumbnail.png`).

Este directorio se copia tal cual al `.pkpass`, así que evita extensiones innecesarias y mantén la estructura oficial de Apple.

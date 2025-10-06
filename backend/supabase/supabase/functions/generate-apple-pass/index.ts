import { PKPass } from 'npm:passkit-generator';
import { Buffer } from 'node:buffer';

export async function handler(req: Request) {
  try {
    const certBase64 = Deno.env.get('APPLE_PASS_CERT');
    const certPassword = Deno.env.get('APPLE_PASS_KEY');

    if (!certBase64) {
      return new Response(JSON.stringify({ error: 'Cert not found' }), { status: 500 });
    }

    const certBuffer = Buffer.from(certBase64, 'base64');

    // Obtener datos del request (opcional, por ahora hardcodeado)
    const { userId, qrCode, businessName, reward } = await req.json().catch(() => ({}));

    const passModel = {
      "formatVersion": 1,
      "passTypeIdentifier": "pass.com.mystamp.loyalty",
      "serialNumber": userId || "123456789",
      "teamIdentifier": "TU_TEAM_ID", // Reemplaza con tu Team ID de Apple Developer
      "organizationName": businessName || "Mi Negocio",
      "description": "Tarjeta de Fidelización",
      "foregroundColor": "rgb(255, 255, 255)",
      "backgroundColor": "rgb(0, 123, 255)",
      "generic": {
        "primaryFields": [
          {
            "key": "stamps",
            "label": "Sellos",
            "value": "0/10"
          }
        ],
        "secondaryFields": [
          {
            "key": "business",
            "label": "Negocio",
            "value": businessName || "Mi Negocio"
          }
        ],
        "auxiliaryFields": [
          {
            "key": "reward",
            "label": "Recompensa",
            "value": reward || "Café Gratis"
          }
        ]
      },
      "barcodes": [
        {
          "format": "PKBarcodeFormatQR",
          "message": qrCode || "codigo-qr-dinamico",
          "messageEncoding": "iso-8859-1"
        }
      ]
    };

    const pass = new PKPass(passModel, {
      wwdr: 'https://developer.apple.com/certificationauthority/AppleWWDRCAG3.cer',
      signerCert: certBuffer,
      signerKey: certBuffer,
      passphrase: certPassword,
    });

    return new Response(pass.getAsBuffer(), {
      headers: { 'Content-Type': 'application/vnd.apple.pkpass' },
    });
  } catch (error) {
    console.error('Error generating pass:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate pass' }), { status: 500 });
  }
}
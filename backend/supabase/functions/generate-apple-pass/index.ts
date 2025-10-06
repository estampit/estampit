import { PKPass } from 'passkit-generator';
import { Buffer } from 'buffer';

declare const Deno: any;

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

export async function handler(req: Request) {
  try {
    const certBase64 = Deno.env.get('APPLE_PASS_CERT');
    const keyBase64 = Deno.env.get('APPLE_PASS_CERT_KEY');
    const certPassword = Deno.env.get('APPLE_PASS_KEY') ?? '';

    if (!certBase64) {
      return new Response(JSON.stringify({ error: 'Cert not found' }), { status: 500 });
    }

    const signerCert = Buffer.from(certBase64, 'base64');
    const signerKey = keyBase64 ? Buffer.from(keyBase64, 'base64') : signerCert;

    const {
      userId,
      qrCode,
      businessName,
      reward,
      currentStamps,
      stampsRequired
    } = await req.json().catch(() => ({}));

    const safeCurrent = Math.max(0, toNumber(currentStamps, 0));
    const safeRequired = Math.max(0, toNumber(stampsRequired, 0));
    const progression = safeRequired > 0 ? `${safeCurrent}/${safeRequired}` : `${safeCurrent}`;

    const passTypeIdentifier = Deno.env.get('APPLE_PASS_TYPE_IDENTIFIER') || 'pass.com.mystamp.loyalty';
    const teamIdentifier = Deno.env.get('APPLE_PASS_TEAM_ID') || 'TEAM_PLACEHOLDER';
    const organizationName = businessName || Deno.env.get('APPLE_ORGANIZATION_NAME') || 'Stampit';

    const passModel = {
      formatVersion: 1,
      passTypeIdentifier,
      serialNumber: (typeof userId === 'string' && userId.length > 0) ? userId : crypto.randomUUID(),
      teamIdentifier,
      organizationName,
      description: 'Tarjeta de Fidelización',
      foregroundColor: 'rgb(255, 255, 255)',
      backgroundColor: 'rgb(0, 123, 255)',
      generic: {
        primaryFields: [
          {
            key: 'stamps',
            label: 'Sellos',
            value: progression
          }
        ],
        secondaryFields: [
          {
            key: 'business',
            label: 'Negocio',
            value: organizationName
          }
        ],
        auxiliaryFields: [
          {
            key: 'reward',
            label: 'Recompensa',
            value: reward || 'Recompensa disponible'
          }
        ]
      },
      barcodes: [
        {
          format: 'PKBarcodeFormatQR',
          message: qrCode || 'codigo-qr',
          messageEncoding: 'iso-8859-1'
        }
      ]
    };

    const pass = new PKPass(passModel as any, {
      wwdr: 'https://developer.apple.com/certificationauthority/AppleWWDRCAG3.cer',
      signerCert,
      signerKey,
      signerKeyPassphrase: certPassword,
    });

    const buffer = pass.getAsBuffer() as unknown as Uint8Array;
    const filename = `${passModel.serialNumber}.pkpass`;

  return new Response(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${filename}"`
      },
    });
  } catch (error) {
    console.error('Error generating pass:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate pass' }), { status: 500 });
  }
}
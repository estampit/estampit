export const DEFAULT_PASS_TEMPLATE = {
  formatVersion: 1,
  passTypeIdentifier: 'pass.com.mystamp.loyalty',
  description: 'Tarjeta de fidelización',
  organizationName: 'Stampit',
  teamIdentifier: 'TEAM_PLACEHOLDER',
  backgroundColor: 'rgb(30, 58, 138)',
  foregroundColor: 'rgb(255, 255, 255)',
  labelColor: 'rgb(255, 255, 255)',
  generic: {
    primaryFields: [
      {
        key: 'stamps',
        label: 'Sellos',
        value: '0/10'
      }
    ],
    secondaryFields: [
      {
        key: 'business',
        label: 'Negocio',
        value: 'Mi Negocio'
      }
    ],
    auxiliaryFields: [
      {
        key: 'reward',
        label: 'Recompensa',
        value: 'Recompensa especial'
      }
    ]
  },
  backFields: [
    {
      key: 'instructions',
      label: 'Cómo usar',
      value: 'Presenta este pass para acumular sellos y canjear recompensas.'
    }
  ],
  barcodes: [
    {
      format: 'PKBarcodeFormatQR',
      message: 'TOKEN_PLACEHOLDER',
      messageEncoding: 'iso-8859-1'
    }
  ]
} as const

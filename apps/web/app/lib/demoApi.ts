"use client"
// Funciones de modo demo (no persisten nada real)

export function isDemoMode(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.includes('demo_user=1')
}

export async function demoCreateBusiness(name: string) {
  return {
    success: true,
    data: {
      business_id: 'demo-biz-' + Date.now(),
      business: { id: 'demo-biz-' + Date.now(), name: name || 'Demo Negocio' },
      loyalty_card_id: 'demo-card-1'
    }
  }
}

export async function demoUploadBusinessLogo(_businessId: string, _file: File) {
  return { success: true, logo_url: 'https://placehold.co/96x96?text=Logo' }
}

export async function demoTogglePromotion(id: string, active: boolean) {
  return { success: true, id, active }
}

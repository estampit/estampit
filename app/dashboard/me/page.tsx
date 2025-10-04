"use client"
import { useEffect, useState } from 'react'
import { CustomerCardsList } from '@/components/CustomerCardsList'

export default function CustomerDashboardPage() {
  const [demoUser, setDemoUser] = useState<any>(null)
  const [available, setAvailable] = useState<any[]>([])

  useEffect(() => {
    const raw = localStorage.getItem('mystamp_user')
    if (raw) setDemoUser(JSON.parse(raw))
    // Demo cards
    setAvailable([
      { id: 'demo-card-1', name: 'Café 10 Sellos', business_id: 'demo-biz-1', business_name: 'Café Central', stamps_required: 10, reward_description: '1 Café Gratis', customer_card_id: 'cc1', current_stamps: 3 },
      { id: 'demo-card-2', name: 'Brunch 5 Sellos', business_id: 'demo-biz-1', business_name: 'Café Central', stamps_required: 5, reward_description: 'Postre Gratis', customer_card_id: null, current_stamps: null }
    ])
  }, [])

  if (!demoUser) return <div className="p-6">Inicia sesión (demo) para ver tus tarjetas.</div>

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Mis Tarjetas (Demo)</h2>
      <CustomerCardsList available={available} />
    </div>
  )
}

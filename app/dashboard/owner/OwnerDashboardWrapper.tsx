"use client"
import { useEffect, useState } from 'react'
import { OwnerDashboardClient } from '@/components/OwnerDashboardClient'
import { BusinessSetupForm } from '@/components/BusinessSetupForm'
import { getSupabaseClient } from '@/lib/supabaseClient'

export function OwnerDashboardWrapper() {
  const [mode, setMode] = useState<'loading'|'demo'|'ready'|'empty'>('loading')
  const [hasSession, setHasSession] = useState(false)
  const supabase = getSupabaseClient()

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const demoCookie = document.cookie.includes('demo_user=1')
        if (user) {
          setHasSession(true)
          // Si hay sesión real y cookie demo, la borramos y seguimos en real
            if (demoCookie) {
              document.cookie = 'demo_user=1; Max-Age=0; path=/'
            }
          // Comprobar negocio
          const { data: businesses } = await supabase.from('businesses').select('id').eq('owner_id', user.id).limit(1)
          if (businesses && businesses.length) { setMode('ready'); return }
          await supabase.rpc('ensure_business_and_default_card')
          const { data: after } = await supabase.from('businesses').select('id').eq('owner_id', user.id).limit(1)
          if (after && after.length) setMode('ready')
          else setMode('empty')
          return
        }
        // No user -> si cookie demo, modo demo; si no, empty
        if (demoCookie) setMode('demo')
        else setMode('empty')
      } catch {
        setMode('empty')
      }
    })()
  }, [supabase])

  if (mode === 'loading') return <div className="p-6">Cargando...</div>
  if (mode === 'ready') return <div className="p-6"><OwnerDashboardClient /></div>
  if (mode === 'demo') return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Panel del Dueño (Demo)</h2>
        {hasSession && (
          <button
            onClick={() => { document.cookie = 'demo_user=1; Max-Age=0; path=/'; setMode('loading') }}
            className="text-xs underline"
          >Cambiar a sesión real</button>
        )}
      </div>
      <BusinessSetupForm />
      <p className="text-sm text-gray-600">Activa sesión real para ver métricas vivas.</p>
    </div>
  )
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Crear tu Negocio</h2>
      <BusinessSetupForm />
      <p className="text-sm text-gray-600">Crea tu primer negocio para ver el panel completo.</p>
    </div>
  )
}

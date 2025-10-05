"use client"
import { useEffect, useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

export function AuthDebugger() {
  const { user } = useAuth()
  const [businesses, setBusinesses] = useState<any>(null)
  const [bizError, setBizError] = useState<string | null>(null)
  const pathname = usePathname()

  if (pathname === '/' || pathname?.startsWith('/demo')) {
    return null
  }

  useEffect(() => {
    async function loadBusinesses() {
      if (!user) return
      
      const supabase = createClient()
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
      
      setBusinesses(data)
      setBizError(error?.message || null)
    }
    loadBusinesses()
  }, [user])

  const info = {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    businesses,
    bizError,
    cookies: typeof document !== 'undefined' ? document.cookie : ''
  }

  if (!info) return <div className="p-4 text-xs">Cargando debug...</div>

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md shadow-2xl z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debug</h3>
      <div className="space-y-1 font-mono text-[10px]">
        <div>Usuario: {info.hasUser ? '✅' : '❌'}</div>
        {info.hasUser && <div>Email: {info.email}</div>}
        {info.hasUser && <div>ID: {info.userId}</div>}
        <div>Negocios: {info.businesses ? info.businesses.length : 'N/A'}</div>
        {info.bizError && <div className="text-red-400">Error: {info.bizError}</div>}
        {info.businesses && info.businesses.length > 0 && (
          <div>Negocio ID: {info.businesses[0].id}</div>
        )}
      </div>
    </div>
  )
}

"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OwnerDashboardClient } from '@/app/components/OwnerDashboardClient'
import { BusinessSetupForm } from '@/app/components/BusinessSetupForm'
import { useAuth } from '@/app/context/AuthContext'
import { createClient } from '@/lib/supabase/client'

export function OwnerDashboardWrapper() {
  const [businessExists, setBusinessExists] = useState<boolean | null>(null)
  const { user, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.push('/login')
      return
    }

    const checkBusiness = async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking business:', error)
      }

      setBusinessExists(!!data)
    }

    checkBusiness()
  }, [user, loading, router, supabase])

  if (loading || businessExists === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!businessExists) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-2xl w-full mx-auto p-6">
          <h1 className="text-3xl font-bold text-center mb-8">
            Configura tu negocio
          </h1>
          <BusinessSetupForm />
        </div>
      </div>
    )
  }

  return <OwnerDashboardClient />
}

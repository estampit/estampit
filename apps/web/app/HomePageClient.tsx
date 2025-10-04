'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import { Hero } from '../components/Hero'
import Stats from '../components/Stats'
import { Features } from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Pricing from '../components/Pricing'
import { CTA } from '../components/CTA'
import Footer from '../components/Footer'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Detectar si hay parámetros de autenticación en el hash
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const type = hashParams.get('type')
      
      console.log('🏠 HomePage: Detectando hash...', { 
        hasHash: !!window.location.hash,
        hasAccessToken: !!accessToken, 
        type 
      })
      
      // Si hay un access_token, es una redirección de Supabase
      if (accessToken) {
        console.log('🔐 Detectado token de auth en raíz, redirigiendo a callback...')
        // Usar replace para evitar bucles
        window.location.replace('/auth/callback' + window.location.hash)
        return
      }
    }
  }, [router])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}

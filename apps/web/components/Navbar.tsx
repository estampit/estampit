'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'

const Navbar = () => {
  const { user } = useAuth()
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    setHasSession(!!user)
  }, [user])

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              MYSTAMP
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-500 hover:text-gray-900 transition-colors">
              Características
            </a>
            <a href="#how-it-works" className="text-gray-500 hover:text-gray-900 transition-colors">
              Cómo Funciona
            </a>
            <a href="#pricing" className="text-gray-500 hover:text-gray-900 transition-colors">
              Precios
            </a>
            <Link href="/demo" className="text-gray-500 hover:text-gray-900 transition-colors">
              Demo
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {hasSession ? (
              <Link href="/dashboard/owner" className="text-gray-500 hover:text-gray-900 transition-colors">Dashboard</Link>
            ) : (
              <Link href="/login" className="text-gray-500 hover:text-gray-900 transition-colors">Iniciar Sesión</Link>
            )}
            {!hasSession && (
              <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Comenzar Gratis</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
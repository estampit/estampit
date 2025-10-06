"use client"

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      return
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' })
      return
    }

    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
      return
    }

    setMessage({ type: 'success', text: 'Contraseña actualizada exitosamente' })
    setTimeout(() => router.push('/dashboard/owner'), 1500)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Restablecer contraseña
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input id="password" name="password" type="password" required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900"
                placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <input id="confirmPassword" name="confirmPassword" type="password" required
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900"
                placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          {message && (
            <div className={`rounded-md p-4 ${message.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className={`text-sm ${message.type === 'error' ? 'text-red-800' : 'text-green-800'}`}>
                {message.text}
              </p>
            </div>
          )}
          <div>
            <button type="submit" disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
